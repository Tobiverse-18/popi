
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from wallets.models import Wallet, LedgerEntry
from transactions.models import Transaction

from .models import FundingWallet, ManualFundingRequest
from .serializers import (
    ManualFundingRequestSerializer,
    AdminFundingRequestSerializer,
    FundingWalletSerializer,
)


class FundingConfigurationView(APIView):
    """Return active BTC and ETH funding addresses."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallets = list(
            FundingWallet.objects.filter(
                is_active=True,
                asset__in=["BTC", "ETH"],
            )
            .order_by("asset")
            .values("asset", "network", "address")
        )

        bitcoin_wallet = next(
            (wallet for wallet in wallets if wallet["asset"] == "BTC"),
            None,
        )
        ethereum_wallet = next(
            (wallet for wallet in wallets if wallet["asset"] == "ETH"),
            None,
        )

        return Response(
            {
                "wallets": wallets,
                "bitcoin_address": (
                    bitcoin_wallet["address"] if bitcoin_wallet else ""
                ),
                "ethereum_address": (
                    ethereum_wallet["address"] if ethereum_wallet else ""
                ),
            },
            status=status.HTTP_200_OK,
        )


class FundingRequestCreateView(generics.CreateAPIView):
    """Create a pending BTC or ETH funding request."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ManualFundingRequestSerializer
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        asset = (
            serializer.validated_data.get("crypto_currency") or "BTC"
        ).strip().upper()

        if asset not in {"BTC", "ETH"}:
            raise ValidationError(
                {"crypto_currency": "Choose BTC or ETH."}
            )

        funding_wallet = FundingWallet.objects.filter(
            asset=asset,
            is_active=True,
        ).first()

        if not funding_wallet:
            raise ValidationError(
                {"detail": f"{asset} funding is currently unavailable."}
            )

        serializer.save(
            user=self.request.user,
            currency="USD",
            crypto_currency=asset,
            wallet_address=funding_wallet.address,
            status=ManualFundingRequest.Status.PENDING,
        )


