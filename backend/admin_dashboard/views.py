from django.contrib.auth import get_user_model
from django.db.models import Q, Sum

from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from investments.models import Investment, InvestmentPlan
from transactions.models import Transaction
from wallets.models import Wallet

from .serializers import (
    AdminInvestmentPlanSerializer,
    AdminInvestmentSerializer,
    AdminUserSerializer,
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