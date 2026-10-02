import secrets

from django.conf import settings
from django.db import models


class ManualFundingRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="funding_requests",
    )

    reference = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
        null=True,
        blank=True,
    )

    amount = models.DecimalField(
        max_digits=20,
        decimal_places=2,
    )

    approved_amount = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True,
    )

    currency = models.CharField(
        max_length=3,
        default="USD",
    )

    crypto_currency = models.CharField(
        max_length=10,
        default="BTC",
    )

    wallet_address = models.CharField(
        max_length=255,
    )

    screenshot = models.ImageField(
        upload_to="funding/screenshots/",
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    admin_note = models.TextField(
        blank=True,
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reviewed_funding_requests",
        null=True,
        blank=True,
    )

    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = (
                "BLZ-FND-"
                + secrets.token_hex(4).upper()
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.user.email} - "
            f"{self.currency} {self.amount} - "
            f"{self.status}"
        )


class PaymentConfiguration(models.Model):
    bitcoin_address = models.CharField(
        max_length=255,
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return "Baloz Payment Configuration"