class FundingRequestListView(generics.ListAPIView):
    """List only the authenticated user's funding requests."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ManualFundingRequestSerializer

    def get_queryset(self):
        return ManualFundingRequest.objects.filter(
            user=self.request.user,
        ).order_by("-created_at")


class AdminFundingRequestListView(generics.ListAPIView):
    """List funding requests for administrators."""

    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminFundingRequestSerializer

    def get_queryset(self):
        queryset = ManualFundingRequest.objects.select_related(
            "user",
            "reviewed_by",
        ).order_by("-created_at")

        request_status = self.request.query_params.get("status")

        if request_status:
            allowed_statuses = {
                ManualFundingRequest.Status.PENDING,
                ManualFundingRequest.Status.APPROVED,
                ManualFundingRequest.Status.REJECTED,
            }

            if request_status not in allowed_statuses:
                raise ValidationError(
                    {"status": "Invalid funding request status."}
                )

            queryset = queryset.filter(status=request_status)

        return queryset


class FundingRequestApproveView(APIView):
    """
    Approve a pending request and credit the user's USD wallet.

    Wallet balance, ledger entry, transaction, and request status
    are updated within one database transaction.
    """

    permission_classes = [permissions.IsAdminUser]

    @transaction.atomic
    def post(self, request, pk):
        funding_request = get_object_or_404(
            ManualFundingRequest.objects.select_for_update(),
            pk=pk,
        )

        if funding_request.status != ManualFundingRequest.Status.PENDING:
            return Response(
                {"detail": "Only pending requests can be approved."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        raw_amount = request.data.get(
            "approved_amount",
            funding_request.amount,
        )

        try:
            approved_amount = Decimal(str(raw_amount))
        except (InvalidOperation, TypeError, ValueError):
            raise ValidationError(
                {"approved_amount": "Enter a valid amount."}
            )

        if not approved_amount.is_finite() or approved_amount <= Decimal("0"):
            raise ValidationError(
                {"approved_amount": "Amount must be greater than zero."}
            )

        if approved_amount.as_tuple().exponent < -2:
            raise ValidationError(
                {"approved_amount": "Use no more than two decimal places."}
            )

        if approved_amount > funding_request.amount:
            raise ValidationError(
                {
                    "approved_amount": (
                        "The approved amount cannot exceed the requested amount."
                    )
                }
            )

        # Wallet has a one-to-one relationship with the user.
        # Lock it so concurrent approvals cannot overwrite its balance.
        wallet, _ = Wallet.objects.get_or_create(
            user=funding_request.user,
            defaults={"currency": "USD"},
        )
        wallet = Wallet.objects.select_for_update().get(pk=wallet.pk)

        if wallet.currency != funding_request.currency:
            raise ValidationError(
                {"detail": "Wallet currency does not match the funding currency."}
            )

        new_balance = wallet.balance + approved_amount

        wallet.balance = new_balance
        wallet.save(update_fields=["balance", "updated_at"])

        admin_note = str(request.data.get("admin_note", ""))

        # LedgerEntry requires both direction and balance_after.
        LedgerEntry.objects.create(
            wallet=wallet,
            currency=funding_request.currency,
            entry_type=LedgerEntry.EntryType.DEPOSIT,
            direction=LedgerEntry.Direction.CREDIT,
            amount=approved_amount,
            balance_after=new_balance,
            reference=funding_request.reference,
            description=(
                f"Manual {funding_request.crypto_currency} funding "
                f"approved: {funding_request.reference}"
            ),
        )

        # Transaction has no wallet field; it records the user,
        # transaction direction, currency, amount and reference.
        Transaction.objects.create(
            user=funding_request.user,
            transaction_type=Transaction.TransactionType.DEPOSIT,
            status=Transaction.Status.SUCCESS,
            direction=Transaction.Direction.CREDIT,
            currency=funding_request.currency,
            amount=approved_amount,
            approved_amount=approved_amount,
            destination=funding_request.wallet_address,
            admin_note=admin_note,
            reviewed_by=request.user,
            reviewed_at=timezone.now(),
            reference=funding_request.reference,
            provider="manual_crypto",
            description=(
                f"Manual {funding_request.crypto_currency} funding "
                f"approved: {funding_request.reference}"
            ),
        )

        funding_request.approved_amount = approved_amount
        funding_request.status = ManualFundingRequest.Status.APPROVED
        funding_request.admin_note = admin_note
        funding_request.reviewed_by = request.user
        funding_request.reviewed_at = timezone.now()

        funding_request.save(
            update_fields=[
                "approved_amount",
                "status",
                "admin_note",
                "reviewed_by",
                "reviewed_at",
                "updated_at",
            ]
        )

        return Response(
            {
                "detail": "Funding request approved successfully.",
                "reference": funding_request.reference,
                "approved_amount": str(approved_amount),
                "currency": funding_request.currency,
                "crypto_currency": funding_request.crypto_currency,
                "status": funding_request.status,
                "wallet_balance": str(wallet.balance),
            },
            status=status.HTTP_200_OK,
        )


class FundingRequestRejectView(APIView):
    """Reject a pending request without crediting the wallet."""

    permission_classes = [permissions.IsAdminUser]

    @transaction.atomic
    def post(self, request, pk):
        funding_request = get_object_or_404(
            ManualFundingRequest.objects.select_for_update(),
            pk=pk,
        )

        if funding_request.status != ManualFundingRequest.Status.PENDING:
            return Response(
                {"detail": "Only pending requests can be rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        funding_request.status = ManualFundingRequest.Status.REJECTED
        funding_request.admin_note = str(request.data.get("admin_note", ""))
        funding_request.reviewed_by = request.user
        funding_request.reviewed_at = timezone.now()

        funding_request.save(
            update_fields=[
                "status",
                "admin_note",
                "reviewed_by",
                "reviewed_at",
                "updated_at",
            ]
        )

        return Response(
            {
                "detail": "Funding request rejected.",
                "reference": funding_request.reference,
                "status": funding_request.status,
            },
            status=status.HTTP_200_OK,
        )


class AdminFundingWalletListCreateView(generics.ListCreateAPIView):
    """List or create BTC and ETH funding addresses."""

    permission_classes = [permissions.IsAdminUser]
    serializer_class = FundingWalletSerializer

    def get_queryset(self):
        return FundingWallet.objects.all().order_by("asset", "-created_at")

    @transaction.atomic
    def perform_create(self, serializer):
        asset = serializer.validated_data["asset"]

        if serializer.validated_data.get("is_active", True):
            FundingWallet.objects.filter(
                asset=asset,
                is_active=True,
            ).update(is_active=False)

        serializer.save()


class AdminFundingWalletDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a funding address."""

    permission_classes = [permissions.IsAdminUser]
    serializer_class = FundingWalletSerializer
    queryset = FundingWallet.objects.all()

    @transaction.atomic
    def perform_update(self, serializer):
        wallet = serializer.instance
        asset = serializer.validated_data.get("asset", wallet.asset)
        is_active = serializer.validated_data.get(
            "is_active",
            wallet.is_active,
        )

        if is_active:
            FundingWallet.objects.filter(
                asset=asset,
                is_active=True,
            ).exclude(pk=wallet.pk).update(is_active=False)

        serializer.save()