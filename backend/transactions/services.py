from decimal import Decimal
from uuid import uuid4

from django.db import transaction

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

    if amount > wallet.balance:
        raise ValueError(
            "Insufficient wallet balance."
        )

    transaction_reference = (
        generate_transaction_reference(
            prefix="BAL-WD"
        )
    )

    # Deduct the user's wallet immediately.
    wallet.balance -= amount

    wallet.save(
        update_fields=[
            "balance",
            "updated_at",
        ]
    )

    # Create the withdrawal transaction.
    txn = Transaction.objects.create(
        user=user,
        transaction_type=(
            Transaction.TransactionType.WITHDRAWAL
        ),
        status=Transaction.Status.PROCESSING,
        direction=(
            Transaction.Direction.DEBIT
        ),
        currency=currency,
        amount=amount,
        destination=destination,
        reference=transaction_reference,
        description="Crypto wallet withdrawal",
    )

    # Record the wallet debit in the ledger.
    LedgerEntry.objects.create(
        wallet=wallet,
        currency=currency,
        entry_type=(
            LedgerEntry.EntryType.WITHDRAWAL
        ),
        direction=(
            LedgerEntry.Direction.DEBIT
        ),
        amount=amount,
        balance_after=wallet.balance,
        reference=transaction_reference,
        description=(
            f"Crypto withdrawal {transaction_reference}"
        ),
    )

    return txn