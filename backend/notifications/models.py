from django.conf import settings
from django.db import models


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        ADMIN_MESSAGE = (
            "admin_message",
            "Admin Message",
        )
        SYSTEM = (
            "system",
            "System Notification",
        )
        TRANSACTION = (
            "transaction",
            "Transaction Notification",
        )
        SECURITY = (
            "security",
            "Security Notification",
        )

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_notifications",
    )

    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.ADMIN_MESSAGE,
    )

    title = models.CharField(
        max_length=150,
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False,
        db_index=True,
    )

    read_at = models.DateTimeField(
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
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=[
                    "recipient",
                    "is_read",
                    "-created_at",
                ]
            ),
            models.Index(
                fields=[
                    "recipient",
                    "-created_at",
                ]
            ),
        ]

    def __str__(self):
        return (
            f"{self.recipient.email} - "
            f"{self.title}"
        )