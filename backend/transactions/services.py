from decimal import Decimal
from uuid import uuid4

from django.db import models, transaction
from django.utils import timezone

from wallets.models import LedgerEntry
from wallets.services import credit_wallet

from .models import Transaction


def generate_transaction_reference(prefix="BAL-TXN"):
    return f"{prefix}-{uuid4().hex[:20].upper()}"


@transaction.atomic
def create_transaction(
    user,
    transaction_type,
    direction,
    amount,
    currency="USD",
    status=Transaction.Status.PENDING,
    provider="",
    provider_reference="",
    description="",
    reference=None,
):
    amount = Decimal(str(amount))

    if amount <= 0:
        raise ValueError(
            "Transaction amount must be greater than zero."
        )

    return Transaction.objects.create(
        user=user,
        transaction_type=transaction_type,
        direction=direction,
        amount=amount,
        currency=currency,
        status=status,
        provider=provider,
        provider_reference=provider_reference,
        description=description,
        reference=(
            reference
            or generate_transaction_reference()
        ),
    )


@transaction.atomic
def update_transaction_status(
    transaction_id,
    new_status,
):
    txn = (
        Transaction.objects
        .select_for_update()
        .get(id=transaction_id)
    )

    txn.status = new_status

    txn.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return txn


@transaction.atomic
def create_deposit(
    user,
    amount,
    currency="USD",
    provider="test",
):
    amount = Decimal(str(amount))

    if amount <= 0:
        raise ValueError(
            "Deposit amount must be greater than zero."
        )

    wallet = user.wallet

    if wallet.currency != currency:
        raise ValueError(
            "Deposit currency does not match wallet currency."
        )

    transaction_reference = (
        generate_transaction_reference(
            prefix="BAL-DEP"
        )
    )

    txn = Transaction.objects.create(
        user=user,
        transaction_type=(
            Transaction.TransactionType.DEPOSIT
        ),
        status=Transaction.Status.PENDING,
        direction=(
            Transaction.Direction.CREDIT
        ),
        currency=currency,
        amount=amount,
        reference=transaction_reference,
        provider=provider,
        description="Wallet deposit",
    )

    return txn


@transaction.atomic
def confirm_deposit(
    transaction_id,
    provider_reference,
):
    txn = (
        Transaction.objects
        .select_for_update()
        .select_related("user")
        .get(id=transaction_id)
    )

    if (
        txn.transaction_type
        != Transaction.TransactionType.DEPOSIT
    ):
        raise ValueError(
            "This transaction is not a deposit."
        )

    if txn.status == Transaction.Status.SUCCESS:
        return txn

    if txn.status != Transaction.Status.PENDING:
        raise ValueError(
            "Only pending deposits can be confirmed."
        )

    if not provider_reference:
        raise ValueError(
            "Provider reference is required."
        )

    existing_transaction = (
        Transaction.objects
        .filter(
            provider_reference=provider_reference,
            status=Transaction.Status.SUCCESS,
        )
        .exclude(id=txn.id)
        .first()
    )

    if existing_transaction:
        raise ValueError(
            "This provider payment has already been processed."
        )

    wallet = txn.user.wallet

    if wallet.currency != txn.currency:
        raise ValueError(
            "Transaction currency does not match wallet currency."
        )

    txn.status = Transaction.Status.SUCCESS
    txn.provider_reference = provider_reference

    txn.save(
        update_fields=[
            "status",
            "provider_reference",
            "updated_at",
        ]
    )

    credit_wallet(
        wallet.id,
        txn.amount,
        LedgerEntry.EntryType.DEPOSIT,
        description=(
            f"Wallet deposit {txn.reference}"
        ),
        reference=txn.reference,
    )

    return txn


