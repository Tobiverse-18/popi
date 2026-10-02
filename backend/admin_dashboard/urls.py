from django.urls import path

from .views import (
    AdminDashboardView,
    AdminUsersView,
    AdminWithdrawalsView,
    AdminInvestmentsView,
    AdminInvestmentPlanListCreateView,
    AdminInvestmentPlanDetailView,
)

urlpatterns = [
    path(
        "dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard",
    ),

    path(
        "users/",
        AdminUsersView.as_view(),
        name="admin-users",
    ),

    path(
        "withdrawals/",
        AdminWithdrawalsView.as_view(),
        name="admin-withdrawals",
    ),

    path(
        "investments/",
        AdminInvestmentsView.as_view(),
        name="admin-investments",
    ),

    path(
        "investment-plans/",
        AdminInvestmentPlanListCreateView.as_view(),
        name="admin-investment-plans",
    ),

    path(
        "investment-plans/<int:pk>/",
        AdminInvestmentPlanDetailView.as_view(),
        name="admin-investment-plan-detail",
    ),
]