from rest_framework import serializers

from .models import ManualFundingRequest


class ManualFundingRequestSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = ManualFundingRequest

        fields = (
            "id",
            "reference",
            "amount",
            "currency",
            "crypto_currency",
            "wallet_address",
            "screenshot",
            "status",
            "admin_note",
            "reviewed_at",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "reference",
            "currency",
            "crypto_currency",
            "wallet_address",
            "status",
            "admin_note",
            "reviewed_at",
            "created_at",
            "updated_at",
        )

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Amount must be greater than zero."
            )

        return value

    def validate_screenshot(self, value):
        if not value:
            raise serializers.ValidationError(
                "Payment screenshot is required."
            )

        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
        }

        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                "Please upload a JPG, PNG, or WEBP image."
            )

        max_size = 5 * 1024 * 1024

        if value.size > max_size:
            raise serializers.ValidationError(
                "Payment screenshot must be 5MB or smaller."
            )

        return value


from rest_framework import serializers

from .models import ManualFundingRequest


class ManualFundingRequestSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = ManualFundingRequest

        fields = (
            "id",
            "reference",
            "amount",
            "currency",
            "crypto_currency",
            "wallet_address",
            "screenshot",
            "status",
            "admin_note",
            "reviewed_at",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "reference",
            "currency",
            "crypto_currency",
            "wallet_address",
            "status",
            "admin_note",
            "reviewed_at",
            "created_at",
            "updated_at",
        )

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Amount must be greater than zero."
            )

        return value

    def validate_screenshot(self, value):
        if not value:
            raise serializers.ValidationError(
                "Payment screenshot is required."
            )

        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
        }

        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                "Please upload a JPG, PNG, or WEBP image."
            )

        max_size = 5 * 1024 * 1024

        if value.size > max_size:
            raise serializers.ValidationError(
                "Payment screenshot must be 5MB or smaller."
            )

        return value


class AdminFundingRequestSerializer(
    serializers.ModelSerializer
):
    user_email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    reviewed_by_email = serializers.EmailField(
        source="reviewed_by.email",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = ManualFundingRequest

        fields = (
            "id",
            "reference",
            "user",
            "username",
            "user_email",
            "amount",
            "approved_amount",
            "currency",
            "crypto_currency",
            "wallet_address",
            "screenshot",
            "status",
            "admin_note",
            "reviewed_by",
            "reviewed_by_email",
            "reviewed_at",
            "created_at",
            "updated_at",
        )

        read_only_fields = fields