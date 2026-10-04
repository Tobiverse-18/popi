from django.utils import timezone

from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification

        fields = (
            "id",
            "notification_type",
            "title",
            "message",
            "is_read",
            "read_at",
            "sender_name",
            "created_at",
        )

        read_only_fields = (
            "id",
            "notification_type",
            "is_read",
            "read_at",
            "sender_name",
            "created_at",
        )

    def get_sender_name(self, obj):
        if not obj.sender:
            return "HarvestCoin"

        if obj.sender.first_name:
            return obj.sender.first_name

        return "HarvestCoin"


class AdminNotificationCreateSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Notification

        fields = (
            "title",
            "message",
        )

    def validate_title(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Notification title is required."
            )

        return value

    def validate_message(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Message cannot be empty."
            )

        return value


class NotificationReadSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Notification

        fields = (
            "is_read",
            "read_at",
        )

        read_only_fields = (
            "is_read",
            "read_at",
        )