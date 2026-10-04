from django.contrib.auth import get_user_model
from django.db.models import Q, Sum
from django.db import transaction as db_transaction

from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from investments.models import Investment, InvestmentPlan
from transactions.models import Transaction
from transactions.services import (
    approve_withdrawal,
    reject_withdrawal,
)
from wallets.models import Wallet, LedgerEntry
import uuid

from .serializers import (
    AdminInvestmentPlanSerializer,
    AdminInvestmentSerializer,
    AdminUserSerializer,
    AdminUserDetailSerializer,
    AdminWalletAdjustmentSerializer,
    AdminWithdrawalSerializer,
)

User = get_user_model()


# =========================================================
# ADMIN DASHBOARD
# =========================================================

class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()

        total_wallet_balance = (
            Wallet.objects.aggregate(
                total=Sum("balance")
            )["total"]
            or 0
        )

        pending_deposits = Transaction.objects.filter(
            transaction_type=Transaction.TransactionType.DEPOSIT,
            status=Transaction.Status.PENDING,
        ).count()

        pending_withdrawals = Transaction.objects.filter(
            transaction_type=Transaction.TransactionType.WITHDRAWAL,
            status=Transaction.Status.PENDING,
        ).count()

        active_investments = Investment.objects.filter(
            status=Investment.Status.ACTIVE
        ).count()

        total_invested = (
            Investment.objects.aggregate(
                total=Sum("principal_amount")
            )["total"]
            or 0
        )

        successful_deposits = (
            Transaction.objects.filter(
                transaction_type=Transaction.TransactionType.DEPOSIT,
                status=Transaction.Status.SUCCESS,
            )
            .aggregate(
                total=Sum("approved_amount")
            )["total"]
            or 0
        )

        successful_withdrawals = (
            Transaction.objects.filter(
                transaction_type=Transaction.TransactionType.WITHDRAWAL,
                status=Transaction.Status.SUCCESS,
            )
            .aggregate(
                total=Sum("approved_amount")
            )["total"]
            or 0
        )

        recent_transactions = (
            Transaction.objects
            .select_related("user")
            .order_by("-created_at")[:10]
        )

        transactions = []

        for transaction in recent_transactions:
            transactions.append(
                {
                    "reference": transaction.reference,
                    "user": {
                        "id": transaction.user.id,
                        "email": transaction.user.email,
                    },
                    "type": transaction.transaction_type,
                    "status": transaction.status,
                    "direction": transaction.direction,
                    "amount": str(transaction.amount),
                    "approved_amount": (
                        str(transaction.approved_amount)
                        if transaction.approved_amount is not None
                        else None
                    ),
                    "currency": transaction.currency,
                    "description": transaction.description,
                    "created_at": transaction.created_at,
                }
            )

        return Response(
            {
                "stats": {
                    "total_users": total_users,
                    "total_wallet_balance": str(
                        total_wallet_balance
                    ),
                    "pending_deposits": pending_deposits,
                    "pending_withdrawals": pending_withdrawals,
                    "active_investments": active_investments,
                    "total_invested": str(total_invested),
                    "successful_deposits": str(
                        successful_deposits
                    ),
                    "successful_withdrawals": str(
                        successful_withdrawals
                    ),
                },
                "recent_transactions": transactions,
            }
        )


# =========================================================
# ADMIN USERS
# =========================================================

class AdminUserPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 50


class AdminUsersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        search = request.query_params.get(
            "search",
            "",
        ).strip()

        users = User.objects.all().order_by(
            "-date_joined"
        )

        if search:
            users = users.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(phone_number__icontains=search)
            )

        paginator = AdminUserPagination()

        page = paginator.paginate_queryset(
            users,
            request,
        )

        serializer = AdminUserSerializer(
            page,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {
                    "detail": "User not found."
                },
                status=404,
            )

        serializer = AdminUserDetailSerializer(user)

        return Response(
            serializer.data
        )


class AdminWalletAdjustmentView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {
                    "detail": "User not found."
                },
                status=404,
            )

        serializer = AdminWalletAdjustmentSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        direction = serializer.validated_data[
            "direction"
        ]

        amount = serializer.validated_data[
            "amount"
        ]

        description = serializer.validated_data.get(
            "description",
            "",
        )

        with db_transaction.atomic():
            wallet, created = Wallet.objects.get_or_create(
                user=user,
                defaults={
                    "currency": "USD",
                    "balance": 0,
                },
            )

            wallet = Wallet.objects.select_for_update().get(
                pk=wallet.pk
            )

            current_balance = wallet.balance

            if direction == "credit":
                new_balance = (
                    current_balance + amount
                )

            else:
                if amount > current_balance:
                    return Response(
                        {
                            "detail": (
                                "Insufficient wallet "
                                "balance for this debit."
                            )
                        },
                        status=400,
                    )

                new_balance = (
                    current_balance - amount
                )

            wallet.balance = new_balance
            wallet.save(
                update_fields=[
                    "balance",
                    "updated_at",
                ]
            )

            entry_reference = (
                f"ADMIN-ADJ-{uuid.uuid4().hex[:20].upper()}"
            )

            LedgerEntry.objects.create(
                wallet=wallet,
                currency=wallet.currency,
                entry_type=LedgerEntry.EntryType.ADJUSTMENT,
                direction=(
                    LedgerEntry.Direction.CREDIT
                    if direction == "credit"
                    else LedgerEntry.Direction.DEBIT
                ),
                amount=amount,
                balance_after=new_balance,
                reference=entry_reference,
                description=(
                    description
                    or (
                        "Admin wallet credit"
                        if direction == "credit"
                        else "Admin wallet debit"
                    )
                ),
            )

        return Response(
            {
                "detail": (
                    "Wallet credited successfully."
                    if direction == "credit"
                    else "Wallet debited successfully."
                ),
                "user_id": user.id,
                "wallet_balance": str(
                    new_balance
                ),
            },
            status=200,
        )


