from django.contrib import admin

from .models import Loan, LoanSettings


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "loan_type",
        "requested_amount",
        "approved_amount",
        "status",
        "repayment_status",
        "application_date",
        "decision_date",
    )

    list_filter = (
        "status",
        "loan_type",
        "repayment_status",
        "application_date",
        "decision_date",
    )

    search_fields = (
        "user__email",
        "user__username",
        "user__first_name",
        "user__last_name",
    )

    readonly_fields = (
        "application_date",
        "decision_date",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Applicant",
            {
                "fields": (
                    "user",
                )
            },
        ),
        (
            "Loan Application",
            {
                "fields": (
                    "requested_amount",
                    "approved_amount",
                    "loan_type",
                    "reason",
                    "currency",
                )
            },
        ),
        (
            "Review",
            {
                "fields": (
                    "status",
                    "reviewed_by",
                    "admin_note",
                    "application_date",
                    "decision_date",
                )
            },
        ),
        (
            "Repayment",
            {
                "fields": (
                    "interest_rate",
                    "repayment_period_days",
                    "due_date",
                    "outstanding_balance",
                    "repayment_status",
                )
            },
        ),
        (
            "System",
            {
                "fields": (
                    "transaction",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


@admin.register(LoanSettings)
class LoanSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "minimum_wallet_balance",
        "is_enabled",
        "updated_at",
    )

    readonly_fields = (
        "updated_at",
    )

    fieldsets = (
        (
            "Loan Eligibility",
            {
                "fields": (
                    "minimum_wallet_balance",
                    "is_enabled",
                )
            },
        ),
        (
            "System",
            {
                "fields": (
                    "updated_at",
                )
            },
        ),
    )