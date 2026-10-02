from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .services.market_service import get_market_data


class MarketDataView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            markets = get_market_data()

            return Response(
                {
                    "markets": markets,
                }
            )

        except Exception as error:
            print(f"Market data error: {error}")

            return Response(
                {
                    "detail": "Market data is temporarily unavailable."
                },
                status=503,
            )