from django.contrib import admin

from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "reference",
        "user",
        "transaction_type",
        "direction",
        "amount",
        "currency",
        "status",
        "provider",
        "created_at",
    )

    list_filter = (
        "transaction_type",
        "direction",
        "status",
        "currency",
        "provider",
    )

    search_fields = (
        "reference",
        "user__email",
        "user__phone_number",
        "provider_reference",
        "description",
    )

    readonly_fields = (
        "reference",
        "created_at",
        "updated_at",
    )

    ordering = ("-created_at",)