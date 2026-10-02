from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q


class Transaction(models.Model):
    class TransactionType(models.TextChoices):
        DEPOSIT = "deposit", "Deposit"
        WITHDRAWAL = "withdrawal", "Withdrawal"
        INVESTMENT = "investment", "Investment"
        MATURITY = "maturity", "Investment Maturity"
        REFUND = "refund", "Refund"
        FEE = "fee", "Fee"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"

    class Direction(models.TextChoices):
        CREDIT = "credit", "Credit"
        DEBIT = "debit", "Debit"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="transactions",
    )

    transaction_type = models.CharField(
        max_length=20,
        choices=TransactionType.choices,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    direction = models.CharField(
        max_length=10,
        choices=Direction.choices,
    )

    currency = models.CharField(
        max_length=3,
        default="USD",
    )

    amount = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01"))
        ],
    )

    approved_amount = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True,
    )

    destination = models.CharField(
        max_length=255,
        blank=True,
    )

    admin_note = models.TextField(
        blank=True,
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reviewed_transactions",
        null=True,
        blank=True,
    )

    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    reference = models.CharField(
        max_length=100,
        unique=True,
    )

    provider = models.CharField(
        max_length=50,
        blank=True,
    )

    provider_reference = models.CharField(
        max_length=150,
        blank=True,
        db_index=True,
    )

    description = models.CharField(
        max_length=255,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

        indexes = [
            models.Index(
                fields=["user", "-created_at"]
            ),
            models.Index(
                fields=["status", "-created_at"]
            ),
            models.Index(
                fields=["transaction_type", "-created_at"]
            ),
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "provider",
                    "provider_reference",
                ],
                condition=Q(
                    provider_reference__gt=""
                ),
                name="unique_provider_reference",
            ),
        ]

    def __str__(self):
        return (
            f"{self.user.email} - "
            f"{self.transaction_type} - "
            f"{self.amount}"
        )