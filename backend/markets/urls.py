from django.urls import path

from .views import MarketDataView


urlpatterns = [
    path("", MarketDataView.as_view(), name="market-data"),
]