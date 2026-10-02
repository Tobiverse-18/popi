from django.urls import path

from .views import LedgerEntryListView, WalletDetailView


urlpatterns = [
    path(
        "",
        WalletDetailView.as_view(),
        name="wallet-detail",
    ),
    path(
        "ledger/",
        LedgerEntryListView.as_view(),
        name="wallet-ledger",
    ),
]