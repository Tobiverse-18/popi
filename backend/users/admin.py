from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    list_display = (
        "email",
        "username",
        "phone_number",
        "role",
        "email_verified",
        "is_kyc_verified",
        "is_staff",
        "is_active",
        "created_at",
    )

    list_filter = (
        "role",
        "email_verified",
        "is_kyc_verified",
        "is_staff",
        "is_active",
    )

    search_fields = (
        "email",
        "username",
        "phone_number",
    )

    ordering = ("-created_at",)

    fieldsets = UserAdmin.fieldsets + (
        (
            "Baloz Information",
            {
                "fields": (
                    "phone_number",
                    "role",
                    "email_verified",
                    "is_kyc_verified",
                )
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Baloz Information",
            {
                "fields": (
                    "email",
                    "phone_number",
                    "role",
                )
            },
        ),
    )