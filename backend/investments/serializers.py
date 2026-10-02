from decimal import Decimal

from rest_framework import serializers

from .models import (
    Investment,
    InvestmentCategory,
    InvestmentPlan,
)


class InvestmentCategorySerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = InvestmentCategory

        fields = (
            "id",
            "name",
            "slug",
            "description",
            "currency",
            "status",
            "created_at",
        )

        read_only_fields = (
            "id",
            "status",
            "created_at",
        )


class InvestmentPlanSerializer(
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
        )

        read_only_fields = (
            "id",
            "category_name",
            "category_slug",
            "currency",
            "status",
            "created_at",
        )


class InvestmentSerializer(
    serializers.ModelSerializer
):
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

    class Meta:
        model = Investment

        fields = (
            "id",
            "reference",
            "plan",
            "plan_name",
            "category_name",
            "category_slug",
            "currency",
            "principal_amount",
            "return_amount",
            "total_amount",
            "duration_days",
            "start_date",
            "maturity_date",
            "status",
            "created_at",
        )

        read_only_fields = (
            "id",
            "reference",
            "plan_name",
            "category_name",
            "category_slug",
            "currency",
            "principal_amount",
            "return_amount",
            "total_amount",
            "duration_days",
            "start_date",
            "maturity_date",
            "status",
            "created_at",
        )


class CreateInvestmentSerializer(
    serializers.Serializer
):
    plan = serializers.IntegerField()

    amount = serializers.DecimalField(
        max_digits=20,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )