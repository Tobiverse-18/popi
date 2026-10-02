from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from transactions.models import Transaction
from wallets.models import LedgerEntry, Wallet

from .models import (
    ManualFundingRequest,
    PaymentConfiguration,
)
from .serializers import (
    AdminFundingRequestSerializer,
    ManualFundingRequestSerializer,
)


class FundingConfigurationView(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):
        configuration = (
            PaymentConfiguration.objects.filter(
                is_active=True
            )
            .first()
        )

        if not configuration:
            return Response(
                {
                    "bitcoin_address": "",
                }
            )

        return Response(
            {
                "bitcoin_address":
                    configuration.bitcoin_address,
            }
        )


class FundingRequestCreateView(
    generics.CreateAPIView
):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    serializer_class = (
        ManualFundingRequestSerializer
    )

    def perform_create(self, serializer):
        configuration = (
            PaymentConfiguration.objects.filter(
                is_active=True
            )
            .first()
        )

        if not configuration:
            raise ValidationError(
                {
                    "detail":
                        "Funding is currently unavailable."
                }
            )

        if not configuration.bitcoin_address:
            raise ValidationError(
                {
                    "detail":
                        "Bitcoin funding is currently unavailable."
                }
            )

        serializer.save(
            user=self.request.user,
            currency="USD",
            crypto_currency="BTC",
            wallet_address=(
                configuration.bitcoin_address
            ),
            status=(
                ManualFundingRequest
                .Status
                .PENDING
            ),
        )


class FundingRequestListView(
    generics.ListAPIView
):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    serializer_class = (
        ManualFundingRequestSerializer
    )

    def get_queryset(self):
        return ManualFundingRequest.objects.filter(
            user=self.request.user
        )


class AdminFundingPagination(
    PageNumberPagination
):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 50


class AdminFundingRequestListView(
    generics.ListAPIView
):
    permission_classes = [
        permissions.IsAdminUser
    ]

    serializer_class = (
        AdminFundingRequestSerializer
    )

    pagination_class = (
        AdminFundingPagination
    )

    def get_queryset(self):
        queryset = (
            ManualFundingRequest.objects
            .select_related(
                "user",
                "reviewed_by",
            )
            .all()
            .order_by("-created_at")
        )

        search = (
            self.request.query_params
            .get("search", "")
            .strip()
        )

        status_filter = (
            self.request.query_params
            .get("status", "")
            .strip()
            .lower()
        )

        if search:
            queryset = queryset.filter(
                Q(
                    reference__icontains=search
                )
                | Q(
                    user__email__icontains=search
                )
                | Q(
                    user__username__icontains=search
                )
            )

        if status_filter in {
            ManualFundingRequest.Status.PENDING,
            ManualFundingRequest.Status.APPROVED,
            ManualFundingRequest.Status.REJECTED,
        }:
            queryset = queryset.filter(
                status=status_filter
            )

        return queryset


class FundingRequestApproveView(APIView):
    permission_classes = [
        permissions.IsAdminUser
    ]

    @transaction.atomic
    def post(self, request, pk):
        funding_request = get_object_or_404(
            ManualFundingRequest.objects.select_for_update(),
            pk=pk,
        )

        if (
            funding_request.status
            != ManualFundingRequest.Status.PENDING
        ):
            return Response(
                {
                    "detail":
                        "Only pending funding requests can be approved."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        raw_approved_amount = request.data.get(
            "approved_amount"
        )

        if raw_approved_amount in (
            None,
            "",
        ):
            return Response(
                {
                    "approved_amount":
                        "Enter the verified amount before approving."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            approved_amount = Decimal(
                str(raw_approved_amount)
            )
        except (
            InvalidOperation,
            ValueError,
        ):
            return Response(
                {
                    "approved_amount":
                        "Enter a valid amount."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if approved_amount <= 0:
            return Response(
                {
                    "approved_amount":
                        "Approved amount must be greater than zero."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        wallet = Wallet.objects.select_for_update().get(
            user=funding_request.user
        )

        wallet.balance += approved_amount

        wallet.save(
            update_fields=[
                "balance",
                "updated_at",
            ]
        )

        ledger_reference = (
            f"FUND-{funding_request.reference}"
        )

        LedgerEntry.objects.create(
            wallet=wallet,
            currency=funding_request.currency,
            entry_type=(
                LedgerEntry.EntryType.DEPOSIT
            ),
            direction=(
                LedgerEntry.Direction.CREDIT
            ),
            amount=approved_amount,
            balance_after=wallet.balance,
            reference=ledger_reference,
            description=(
                "Manual crypto funding"
            ),
        )

        Transaction.objects.create(
            user=funding_request.user,
            transaction_type=(
                Transaction.TransactionType.DEPOSIT
            ),
            status=(
                Transaction.Status.SUCCESS
            ),
            direction=(
                Transaction.Direction.CREDIT
            ),
            currency=funding_request.currency,
            amount=approved_amount,
            reference=funding_request.reference,
            provider="manual_crypto",
            provider_reference=(
                funding_request.reference
            ),
            description=(
                "Manual crypto funding"
            ),
        )

        funding_request.approved_amount = (
            approved_amount
        )

        funding_request.status = (
            ManualFundingRequest
            .Status
            .APPROVED
        )

        funding_request.reviewed_by = (
            request.user
        )

        funding_request.reviewed_at = (
            timezone.now()
        )

        funding_request.save(
            update_fields=[
                "approved_amount",
                "status",
                "reviewed_by",
                "reviewed_at",
                "updated_at",
            ]
        )

        return Response(
            {
                "detail":
                    "Funding request approved and wallet credited.",
                "reference":
                    funding_request.reference,
                "requested_amount":
                    str(funding_request.amount),
                "approved_amount":
                    str(approved_amount),
                "wallet_balance":
                    str(wallet.balance),
            },
            status=status.HTTP_200_OK,
        )


class FundingRequestRejectView(APIView):
    permission_classes = [
        permissions.IsAdminUser
    ]

    @transaction.atomic
    def post(self, request, pk):
        funding_request = get_object_or_404(
            ManualFundingRequest.objects.select_for_update(),
            pk=pk,
        )

        if (
            funding_request.status
            != ManualFundingRequest.Status.PENDING
        ):
            return Response(
                {
                    "detail":
                        "Only pending funding requests can be rejected."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        admin_note = request.data.get(
            "admin_note",
            "",
        )

        funding_request.status = (
            ManualFundingRequest
            .Status
            .REJECTED
        )

        funding_request.admin_note = (
            str(admin_note).strip()
        )

        funding_request.reviewed_by = (
            request.user
        )

        funding_request.reviewed_at = (
            timezone.now()
        )

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
                "detail":
                    "Funding request rejected.",
                "reference":
                    funding_request.reference,
            },
            status=status.HTTP_200_OK,
        )