# =========================================================
# ADMIN WITHDRAWALS
# =========================================================

class AdminWithdrawalsView(generics.ListAPIView):
    permission_classes = [
        permissions.IsAdminUser
    ]

    serializer_class = AdminWithdrawalSerializer

    def get_queryset(self):
        queryset = (
            Transaction.objects
            .filter(
                transaction_type=(
                    Transaction.TransactionType.WITHDRAWAL
                )
            )
            .select_related("user")
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
                Q(reference__icontains=search)
                | Q(user__email__icontains=search)
                | Q(user__username__icontains=search)
                | Q(destination__icontains=search)
            )

        valid_statuses = {
            choice[0]
            for choice in Transaction.Status.choices
        }

        if status_filter in valid_statuses:
            queryset = queryset.filter(
                status=status_filter
            )

        return queryset


# =========================================================
# ADMIN INVESTMENTS
# =========================================================

class AdminInvestmentsView(generics.ListAPIView):
    permission_classes = [
        permissions.IsAdminUser
    ]

    serializer_class = AdminInvestmentSerializer

    def get_queryset(self):
        queryset = (
            Investment.objects
            .select_related(
                "user",
                "plan",
                "plan__category",
            )
            .order_by("-created_at")
        )

        search = self.request.query_params.get(
            "search",
            "",
        ).strip()

        status_filter = self.request.query_params.get(
            "status",
            "",
        ).strip().lower()

        category = self.request.query_params.get(
            "category",
            "",
        ).strip()

        plan = self.request.query_params.get(
            "plan",
            "",
        ).strip()

        if search:
            queryset = queryset.filter(
                Q(reference__icontains=search)
                | Q(user__email__icontains=search)
                | Q(user__username__icontains=search)
                | Q(plan__name__icontains=search)
                | Q(plan__category__name__icontains=search)
            )

        valid_statuses = {
            choice[0]
            for choice in Investment.Status.choices
        }

        if status_filter in valid_statuses:
            queryset = queryset.filter(
                status=status_filter
            )

        if category:
            queryset = queryset.filter(
                plan__category__slug__iexact=category
            )

        if plan:
            queryset = queryset.filter(
                plan_id=plan
            )

        return queryset


# =========================================================
# ADMIN INVESTMENT PLANS
# =========================================================

class AdminInvestmentPlanListCreateView(
    generics.ListCreateAPIView
):
    permission_classes = [
        permissions.IsAdminUser
    ]

    serializer_class = AdminInvestmentPlanSerializer

    def get_queryset(self):
        queryset = (
            InvestmentPlan.objects
            .select_related("category")
            .order_by(
                "category__name",
                "minimum_amount",
            )
        )

        search = self.request.query_params.get(
            "search",
            "",
        ).strip()

        status_filter = self.request.query_params.get(
            "status",
            "",
        ).strip().lower()

        category = self.request.query_params.get(
            "category",
            "",
        ).strip()

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(category__name__icontains=search)
            )

        valid_statuses = {
            choice[0]
            for choice in InvestmentPlan.Status.choices
        }

        if status_filter in valid_statuses:
            queryset = queryset.filter(
                status=status_filter
            )

        if category:
            queryset = queryset.filter(
                category__slug__iexact=category
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save()


class AdminInvestmentPlanDetailView(
    generics.RetrieveUpdateAPIView
):
    permission_classes = [
        permissions.IsAdminUser
    ]

    serializer_class = AdminInvestmentPlanSerializer

    queryset = (
        InvestmentPlan.objects
        .select_related("category")
    )

class AdminWithdrawalApproveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            withdrawal = approve_withdrawal(
                transaction_id=pk,
                admin_user=request.user,
                admin_note=request.data.get(
                    "admin_note",
                    "",
                ),
            )
        except Transaction.DoesNotExist:
            return Response(
                {
                    "detail": "Withdrawal not found."
                },
                status=404,
            )
        except ValueError as exc:
            return Response(
                {
                    "detail": str(exc)
                },
                status=400,
            )

        return Response(
            {
                "detail": (
                    "Withdrawal approved successfully."
                ),
                "transaction": (
                    AdminWithdrawalSerializer(
                        withdrawal
                    ).data
                ),
            },
            status=200,
        )


class AdminWithdrawalRejectView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            withdrawal = reject_withdrawal(
                transaction_id=pk,
                admin_user=request.user,
                admin_note=request.data.get(
                    "admin_note",
                    "",
                ),
            )
        except Transaction.DoesNotExist:
            return Response(
                {
                    "detail": "Withdrawal not found."
                },
                status=404,
            )
        except ValueError as exc:
            return Response(
                {
                    "detail": str(exc)
                },
                status=400,
            )

        return Response(
            {
                "detail": (
                    "Withdrawal rejected successfully."
                ),
                "transaction": (
                    AdminWithdrawalSerializer(
                        withdrawal
                    ).data
                ),
            },
            status=200,
        )