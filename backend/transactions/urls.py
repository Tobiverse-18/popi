from django.urls import path

from .views import (
    DepositCreateView,
    TransactionDetailView,
    TransactionListView,
    WithdrawalCreateView,
)


urlpatterns = [
    path(
        "",
        TransactionListView.as_view(),
        name="transaction-list",
    ),

    path(
        "deposit/",
        DepositCreateView.as_view(),
        name="transaction-deposit",
    ),

    path(
        "withdraw/",
        WithdrawalCreateView.as_view(),
        name="transaction-withdraw",
    ),

    path(
        "<str:reference>/",
        TransactionDetailView.as_view(),
        name="transaction-detail",
    ),
]