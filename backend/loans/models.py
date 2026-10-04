from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class Loan(models.Model):
    class LoanType(models.TextChoices):
        PERSONAL = "personal", "Personal"
        BUSINESS = "business", "Business"
        EDUCATION = "education", "Education"
        EMERGENCY = "emergency", "Emergency"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"

    class RepaymentStatus(models.TextChoices):
        NOT_STARTED = "not_started", "Not Started"
        ACTIVE = "active", "Active"
        PARTIALLY_PAID = "partially_paid", "Partially Paid"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="loans",
    )

    requested_amount = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
    )

    approved_amount = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
    )

    loan_type = models.CharField(
        max_length=30,
        choices=LoanType.choices,
    )

    reason = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    application_date = models.DateTimeField(
        auto_now_add=True,
    )

    decision_date = models.DateTimeField(
        null=True,
        blank=True,
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reviewed_loans",
        null=True,
        blank=True,
    )

    admin_note = models.TextField(
        blank=True,
    )

    interest_rate = models.DecimalField(
        max_digits=7,
        decimal_places=4,
        default=Decimal("0.0000"),
        validators=[
            MinValueValidator(Decimal("0.0000")),
            MaxValueValidator(Decimal("100.0000")),
        ],
    )

    repayment_period_days = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    due_date = models.DateTimeField(
        null=True,
        blank=True,
    )

    outstanding_balance = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
    )

    repayment_status = models.CharField(
        max_length=30,
        choices=RepaymentStatus.choices,
        default=RepaymentStatus.NOT_STARTED,
        db_index=True,
    )

    currency = models.CharField(
        max_length=3,
        default="USD",
    )

    transaction = models.OneToOneField(
        "transactions.Transaction",
        on_delete=models.PROTECT,
        related_name="loan",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-application_date"]
        indexes = [
            models.Index(
                fields=["user", "-application_date"]
            ),
            models.Index(
                fields=["status", "-application_date"]
            ),
            models.Index(
                fields=["repayment_status", "due_date"]
            ),
        ]

    def __str__(self):
        return (
            f"{self.user.email} - "
            f"{self.loan_type} - "
            f"{self.requested_amount}"
        )

    @property
    def interest_amount(self):
        if self.approved_amount is None:
            return Decimal("0.00")

        return (
            self.approved_amount
            * self.interest_rate
            / Decimal("100")
        )

    @property
    def total_repayment_amount(self):
        if self.approved_amount is None:
            return Decimal("0.00")

        return (
            self.approved_amount
            + self.interest_amount
        )

class LoanSettings(models.Model):
    minimum_wallet_balance = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=Decimal("10000.00"),
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
    )

    is_enabled = models.BooleanField(
        default=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        verbose_name = "Loan Settings"
        verbose_name_plural = "Loan Settings"

    def __str__(self):
        return "HarvestCoin Loan Settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)