from django import forms
from django.contrib import admin
from django.db import transaction
from django.utils import timezone

from transactions.models import Transaction
from wallets.models import LedgerEntry, Wallet

from .models import (
    ManualFundingRequest,
    PaymentConfiguration,
)


class ManualFundingRequestAdminForm(
    forms.ModelForm
):
    class Meta:
        model = ManualFundingRequest
        fields = "__all__"

    def clean(self):
        cleaned_data = super().clean()

        status = cleaned_data.get("status")
        approved_amount = cleaned_data.get(
            "approved_amount"
        )

        if (
            status
            == ManualFundingRequest.Status.APPROVED
            and approved_amount is None
        ):
            self.add_error(
                "approved_amount",
                "Enter the actual verified amount before approving this funding request.",
            )

        elif (
            status
            == ManualFundingRequest.Status.APPROVED
            and approved_amount is not None
            and approved_amount <= 0
        ):
            self.add_error(
                "approved_amount",
                "Approved amount must be greater than zero.",
            )

        return cleaned_data


@admin.register(ManualFundingRequest)
class ManualFundingRequestAdmin(
    admin.ModelAdmin
):
    form = ManualFundingRequestAdminForm

    list_display = (
        "reference",
        "user",
        "amount",
        "approved_amount",
        "currency",
        "crypto_currency",
        "status",
        "created_at",
        "reviewed_at",
    )

    list_filter = (
        "status",
        "currency",
        "crypto_currency",
        "created_at",
    )

    search_fields = (
        "reference",
        "user__email",
        "user__username",
    )

    readonly_fields = (
        "reference",
        "user",
        "amount",
        "currency",
        "crypto_currency",
        "wallet_address",
        "screenshot",
        "reviewed_by",
        "reviewed_at",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    @transaction.atomic
    def save_model(
        self,
        request,
        obj,
        form,
        change,
    ):
        was_approved = False

        if change:
            old_obj = (
                ManualFundingRequest.objects
                .select_for_update()
                .get(pk=obj.pk)
            )

            was_approved = (
                old_obj.status
                == ManualFundingRequest
                .Status
                .APPROVED
            )

        is_now_approved = (
            obj.status
            == ManualFundingRequest
            .Status
            .APPROVED
        )

        if (
            is_now_approved
            and not was_approved
        ):
            wallet = (
                Wallet.objects
                .select_for_update()
                .get(user=obj.user)
            )

            wallet.balance += (
                obj.approved_amount
            )

            wallet.save(
                update_fields=[
                    "balance",
                    "updated_at",
                ]
            )

            ledger_reference = (
                f"FUND-{obj.reference}"
            )

            if not LedgerEntry.objects.filter(
                reference=ledger_reference
            ).exists():
                LedgerEntry.objects.create(
                    wallet=wallet,
                    currency=obj.currency,
                    entry_type=(
                        LedgerEntry
                        .EntryType
                        .DEPOSIT
                    ),
                    direction=(
                        LedgerEntry
                        .Direction
                        .CREDIT
                    ),
                    amount=obj.approved_amount,
                    balance_after=wallet.balance,
                    reference=ledger_reference,
                    description=(
                        "Manual crypto funding"
                    ),
                )

            transaction_exists = (
                Transaction.objects.filter(
                    provider="manual_crypto",
                    provider_reference=obj.reference,
                ).exists()
            )

            if not transaction_exists:
                Transaction.objects.create(
                    user=obj.user,
                    transaction_type=(
                        Transaction
                        .TransactionType
                        .DEPOSIT
                    ),
                    status=(
                        Transaction
                        .Status
                        .SUCCESS
                    ),
                    direction=(
                        Transaction
                        .Direction
                        .CREDIT
                    ),
                    currency=obj.currency,
                    amount=obj.approved_amount,
                    reference=obj.reference,
                    provider="manual_crypto",
                    provider_reference=obj.reference,
                    description=(
                        "Manual crypto funding"
                    ),
                )

            obj.reviewed_by = request.user
            obj.reviewed_at = timezone.now()

        super().save_model(
            request,
            obj,
            form,
            change,
        )


@admin.register(PaymentConfiguration)
class PaymentConfigurationAdmin(
    admin.ModelAdmin
):
    list_display = (
        "bitcoin_address",
        "is_active",
        "updated_at",
    )

    list_filter = (
        "is_active",
    )

    readonly_fields = (
        "updated_at",
    )