from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Transaction
from .services import confirm_deposit


class TestDepositWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        transaction_reference = request.data.get(
            "transaction_reference"
        )
        provider_reference = request.data.get(
            "provider_reference"
        )
        amount = request.data.get("amount")
        currency = request.data.get("currency")
        status_value = request.data.get("status")

        if not all(
            [
                transaction_reference,
                provider_reference,
                amount,
                currency,
                status_value,
            ]
        ):
            return Response(
                {"detail": "Missing required webhook fields."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if status_value != "success":
            return Response(
                {"detail": "Payment was not successful."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            txn = Transaction.objects.get(
                reference=transaction_reference,
                transaction_type=Transaction.TransactionType.DEPOSIT,
            )
        except Transaction.DoesNotExist:
            return Response(
                {"detail": "Transaction not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if txn.currency != currency.upper():
            return Response(
                {"detail": "Currency mismatch."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if str(txn.amount) != str(amount):
            return Response(
                {"detail": "Amount mismatch."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if txn.provider != "test":
            return Response(
                {"detail": "Invalid provider."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            confirmed = confirm_deposit(
                transaction_id=txn.id,
                provider_reference=provider_reference,
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "detail": "Deposit confirmed successfully.",
                "transaction": {
                    "reference": confirmed.reference,
                    "status": confirmed.status,
                    "amount": str(confirmed.amount),
                    "currency": confirmed.currency,
                },
            },
            status=status.HTTP_200_OK,
        )