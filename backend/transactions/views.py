from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Transaction
from .serializers import (
    CreateDepositSerializer,
    CreateWithdrawalSerializer,
    TransactionSerializer,
)
from .services import (
    create_deposit,
    create_withdrawal,
)


class TransactionListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(
            user=self.request.user
        )


class TransactionDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer
    lookup_field = "reference"

    def get_queryset(self):
        return Transaction.objects.filter(
            user=self.request.user
        )


class DepositCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateDepositSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        amount = serializer.validated_data["amount"]
        currency = serializer.validated_data["currency"]

        try:
            deposit = create_deposit(
                user=request.user,
                amount=amount,
                currency=currency,
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            TransactionSerializer(deposit).data,
            status=status.HTTP_201_CREATED,
        )


class WithdrawalCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateWithdrawalSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        amount = serializer.validated_data["amount"]
        destination = serializer.validated_data[
            "destination"
        ]
        currency = serializer.validated_data[
            "currency"
        ]

        try:
            withdrawal = create_withdrawal(
                user=request.user,
                amount=amount,
                destination=destination,
                currency=currency,
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            TransactionSerializer(
                withdrawal
            ).data,
            status=status.HTTP_201_CREATED,
        )