from django.contrib import admin

from .models import (
    Investment,
    InvestmentCategory,
    InvestmentPlan,
)


class InvestmentPlanInline(
    admin.TabularInline
):
    model = InvestmentPlan
    extra = 0
    fields = (
        "name",
        "minimum_amount",
        "maximum_amount",
        "duration_days",
        "return_rate",
        "status",
    )
    ordering = (
        "minimum_amount",
    )


@admin.register(InvestmentCategory)
class InvestmentCategoryAdmin(
    admin.ModelAdmin
):
    list_display = (
        "name",
        "currency",
        "status",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "status",
        "currency",
    )

    search_fields = (
        "name",
        "slug",
        "description",
    )

    prepopulated_fields = {
        "slug": ("name",)
    }

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    inlines = [
        InvestmentPlanInline
    ]

    ordering = (
        "name",
    )


@admin.register(InvestmentPlan)
class InvestmentPlanAdmin(
    admin.ModelAdmin
):
    list_display = (
        "name",
        "category",
        "minimum_amount",
        "maximum_amount",
        "duration_days",
        "return_rate",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "category",
    )

    search_fields = (
        "name",
        "description",
        "category__name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "category",
        "minimum_amount",
    )


@admin.register(Investment)
class InvestmentAdmin(
    admin.ModelAdmin
):
    list_display = (
        "reference",
        "user",
        "category_name",
        "plan_name",
        "principal_amount",
        "return_amount",
        "total_amount",
        "status",
        "start_date",
        "maturity_date",
    )

    list_filter = (
        "status",
        "currency",
        "plan__category",
    )

    search_fields = (
        "reference",
        "user__email",
        "plan__name",
        "plan__category__name",
    )

    readonly_fields = (
        "user",
        "plan",
        "currency",
        "principal_amount",
        "return_amount",
        "total_amount",
        "start_date",
        "maturity_date",
        "reference",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    @admin.display(
        description="Category"
    )
    def category_name(self, obj):
        return obj.plan.category.name

    @admin.display(
        description="Plan"
    )
    def plan_name(self, obj):
        return obj.plan.name