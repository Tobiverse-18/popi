from decimal import Decimal
from uuid import uuid4

from django.db import transaction
from django.db.models import F

from .models import LedgerEntry, Wallet


def generate_reference(prefix="BAL"):
    return f"{prefix}-{uuid4().hex[:20].upper()}"


@transaction.atomic
def credit_wallet(
    wallet_id,
    amount,
    entry_type,
    description="",
    reference=None,
):
    amount = Decimal(str(amount))

    if amount <= 0:
        raise ValueError("Amount must be greater than zero.")

    wallet = Wallet.objects.select_for_update().get(
        id=wallet_id
    )

    wallet.balance = F("balance") + amount
    wallet.save(update_fields=["balance", "updated_at"])

    wallet.refresh_from_db(fields=["balance"])

    ledger_entry = LedgerEntry.objects.create(
        wallet=wallet,
        currency=wallet.currency,
        entry_type=entry_type,
        direction=LedgerEntry.Direction.CREDIT,
        amount=amount,
        balance_after=wallet.balance,
        reference=reference or generate_reference(),
        description=description,
    )

    return ledger_entry


@transaction.atomic
def debit_wallet(
    wallet_id,
    amount,
    entry_type,
    description="",
    reference=None,
):
    amount = Decimal(str(amount))

    if amount <= 0:
        raise ValueError("Amount must be greater than zero.")

    wallet = Wallet.objects.select_for_update().get(
        id=wallet_id
    )

    if wallet.balance < amount:
        raise ValueError("Insufficient wallet balance.")

    wallet.balance = F("balance") - amount
    wallet.save(update_fields=["balance", "updated_at"])

    wallet.refresh_from_db(fields=["balance"])

    ledger_entry = LedgerEntry.objects.create(
        wallet=wallet,
        currency=wallet.currency,
        entry_type=entry_type,
        direction=LedgerEntry.Direction.DEBIT,
        amount=amount,
        balance_after=wallet.balance,
        reference=reference or generate_reference(),
        description=description,
    )

    return ledger_entry