from django.contrib.auth import get_user_model

from rest_framework import serializers

from investments.models import (
    Investment,
    InvestmentPlan,
)

from transactions.models import Transaction


User = get_user_model()


# =========================================================
# ADMIN USER SERIALIZER
# =========================================================

class AdminUserSerializer(serializers.ModelSerializer):
    wallet_balance = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = (
            "id",
            "username",
            "email",
            "phone_number",
            "role",
            "email_verified",
            "is_kyc_verified",
            "is_active",
            "is_staff",
            "date_joined",
            "created_at",
            "wallet_balance",
        )

        read_only_fields = fields

    def get_wallet_balance(self, obj):
        wallet = getattr(obj, "wallet", None)

        if wallet is None:
            return "0.00"

        return str(wallet.balance)


# =========================================================
# ADMIN WITHDRAWAL SERIALIZER
# =========================================================

class AdminWithdrawalSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = Transaction

        fields = (
            "id",
            "reference",
            "user",
            "username",
            "user_email",
            "transaction_type",
            "status",
            "direction",
            "currency",
            "amount",
            "destination",
            "description",
            "provider",
            "provider_reference",
            "created_at",
            "updated_at",
        )

        read_only_fields = fields


# =========================================================
# ADMIN INVESTMENT SERIALIZER
# =========================================================

class AdminInvestmentSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    plan_name = serializers.CharField(
        source="plan.name",
        read_only=True,
    )

    category_name = serializers.CharField(
        source="plan.category.name",
        read_only=True,
    )

    category_slug = serializers.CharField(
        source="plan.category.slug",
        read_only=True,
    )

    duration_days = serializers.IntegerField(
        source="plan.duration_days",
        read_only=True,
    )

    return_rate = serializers.DecimalField(
        source="plan.return_rate",
        max_digits=7,
        decimal_places=4,
        allow_null=True,
        read_only=True,
    )

    class Meta:
        model = Investment

        fields = (
            "id",
            "reference",

            "user",
            "username",
            "user_email",

            "plan",
            "plan_name",

            "category_name",
            "category_slug",

            "currency",

            "principal_amount",
            "return_amount",
            "total_amount",

            "duration_days",
            "return_rate",

            "start_date",
            "maturity_date",

            "status",

            "created_at",
            "updated_at",
        )

        read_only_fields = fields


# =========================================================
# ADMIN INVESTMENT PLAN SERIALIZER
# =========================================================

class AdminInvestmentPlanSerializer(
    serializers.ModelSerializer
):
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    category_slug = serializers.CharField(
        source="category.slug",
        read_only=True,
    )

    currency = serializers.CharField(
        source="category.currency",
        read_only=True,
    )

    class Meta:
        model = InvestmentPlan

        fields = (
            "id",
            "category",
            "category_name",
            "category_slug",
            "name",
            "description",
            "currency",
            "minimum_amount",
            "maximum_amount",
            "duration_days",
            "return_rate",
            "status",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "category_name",
            "category_slug",
            "currency",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        minimum_amount = attrs.get(
            "minimum_amount",
            getattr(
                self.instance,
                "minimum_amount",
                None,
            ),
        )

        maximum_amount = attrs.get(
            "maximum_amount",
            getattr(
                self.instance,
                "maximum_amount",
                None,
            ),
        )

        duration_days = attrs.get(
            "duration_days",
            getattr(
                self.instance,
                "duration_days",
                None,
            ),
        )

        return_rate = attrs.get(
            "return_rate",
            getattr(
                self.instance,
                "return_rate",
                None,
            ),
        )

        # -------------------------------------------------
        # Maximum amount validation
        # -------------------------------------------------

        if (
            maximum_amount is not None
            and minimum_amount is not None
            and maximum_amount < minimum_amount
        ):
            raise serializers.ValidationError(
                {
                    "maximum_amount": (
                        "Maximum amount cannot be lower "
                        "than minimum amount."
                    )
                }
            )

        # -------------------------------------------------
        # Duration validation
        # -------------------------------------------------

        if (
            duration_days is not None
            and duration_days <= 0
        ):
            raise serializers.ValidationError(
                {
                    "duration_days": (
                        "Duration must be greater than zero."
                    )
                }
            )

        # -------------------------------------------------
        # Return rate validation
        # -------------------------------------------------

        if (
            return_rate is not None
            and return_rate < 0
        ):
            raise serializers.ValidationError(
                {
                    "return_rate": (
                        "Return rate cannot be negative."
                    )
                }
            )

        return attrs