from decimal import Decimal

from rest_framework import serializers

from .models import Loan, LoanSettings


class LoanApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = (
            "requested_amount",
            "loan_type",
            "reason",
        )

    def validate_requested_amount(self, value):
        if value <= Decimal("0.00"):
            raise serializers.ValidationError(
                "Loan amount must be greater than zero."
            )

        return value

    def validate_reason(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "A reason for the loan is required."
            )

        return value


class LoanSerializer(serializers.ModelSerializer):
    loan_type_display = serializers.CharField(
        source="get_loan_type_display",
        read_only=True,
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    repayment_status_display = serializers.CharField(
        source="get_repayment_status_display",
        read_only=True,
    )

    interest_amount = serializers.SerializerMethodField()
    total_repayment_amount = serializers.SerializerMethodField()
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = Loan

        fields = (
            "id",
            "requested_amount",
            "approved_amount",
            "loan_type",
            "loan_type_display",
            "reason",
            "status",
            "status_display",
            "application_date",
            "decision_date",
            "reviewed_by",
            "reviewer_name",
            "admin_note",
            "interest_rate",
            "repayment_period_days",
            "due_date",
            "interest_amount",
            "total_repayment_amount",
            "outstanding_balance",
            "repayment_status",
            "repayment_status_display",
            "currency",
            "transaction",
            "created_at",
            "updated_at",
        )

        read_only_fields = fields

    def get_interest_amount(self, obj):
        return str(obj.interest_amount)

    def get_total_repayment_amount(self, obj):
        return str(obj.total_repayment_amount)

    def get_reviewer_name(self, obj):
        if not obj.reviewed_by:
            return None

        if obj.reviewed_by.get_full_name():
            return obj.reviewed_by.get_full_name()

        return obj.reviewed_by.email


class AdminLoanSerializer(LoanSerializer):
    user_email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True,
    )

    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True,
    )

    phone_number = serializers.CharField(
        source="user.phone_number",
        read_only=True,
    )

    wallet_balance = serializers.SerializerMethodField()

    class Meta:
        model = Loan

        fields = LoanSerializer.Meta.fields + (
            "user_email",
            "username",
            "first_name",
            "last_name",
            "phone_number",
            "wallet_balance",
        )

    def get_wallet_balance(self, obj):
        wallet = getattr(obj.user, "wallet", None)

        if not wallet:
            return "0.00"

        return str(wallet.balance)


class LoanEligibilitySerializer(serializers.Serializer):
    is_eligible = serializers.BooleanField()

    wallet_balance = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
    )

    minimum_wallet_balance = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
    )

    amount_needed = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
    )

    loan_applications_enabled = serializers.BooleanField()
    has_pending_application = serializers.BooleanField()
    message = serializers.CharField()


class LoanSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanSettings

        fields = (
            "id",
            "minimum_wallet_balance",
            "is_enabled",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "updated_at",
        )

    def validate_minimum_wallet_balance(self, value):
        if value < Decimal("0.00"):
            raise serializers.ValidationError(
                "Minimum wallet balance cannot be negative."
            )

        return value


class AdminLoanApproveSerializer(serializers.Serializer):
    approved_amount = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )

    interest_rate = serializers.DecimalField(
        max_digits=7,
        decimal_places=4,
        min_value=Decimal("0.00"),
        max_value=Decimal("100.00"),
    )

    repayment_period_days = serializers.IntegerField(
        min_value=1,
    )

    admin_note = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    def validate_admin_note(self, value):
        return value.strip()


class AdminLoanRejectSerializer(serializers.Serializer):
    admin_note = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    def validate_admin_note(self, value):
        return value.strip()