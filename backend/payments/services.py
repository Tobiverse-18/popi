from django.db import transaction
from django.utils import timezone

from transactions.models import Transaction
from wallets.models import LedgerEntry
from wallets.services import credit_wallet

from .models import ManualFundingRequest


@transaction.atomic
def approve_manual_funding(
    funding_request_id,
    admin_user,
    admin_note="",
):
    funding_request = (
        ManualFundingRequest.objects
        .select_for_update()
        .select_related("user")
        .get(id=funding_request_id)
    )

    if funding_request.status != ManualFundingRequest.Status.PENDING:
        raise ValueError(
            "Only pending funding requests can be approved."
        )

    if not funding_request.transaction_hash:
        raise ValueError(
            "A blockchain transaction hash is required."
        )

    wallet = funding_request.user.wallet

    if wallet.currency != funding_request.currency:
        raise ValueError(
            "Funding currency does not match the user's wallet."
        )

    transaction_reference = (
        f"BAL-DEP-{funding_request.id}"
    )

    existing_transaction = Transaction.objects.filter(
        reference=transaction_reference
    ).first()

    if existing_transaction:
        raise ValueError(
            "A deposit transaction already exists for this funding request."
        )

    deposit_transaction = Transaction.objects.create(
        user=funding_request.user,
        transaction_type=Transaction.TransactionType.DEPOSIT,
        status=Transaction.Status.SUCCESS,
        direction=Transaction.Direction.CREDIT,
        currency=funding_request.currency,
        amount=funding_request.amount,
        reference=transaction_reference,
        provider="manual_btc",
        provider_reference=funding_request.transaction_hash,
        description=(
            f"Manual BTC funding "
            f"for funding request #{funding_request.id}"
        ),
    )

    credit_wallet(
        wallet.id,
        funding_request.amount,
        LedgerEntry.EntryType.DEPOSIT,
        description=(
            f"Manual BTC funding "
            f"for {funding_request.user.email}"
        ),
        reference=transaction_reference,
    )

    funding_request.status = (
        ManualFundingRequest.Status.APPROVED
    )

    funding_request.reviewed_by = admin_user
    funding_request.reviewed_at = timezone.now()
    funding_request.admin_note = admin_note

    funding_request.save(
        update_fields=[
            "status",
            "reviewed_by",
            "reviewed_at",
            "admin_note",
            "updated_at",
        ]
    )

    return funding_request


@transaction.atomic
def reject_manual_funding(
    funding_request_id,
    admin_user,
    admin_note="",
):
    funding_request = (
        ManualFundingRequest.objects
        .select_for_update()
        .get(id=funding_request_id)
    )

    if funding_request.status != ManualFundingRequest.Status.PENDING:
        raise ValueError(
            "Only pending funding requests can be rejected."
        )

    funding_request.status = (
        ManualFundingRequest.Status.REJECTED
    )

    funding_request.reviewed_by = admin_user
    funding_request.reviewed_at = timezone.now()
    funding_request.admin_note = admin_note

    funding_request.save(
        update_fields=[
            "status",
            "reviewed_by",
            "reviewed_at",
            "admin_note",
            "updated_at",
        ]
    )

    return funding_request