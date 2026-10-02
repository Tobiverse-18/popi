from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP
from uuid import uuid4

from django.db import transaction
from django.utils import timezone

from transactions.models import Transaction
from wallets.models import LedgerEntry
from wallets.services import debit_wallet

from .models import Investment, InvestmentPlan


def generate_investment_reference():
    return f"BAL-INV-{uuid4().hex[:20].upper()}"


@transaction.atomic
def create_investment(user, plan_id, amount):
    amount = Decimal(str(amount))

    if amount <= 0:
        raise ValueError(
            "Investment amount must be greater than zero."
        )

    plan = (
        InvestmentPlan.objects
        .select_for_update()
        .select_related("category")
        .get(id=plan_id)
    )

    category = plan.category

    if category.status != category.Status.ACTIVE:
        raise ValueError(
            "This investment category is not currently available."
        )

    if plan.status != InvestmentPlan.Status.ACTIVE:
        raise ValueError(
            "This investment plan is not currently available."
        )

    if amount < plan.minimum_amount:
        raise ValueError(
            f"Minimum investment amount is "
            f"{category.currency} {plan.minimum_amount}."
        )

    if (
        plan.maximum_amount is not None
        and amount > plan.maximum_amount
    ):
        raise ValueError(
            f"Maximum investment amount is "
            f"{category.currency} {plan.maximum_amount}."
        )

    wallet = (
        user.wallet.__class__.objects
        .select_for_update()
        .get(pk=user.wallet.pk)
    )

    if wallet.currency != category.currency:
        raise ValueError(
            "Wallet currency does not match the investment currency."
        )

    start_date = timezone.now()

    maturity_date = (
        start_date
        + timedelta(days=plan.duration_days)
    )

    return_amount = Decimal("0.00")

    if plan.return_rate is not None:
        return_amount = (
            amount
            * plan.return_rate
            / Decimal("100")
        ).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

    total_amount = (
        amount + return_amount
    )

    investment = Investment.objects.create(
        user=user,
        plan=plan,
        currency=category.currency,
        principal_amount=amount,
        return_amount=return_amount,
        total_amount=total_amount,
        start_date=start_date,
        maturity_date=maturity_date,
        status=Investment.Status.ACTIVE,
        reference=generate_investment_reference(),
    )

    debit_wallet(
        wallet.id,
        amount,
        LedgerEntry.EntryType.INVESTMENT,
        description=(
            f"Investment in "
            f"{category.name} - {plan.name}"
        ),
        reference=investment.reference,
    )

    Transaction.objects.create(
        user=user,
        transaction_type=Transaction.TransactionType.INVESTMENT,
        status=Transaction.Status.SUCCESS,
        direction=Transaction.Direction.DEBIT,
        currency=category.currency,
        amount=amount,
        approved_amount=amount,
        reference=investment.reference,
        description=(
            f"Investment in "
            f"{category.name} - {plan.name}"
        ),
    )

    return investment