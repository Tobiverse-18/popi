from decimal import Decimal
from uuid import uuid4

from django.db import transaction
from django.utils import timezone

from transactions.models import Transaction
from wallets.models import LedgerEntry, Wallet

from .models import Loan, LoanSettings


def generate_loan_reference():
    return f"HC-LOAN-{uuid4().hex[:20].upper()}"


def get_loan_settings():
    settings, _ = LoanSettings.objects.get_or_create(
        pk=1,
        defaults={
            "minimum_wallet_balance": Decimal("10000.00"),
            "is_enabled": True,
        },
    )

    return settings


@transaction.atomic
def create_loan_application(
    user,
    requested_amount,
    loan_type,
    reason,
):
    requested_amount = Decimal(str(requested_amount))
    loan_type = str(loan_type).strip()
    reason = str(reason).strip()

    if requested_amount <= 0:
        raise ValueError(
            "Loan amount must be greater than zero."
        )

    if not reason:
        raise ValueError(
            "A reason for the loan is required."
        )

    loan_settings = get_loan_settings()

    if not loan_settings.is_enabled:
        raise ValueError(
            "Loan applications are currently unavailable."
        )

    wallet = (
        Wallet.objects
        .select_for_update()
        .get(user=user)
    )

    if wallet.currency != "USD":
        raise ValueError(
            "Loan applications currently require a USD wallet."
        )

    if (
        wallet.balance
        < loan_settings.minimum_wallet_balance
    ):
        raise ValueError(
            "You do not meet the minimum wallet "
            "balance requirement for a loan."
        )

    existing_pending_application = (
        Loan.objects
        .filter(
            user=user,
            status=Loan.Status.PENDING,
        )
        .exists()
    )

    if existing_pending_application:
        raise ValueError(
            "You already have a loan application "
            "awaiting review."
        )

    loan = Loan.objects.create(
        user=user,
        requested_amount=requested_amount,
        loan_type=loan_type,
        reason=reason,
        status=Loan.Status.PENDING,
        currency="USD",
        repayment_status=(
            Loan.RepaymentStatus.NOT_STARTED
        ),
    )

    return loan


@transaction.atomic
def approve_loan(
    loan_id,
    admin_user,
    approved_amount,
    interest_rate,
    repayment_period_days,
    admin_note="",
):
    loan = (
        Loan.objects
        .select_for_update()
        .select_related("user")
        .get(pk=loan_id)
    )

    if loan.status != Loan.Status.PENDING:
        raise ValueError(
            "Only pending loan applications can be approved."
        )

    approved_amount = Decimal(
        str(approved_amount)
    )

    interest_rate = Decimal(
        str(interest_rate)
    )

    repayment_period_days = int(
        repayment_period_days
    )

    admin_note = str(admin_note).strip()

    if approved_amount <= 0:
        raise ValueError(
            "Approved amount must be greater than zero."
        )

    if approved_amount > loan.requested_amount:
        raise ValueError(
            "Approved amount cannot exceed "
            "the requested amount."
        )

    if interest_rate < 0 or interest_rate > 100:
        raise ValueError(
            "Interest rate must be between 0 and 100 percent."
        )

    if repayment_period_days <= 0:
        raise ValueError(
            "Repayment period must be greater than zero."
        )

    wallet = (
        Wallet.objects
        .select_for_update()
        .get(user=loan.user)
    )

    if wallet.currency != loan.currency:
        raise ValueError(
            "Loan currency does not match wallet currency."
        )

    # The wallet must still satisfy the minimum
    # requirement at the time of approval.
    loan_settings = get_loan_settings()

    if (
        wallet.balance
        < loan_settings.minimum_wallet_balance
    ):
        raise ValueError(
            "The user's wallet no longer meets "
            "the minimum loan requirement."
        )

    if loan.transaction_id:
        raise ValueError(
            "This loan already has a transaction."
        )

    # Calculate interest and total repayment.
    interest_amount = (
        approved_amount
        * interest_rate
        / Decimal("100")
    )

    total_repayment = (
        approved_amount
        + interest_amount
    )

    decision_date = timezone.now()

    due_date = (
        decision_date
        + timezone.timedelta(
            days=repayment_period_days
        )
    )

    # Credit the approved loan amount.
    new_balance = (
        wallet.balance
        + approved_amount
    )

    wallet.balance = new_balance

    wallet.save(
        update_fields=[
            "balance",
            "updated_at",
        ]
    )

    transaction_reference = generate_loan_reference()

    loan_transaction = Transaction.objects.create(
        user=loan.user,
        transaction_type=(
            Transaction.TransactionType.LOAN
        ),
        status=Transaction.Status.SUCCESS,
        direction=Transaction.Direction.CREDIT,
        currency=loan.currency,
        amount=approved_amount,
        reference=transaction_reference,
        provider="harvestcoin",
        description=(
            f"Loan disbursement "
            f"for loan #{loan.id}"
        ),
    )

    LedgerEntry.objects.create(
        wallet=wallet,
        currency=wallet.currency,
        entry_type=LedgerEntry.EntryType.ADJUSTMENT,
        direction=LedgerEntry.Direction.CREDIT,
        amount=approved_amount,
        balance_after=new_balance,
        reference=transaction_reference,
        description=(
            f"Approved loan disbursement "
            f"for loan #{loan.id}"
        ),
    )

    loan.status = Loan.Status.APPROVED
    loan.approved_amount = approved_amount
    loan.decision_date = decision_date
    loan.reviewed_by = admin_user
    loan.admin_note = admin_note
    loan.interest_rate = interest_rate
    loan.repayment_period_days = (
        repayment_period_days
    )
    loan.due_date = due_date
    loan.outstanding_balance = total_repayment
    loan.repayment_status = (
        Loan.RepaymentStatus.ACTIVE
    )
    loan.transaction = loan_transaction

    loan.save(
        update_fields=[
            "status",
            "approved_amount",
            "decision_date",
            "reviewed_by",
            "admin_note",
            "interest_rate",
            "repayment_period_days",
            "due_date",
            "outstanding_balance",
            "repayment_status",
            "transaction",
            "updated_at",
        ]
    )

    return loan


@transaction.atomic
def reject_loan(
    loan_id,
    admin_user,
    admin_note="",
):
    loan = (
        Loan.objects
        .select_for_update()
        .get(pk=loan_id)
    )

    if loan.status != Loan.Status.PENDING:
        raise ValueError(
            "Only pending loan applications can be rejected."
        )

    loan.status = Loan.Status.REJECTED
    loan.decision_date = timezone.now()
    loan.reviewed_by = admin_user
    loan.admin_note = str(admin_note).strip()

    loan.save(
        update_fields=[
            "status",
            "decision_date",
            "reviewed_by",
            "admin_note",
            "updated_at",
        ]
    )

    return loan