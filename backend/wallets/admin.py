from django.contrib import admin

from .models import LedgerEntry, Wallet


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "currency",
        "balance",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "user__email",
        "user__phone_number",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = (
        "wallet",
        "entry_type",
        "direction",
        "amount",
        "balance_after",
        "reference",
        "created_at",
    )

    list_filter = (
        "entry_type",
        "direction",
    )

    search_fields = (
        "wallet__user__email",
        "reference",
        "description",
    )

    readonly_fields = (
        "created_at",
    )