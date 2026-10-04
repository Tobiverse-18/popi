from django.db import transaction
from django.utils import timezone

from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import User

from .models import Notification
from .serializers import (
    AdminNotificationCreateSerializer,
    NotificationSerializer,
)


class NotificationListView(
    generics.ListAPIView
):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    serializer_class = NotificationSerializer

    def get_queryset(self):
        return (
            Notification.objects
            .filter(
                recipient=self.request.user
            )
            .select_related("sender")
            .order_by("-created_at")
        )


class UnreadNotificationCountView(
    APIView
):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):
        unread_count = (
            Notification.objects
            .filter(
                recipient=request.user,
                is_read=False,
            )
            .count()
        )

        return Response(
            {
                "unread_count": unread_count,
            }
        )


class MarkNotificationReadView(
    APIView
):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    @transaction.atomic
    def post(self, request, pk):
        try:
            notification = (
                Notification.objects
                .select_for_update()
                .get(
                    pk=pk,
                    recipient=request.user,
                )
            )
        except Notification.DoesNotExist:
            raise NotFound(
                "Notification not found."
            )

        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()

            notification.save(
                update_fields=[
                    "is_read",
                    "read_at",
                    "updated_at",
                ]
            )

        return Response(
            NotificationSerializer(
                notification
            ).data
        )


class MarkAllNotificationsReadView(
    APIView
):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    @transaction.atomic
    def post(self, request):
        updated_count = (
            Notification.objects
            .filter(
                recipient=request.user,
                is_read=False,
            )
            .update(
                is_read=True,
                read_at=timezone.now(),
                updated_at=timezone.now(),
            )
        )

        return Response(
            {
                "detail": (
                    "All notifications marked as read."
                ),
                "updated_count": updated_count,
            }
        )


class AdminUserNotificationCreateView(
    generics.CreateAPIView
):
    permission_classes = [
        permissions.IsAdminUser
    ]

    serializer_class = (
        AdminNotificationCreateSerializer
    )

    def perform_create(self, serializer):
        user_id = self.kwargs["user_id"]

        try:
            recipient = User.objects.get(
                pk=user_id
            )
        except User.DoesNotExist:
            raise NotFound(
                "User not found."
            )

        serializer.save(
            recipient=recipient,
            sender=self.request.user,
            notification_type=(
                Notification
                .NotificationType
                .ADMIN_MESSAGE
            ),
        )