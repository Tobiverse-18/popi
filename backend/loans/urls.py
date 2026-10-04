from django.urls import path

from .views import (
    AdminLoanApproveView,
    AdminLoanDetailView,
    AdminLoanListView,
    AdminLoanRejectView,
    AdminLoanSettingsView,
    LoanApplicationCreateView,
    LoanDetailView,
    LoanEligibilityView,
    LoanListView,
)

urlpatterns = [
    path(
        "eligibility/",
        LoanEligibilityView.as_view(),
        name="loan-eligibility",
    ),

    path(
        "apply/",
        LoanApplicationCreateView.as_view(),
        name="loan-apply",
    ),

    path(
        "",
        LoanListView.as_view(),
        name="loan-list",
    ),

    path(
        "<int:pk>/",
        LoanDetailView.as_view(),
        name="loan-detail",
    ),

    path(
        "admin/",
        AdminLoanListView.as_view(),
        name="admin-loan-list",
    ),

    path(
        "admin/settings/",
        AdminLoanSettingsView.as_view(),
        name="admin-loan-settings",
    ),

    path(
        "admin/<int:pk>/",
        AdminLoanDetailView.as_view(),
        name="admin-loan-detail",
    ),

    path(
        "admin/<int:pk>/approve/",
        AdminLoanApproveView.as_view(),
        name="admin-loan-approve",
    ),

    path(
        "admin/<int:pk>/reject/",
        AdminLoanRejectView.as_view(),
        name="admin-loan-reject",
    ),
]