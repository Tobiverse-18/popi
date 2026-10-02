from django.core.exceptions import ObjectDoesNotExist

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Investment,
    InvestmentCategory,
    InvestmentPlan,
)
from .serializers import (
    CreateInvestmentSerializer,
    InvestmentCategorySerializer,
    InvestmentPlanSerializer,
    InvestmentSerializer,
)
from .services import create_investment


class InvestmentCategoryListView(
    generics.ListAPIView
):
    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        InvestmentCategorySerializer
    )

    def get_queryset(self):
        return (
            InvestmentCategory.objects
            .filter(
                status=InvestmentCategory.Status.ACTIVE
            )
            .prefetch_related(
                "plans"
            )
        )


class InvestmentPlanListView(
    generics.ListAPIView
):
    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        InvestmentPlanSerializer
    )

    def get_queryset(self):
        queryset = (
            InvestmentPlan.objects
            .filter(
                status=InvestmentPlan.Status.ACTIVE,
                category__status=(
                    InvestmentCategory.Status.ACTIVE
                ),
            )
            .select_related("category")
        )

        category_slug = self.request.query_params.get(
            "category"
        )

        if category_slug:
            queryset = queryset.filter(
                category__slug__iexact=category_slug
        )

        return queryset


class InvestmentListView(
    generics.ListAPIView
):
    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        InvestmentSerializer
    )

    def get_queryset(self):
        return (
            Investment.objects
            .filter(
                user=self.request.user
            )
            .select_related(
                "plan",
                "plan__category",
            )
        )


class InvestmentCreateView(
    APIView
):
    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):
        serializer = (
            CreateInvestmentSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        plan_id = (
            serializer.validated_data[
                "plan"
            ]
        )

        amount = (
            serializer.validated_data[
                "amount"
            ]
        )

        try:
            investment = create_investment(
                request.user,
                plan_id,
                amount,
            )

        except InvestmentPlan.DoesNotExist:
            return Response(
                {
                    "detail":
                        "Investment plan not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except ObjectDoesNotExist:
            return Response(
                {
                    "detail":
                        "User wallet not found."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except ValueError as exc:
            return Response(
                {
                    "detail": str(exc)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            InvestmentSerializer(
                investment
            ).data,
            status=status.HTTP_201_CREATED,
        )


class InvestmentDetailView(
    generics.RetrieveAPIView
):
    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        InvestmentSerializer
    )

    lookup_field = "reference"

    def get_queryset(self):
        return (
            Investment.objects
            .filter(
                user=self.request.user
            )
            .select_related(
                "plan",
                "plan__category",
            )
        )