
from rest_framework import serializers

from .models import FundingWallet, ManualFundingRequest


class ManualFundingRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManualFundingRequest

        fields = (
            "id",
            "reference",
            "amount",
            "approved_amount",
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

        # crypto_currency is intentionally writable so the customer
        # can choose BTC or ETH when creating a funding request.
        read_only_fields = (
            "id",
            "reference",
            "approved_amount",
            "currency",
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

    def validate_crypto_currency(self, value):
        value = value.strip().upper()

        if value not in {"BTC", "ETH"}:
            raise serializers.ValidationError(
                "Choose Bitcoin (BTC) or Ethereum (ETH)."
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

        content_type = getattr(value, "content_type", None)

        if content_type not in allowed_types:
            raise serializers.ValidationError(
                "Please upload a JPG, PNG, or WEBP image."
            )

        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "Payment screenshot must be 5MB or smaller."
            )

        return value


class AdminFundingRequestSerializer(serializers.ModelSerializer):
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


class FundingWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundingWallet

        fields = (
            "id",
            "asset",
            "network",
            "address",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def validate_asset(self, value):
        value = value.strip().upper()

        if value not in {"BTC", "ETH"}:
            raise serializers.ValidationError(
                "Only BTC and ETH funding wallets are supported."
            )

        return value

    def validate_address(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Wallet address is required."
            )

        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)

        asset = attrs.get(
            "asset",
            getattr(self.instance, "asset", "BTC"),
        )

        expected_networks = {
            "BTC": "Bitcoin",
            "ETH": "Ethereum Mainnet",
        }

        attrs["asset"] = asset
        attrs["network"] = expected_networks[asset]

        address = attrs.get(
            "address",
            getattr(self.instance, "address", ""),
        )

        if asset == "ETH" and address:
            if (
                len(address) != 42
                or not address.startswith("0x")
                or any(
                    character not in "0123456789abcdefABCDEF"
                    for character in address[2:]
                )
            ):
                raise serializers.ValidationError({
                    "address": (
                        "Enter a valid Ethereum Mainnet address "
                        "starting with 0x."
                    )
                })

        if asset == "BTC" and address:
            if not address.startswith(("bc1", "1", "3")):
                raise serializers.ValidationError({
                    "address": (
                        "Enter a valid Bitcoin mainnet address."
                    )
                })

        return attrs