@transaction.atomic
def create_withdrawal(
    user,
    amount,
    destination,
    currency="USD",
):
    amount = Decimal(str(amount))
    destination = str(destination).strip()
    currency = str(currency).strip().upper()

    if amount <= 0:
        raise ValueError(
            "Withdrawal amount must be greater than zero."
        )

    if not destination:
        raise ValueError(
            "Crypto wallet address is required."
        )

    wallet = (
        user.wallet.__class__.objects
        .select_for_update()
        .get(pk=user.wallet.pk)
    )

    if wallet.currency != currency:
        raise ValueError(
            "Withdrawal currency does not match wallet currency."
        )

    # Money already committed to pending withdrawals.
    pending_withdrawals = (
        Transaction.objects
        .filter(
            user=user,
            transaction_type=(
                Transaction.TransactionType.WITHDRAWAL
            ),
            status=Transaction.Status.PENDING,
            currency=currency,
        )
        .aggregate(
            total=models.Sum("amount")
        )["total"]
        or Decimal("0.00")
    )

    available_balance = (
        wallet.balance - pending_withdrawals
    )

    if amount > available_balance:
        raise ValueError(
            "Insufficient available wallet balance."
        )

    transaction_reference = (
        generate_transaction_reference(
            prefix="BAL-WD"
        )
    )

    # Create the withdrawal as PENDING.
    #
    # The wallet is NOT deducted here.
    # The ledger is NOT updated here.
    txn = Transaction.objects.create(
        user=user,
        transaction_type=(
            Transaction.TransactionType.WITHDRAWAL
        ),
        status=Transaction.Status.PENDING,
        direction=(
            Transaction.Direction.DEBIT
        ),
        currency=currency,
        amount=amount,
        destination=destination,
        reference=transaction_reference,
        description="Crypto wallet withdrawal",
    )

    return txn

@transaction.atomic
def approve_withdrawal(
    transaction_id,
    admin_user,
    admin_note="",
):
    txn = (
        Transaction.objects
        .select_for_update()
        .select_related("user")
        .get(id=transaction_id)
    )

    if (
        txn.transaction_type
        != Transaction.TransactionType.WITHDRAWAL
    ):
        raise ValueError(
            "This transaction is not a withdrawal."
        )

    if txn.status != Transaction.Status.PENDING:
        raise ValueError(
            "Only pending withdrawals can be approved."
        )

    wallet = (
        txn.user.wallet.__class__.objects
        .select_for_update()
        .get(pk=txn.user.wallet.pk)
    )

    if wallet.currency != txn.currency:
        raise ValueError(
            "Withdrawal currency does not match wallet currency."
        )

    if txn.amount > wallet.balance:
        raise ValueError(
            "Insufficient wallet balance to approve this withdrawal."
        )

    new_balance = wallet.balance - txn.amount

    wallet.balance = new_balance

    wallet.save(
        update_fields=[
            "balance",
            "updated_at",
        ]
    )

    LedgerEntry.objects.create(
        wallet=wallet,
        currency=wallet.currency,
        entry_type=LedgerEntry.EntryType.WITHDRAWAL,
        direction=LedgerEntry.Direction.DEBIT,
        amount=txn.amount,
        balance_after=new_balance,
        reference=txn.reference,
        description=(
            f"Approved crypto withdrawal "
            f"{txn.reference}"
        ),
    )

    txn.status = Transaction.Status.SUCCESS
    txn.approved_amount = txn.amount
    txn.reviewed_by = admin_user
    txn.reviewed_at = timezone.now()

    if admin_note:
        txn.admin_note = admin_note.strip()

    txn.save(
        update_fields=[
            "status",
            "approved_amount",
            "reviewed_by",
            "reviewed_at",
            "admin_note",
            "updated_at",
        ]
    )

    return txn

@transaction.atomic
def reject_withdrawal(
    transaction_id,
    admin_user,
    admin_note="",
):
    txn = (
        Transaction.objects
        .select_for_update()
        .get(id=transaction_id)
    )

    if (
        txn.transaction_type
        != Transaction.TransactionType.WITHDRAWAL
    ):
        raise ValueError(
            "This transaction is not a withdrawal."
        )

    if txn.status != Transaction.Status.PENDING:
        raise ValueError(
            "Only pending withdrawals can be rejected."
        )

    txn.status = Transaction.Status.FAILED
    txn.reviewed_by = admin_user
    txn.reviewed_at = timezone.now()

    if admin_note:
        txn.admin_note = admin_note.strip()

    txn.save(
        update_fields=[
            "status",
            "reviewed_by",
            "reviewed_at",
            "admin_note",
            "updated_at",
        ]
    )

    return txn