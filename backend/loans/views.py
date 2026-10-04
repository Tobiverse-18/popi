from decimal import Decimal

from django.db import transaction
from rest_framework import generics, permissions, serializers, status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView

from wallets.models import Wallet

from .models import Loan, LoanSettings
from .serializers import (
    AdminLoanApproveSerializer,
    AdminLoanRejectSerializer,
    AdminLoanSerializer,
    LoanApplicationSerializer,
    LoanEligibilitySerializer,
    LoanSerializer,
    LoanSettingsSerializer,
)
from .services import (
    approve_loan,
    create_loan_application,
    get_loan_settings,
    reject_loan,
)


class LoanEligibilityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        loan_settings = get_loan_settings()

        wallet = Wallet.objects.filter(
            user=request.user
        ).first()

        wallet_balance = (
            wallet.balance
            if wallet
            else Decimal("0.00")
        )

        minimum_balance = (
            loan_settings.minimum_wallet_balance
        )

        amount_needed = max(
            Decimal("0.00"),
            minimum_balance - wallet_balance,
        )

        has_pending_application = Loan.objects.filter(
            user=request.user,
            status=Loan.Status.PENDING,
        ).exists()

        is_eligible = (
            loan_settings.is_enabled
            and wallet is not None
            and wallet.currency == "USD"
            and wallet_balance >= minimum_balance
            and not has_pending_application
        )

        if not loan_settings.is_enabled:
            message = (
                "Loan applications are currently unavailable."
            )

        elif has_pending_application:
            message = (
                "You already have a loan application "
                "awaiting review."
            )

        elif wallet is None:
            message = (
                "A wallet is required before you can "
                "apply for a loan."
            )

        elif wallet.currency != "USD":
            message = (
                "Loan applications currently require "
                "a USD wallet."
            )

        elif wallet_balance < minimum_balance:
            message = (
                "You do not currently meet the minimum "
                "wallet balance requirement."
            )

        else:
            message = (
                "You are eligible to apply for a loan."
            )

        serializer = LoanEligibilitySerializer(
            {
                "is_eligible": is_eligible,
                "wallet_balance": wallet_balance,
                "minimum_wallet_balance": minimum_balance,
                "amount_needed": amount_needed,
                "loan_applications_enabled": (
                    loan_settings.is_enabled
                ),
                "has_pending_application": (
                    has_pending_application
                ),
                "message": message,
            }
        )

        return Response(serializer.data)


class LoanApplicationCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LoanApplicationSerializer

    def perform_create(self, serializer):
        try:
            loan = create_loan_application(
                user=self.request.user,
                requested_amount=(
                    serializer.validated_data[
                        "requested_amount"
                    ]
                ),
                loan_type=(
                    serializer.validated_data[
                        "loan_type"
                    ]
                ),
                reason=(
                    serializer.validated_data[
                        "reason"
                    ]
                ),
            )

        except ValueError as exc:
            raise serializers.ValidationError(
                {"detail": str(exc)}
            )

        self.loan = loan

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        self.perform_create(serializer)

        return Response(
            LoanSerializer(self.loan).data,
            status=status.HTTP_201_CREATED,
        )


class LoanListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LoanSerializer

    def get_queryset(self):
        return (
            Loan.objects
            .filter(user=self.request.user)
            .select_related(
                "reviewed_by",
                "transaction",
            )
            .order_by("-application_date")
        )


class LoanDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LoanSerializer

    def get_queryset(self):
        return (
            Loan.objects
            .filter(user=self.request.user)
            .select_related(
                "reviewed_by",
                "transaction",
            )
        )


class AdminLoanListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminLoanSerializer

    def get_queryset(self):
        queryset = (
            Loan.objects
            .select_related(
                "user",
                "reviewed_by",
                "transaction",
                "user__wallet",
            )
            .order_by("-application_date")
        )

        loan_status = self.request.query_params.get(
            "status"
        )

        if loan_status:
            queryset = queryset.filter(
                status=loan_status
            )

        return queryset


class AdminLoanDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminLoanSerializer

    def get_queryset(self):
        return (
            Loan.objects
            .select_related(
                "user",
                "reviewed_by",
                "transaction",
                "user__wallet",
            )
        )


class AdminLoanApproveView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @transaction.atomic
    def post(self, request, pk):
        serializer = AdminLoanApproveSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:
            loan = approve_loan(
                loan_id=pk,
                admin_user=request.user,
                approved_amount=(
                    serializer.validated_data[
                        "approved_amount"
                    ]
                ),
                interest_rate=(
                    serializer.validated_data[
                        "interest_rate"
                    ]
                ),
                repayment_period_days=(
                    serializer.validated_data[
                        "repayment_period_days"
                    ]
                ),
                admin_note=(
                    serializer.validated_data.get(
                        "admin_note",
                        "",
                    )
                ),
            )

        except Loan.DoesNotExist:
            raise NotFound(
                "Loan application not found."
            )

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            AdminLoanSerializer(loan).data,
            status=status.HTTP_200_OK,
        )


class AdminLoanRejectView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @transaction.atomic
    def post(self, request, pk):
        serializer = AdminLoanRejectSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        try:
            loan = reject_loan(
                loan_id=pk,
                admin_user=request.user,
                admin_note=(
                    serializer.validated_data.get(
                        "admin_note",
                        "",
                    )
                ),
            )

        except Loan.DoesNotExist:
            raise NotFound(
                "Loan application not found."
            )

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            AdminLoanSerializer(loan).data,
            status=status.HTTP_200_OK,
        )


class AdminLoanSettingsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        loan_settings = get_loan_settings()

        serializer = LoanSettingsSerializer(
            loan_settings
        )

        return Response(serializer.data)

    def patch(self, request):
        loan_settings = get_loan_settings()

        serializer = LoanSettingsSerializer(
            loan_settings,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(serializer.data)