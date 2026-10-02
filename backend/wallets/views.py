from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import LedgerEntry
from .serializers import LedgerEntrySerializer, WalletSerializer


class WalletDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WalletSerializer

    def get_object(self):
        return self.request.user.wallet


class LedgerEntryListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LedgerEntrySerializer

    def get_queryset(self):
        return LedgerEntry.objects.filter(
            wallet=self.request.user.wallet
        )