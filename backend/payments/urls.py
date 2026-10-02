from django.urls import path

from .views import (
    AdminFundingRequestListView,
    FundingConfigurationView,
    FundingRequestApproveView,
    FundingRequestCreateView,
    FundingRequestListView,
    FundingRequestRejectView,
)

urlpatterns = [
    path(
        "funding/config/",
        FundingConfigurationView.as_view(),
        name="funding-config",
    ),

    path(
        "funding/",
        FundingRequestCreateView.as_view(),
        name="funding-create",
    ),

    path(
        "funding/history/",
        FundingRequestListView.as_view(),
        name="funding-history",
    ),

    # Admin funding
    path(
        "admin/funding/",
        AdminFundingRequestListView.as_view(),
        name="admin-funding-list",
    ),

    path(
        "funding/<int:pk>/approve/",
        FundingRequestApproveView.as_view(),
        name="funding-approve",
    ),

    path(
        "funding/<int:pk>/reject/",
        FundingRequestRejectView.as_view(),
        name="funding-reject",
    ),
]