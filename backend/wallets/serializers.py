from rest_framework import serializers

from .models import LedgerEntry, Wallet


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = (
            "id",
            "currency",
            "balance",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class LedgerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LedgerEntry
        fields = (
            "id",
            "currency",
            "entry_type",
            "direction",
            "amount",
            "balance_after",
            "reference",
            "description",
            "created_at",
        )
        read_only_fields = fields