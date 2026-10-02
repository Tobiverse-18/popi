from django.urls import path

from .views import (
    InvestmentCategoryListView,
    InvestmentCreateView,
    InvestmentDetailView,
    InvestmentListView,
    InvestmentPlanListView,
)


urlpatterns = [
    path(
        "categories/",
        InvestmentCategoryListView.as_view(),
        name="investment-categories",
    ),

    path(
        "plans/",
        InvestmentPlanListView.as_view(),
        name="investment-plans",
    ),

    path(
        "",
        InvestmentListView.as_view(),
        name="investment-list",
    ),

    path(
        "create/",
        InvestmentCreateView.as_view(),
        name="investment-create",
    ),

    path(
        "<str:reference>/",
        InvestmentDetailView.as_view(),
        name="investment-detail",
    ),
]