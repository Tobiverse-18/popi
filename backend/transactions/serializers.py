from decimal import Decimal

from rest_framework import serializers

from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = (
            "id",
            "reference",
            "transaction_type",
            "status",
            "direction",
            "currency",
            "amount",
            "approved_amount",
            "destination",
            "admin_note",
            "reviewed_by",
            "reviewed_at",
            "provider",
            "provider_reference",
            "description",
            "created_at",
            "updated_at",
        )

        read_only_fields = fields


class CreateDepositSerializer(serializers.Serializer):
    amount = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )

    currency = serializers.CharField(
        max_length=3,
        default="USD",
    )

    def validate_currency(self, value):
        return value.strip().upper()


class CreateWithdrawalSerializer(serializers.Serializer):
    amount = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )

    destination = serializers.CharField(
        max_length=255,
        allow_blank=False,
        trim_whitespace=True,
    )

    currency = serializers.CharField(
        max_length=3,
        default="USD",
    )

    def validate_currency(self, value):
        return value.strip().upper()

    def validate_destination(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Withdrawal destination is required."
            )

        return value