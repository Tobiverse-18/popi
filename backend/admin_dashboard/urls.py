from django.urls import path

from .views import (
    AdminDashboardView,
    AdminUsersView,
    AdminUserDetailView,
    AdminWalletAdjustmentView,
    AdminWithdrawalsView,
    AdminWithdrawalApproveView,
    AdminWithdrawalRejectView,
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
        "users/<int:pk>/",
        AdminUserDetailView.as_view(),
        name="admin-user-detail",
    ),

    path(
        "users/<int:pk>/wallet-adjustment/",
        AdminWalletAdjustmentView.as_view(),
        name="admin-wallet-adjustment",
    ),

    path(
        "withdrawals/",
        AdminWithdrawalsView.as_view(),
        name="admin-withdrawals",
    ),

    path(
        "withdrawals/<int:pk>/approve/",
        AdminWithdrawalApproveView.as_view(),
        name="admin-withdrawal-approve",
    ),

    path(
        "withdrawals/<int:pk>/reject/",
        AdminWithdrawalRejectView.as_view(),
        name="admin-withdrawal-reject",
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