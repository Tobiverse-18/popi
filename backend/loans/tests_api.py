from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from loans.models import Loan, LoanSettings
from transactions.models import Transaction
from users.models import User
from wallets.models import Wallet


class LoanAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="loanuser",
            email="loanuser@example.com",
            password="TestPassword123!",
            phone_number="08012345678",
        )

        self.admin = User.objects.create_user(
            username="loanadmin",
            email="admin@example.com",
            password="AdminPassword123!",
            phone_number="08087654321",
            is_staff=True,
            is_superuser=True,
            role=User.Role.ADMIN,
        )

        self.wallet = Wallet.objects.get(user=self.user)
        self.wallet.currency = "USD"
        self.wallet.balance = Decimal("15000.00")
        self.wallet.save(
            update_fields=[
                "currency",
                "balance",
                "updated_at",
            ]
        )

        LoanSettings.objects.create(
            pk=1,
            minimum_wallet_balance=Decimal("10000.00"),
            is_enabled=True,
        )

    def authenticate_user(self):
        self.client.force_authenticate(user=self.user)

    def authenticate_admin(self):
        self.client.force_authenticate(user=self.admin)

    def test_eligibility_endpoint_returns_eligible(self):
        self.authenticate_user()

        response = self.client.get(
            "/api/loans/eligibility/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_eligible"])
        self.assertEqual(
            Decimal(str(response.data["wallet_balance"])),
            Decimal("15000.00"),
        )
        self.assertEqual(
            Decimal(
                str(response.data["minimum_wallet_balance"])
            ),
            Decimal("10000.00"),
        )
        self.assertEqual(
            Decimal(str(response.data["amount_needed"])),
            Decimal("0.00"),
        )
        self.assertFalse(
            response.data["has_pending_application"]
        )

    def test_eligibility_endpoint_requires_authentication(self):
        response = self.client.get(
            "/api/loans/eligibility/"
        )

        self.assertEqual(response.status_code, 401)

    def test_user_can_apply_through_api(self):
        self.authenticate_user()

        response = self.client.post(
            "/api/loans/apply/",
            {
                "requested_amount": "8000.00",
                "loan_type": "business",
                "reason": "Business expansion.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        self.assertEqual(
            response.data["requested_amount"],
            "8000.00",
        )

        self.assertEqual(
            response.data["loan_type"],
            "business",
        )

        self.assertEqual(
            response.data["status"],
            "pending",
        )

        self.assertEqual(
            Loan.objects.filter(
                user=self.user
            ).count(),
            1,
        )

    def test_user_cannot_apply_below_minimum_balance(self):
        self.wallet.balance = Decimal("9000.00")
        self.wallet.save(
            update_fields=[
                "balance",
                "updated_at",
            ]
        )

        self.authenticate_user()

        response = self.client.post(
            "/api/loans/apply/",
            {
                "requested_amount": "5000.00",
                "loan_type": "personal",
                "reason": "Personal expenses.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

        self.assertFalse(
            Loan.objects.filter(
                user=self.user
            ).exists()
        )

    def test_user_cannot_submit_invalid_loan_type(self):
        self.authenticate_user()

        response = self.client.post(
            "/api/loans/apply/",
            {
                "requested_amount": "5000.00",
                "loan_type": "invalid_type",
                "reason": "Testing invalid loan type.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_user_cannot_submit_zero_amount(self):
        self.authenticate_user()

        response = self.client.post(
            "/api/loans/apply/",
            {
                "requested_amount": "0.00",
                "loan_type": "personal",
                "reason": "Testing zero amount.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_user_can_view_loan_list(self):
        self.authenticate_user()

        self.client.post(
            "/api/loans/apply/",
            {
                "requested_amount": "5000.00",
                "loan_type": "business",
                "reason": "Business expansion.",
            },
            format="json",
        )

        response = self.client.get(
            "/api/loans/"
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(len(response.data), 1)

        self.assertEqual(
            response.data[0]["requested_amount"],
            "5000.00",
        )

    def test_normal_user_cannot_access_admin_loan_list(self):
        self.authenticate_user()

        response = self.client.get(
            "/api/loans/admin/"
        )

        self.assertEqual(response.status_code, 403)

    def test_normal_user_cannot_access_admin_settings(self):
        self.authenticate_user()

        response = self.client.get(
            "/api/loans/admin/settings/"
        )

        self.assertEqual(response.status_code, 403)

    def test_admin_can_view_loan_list(self):
        self.authenticate_user()

        self.client.post(
            "/api/loans/apply/",
            {
                "requested_amount": "8000.00",
                "loan_type": "business",
                "reason": "Business expansion.",
            },
            format="json",
        )

        self.authenticate_admin()

        response = self.client.get(
            "/api/loans/admin/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

        self.assertEqual(
            response.data[0]["requested_amount"],
            "8000.00",
        )

    def test_admin_can_approve_loan_through_api(self):
        self.authenticate_user()

        application_response = self.client.post(
            "/api/loans/apply/",
            {
                "requested_amount": "8000.00",
                "loan_type": "business",
                "reason": "Business expansion.",
            },
            format="json",
        )

        self.assertEqual(
            application_response.status_code,
            201,
        )

        loan_id = application_response.data["id"]

        self.authenticate_admin()

        response = self.client.post(
            f"/api/loans/admin/{loan_id}/approve/",
            {
                "approved_amount": "7000.00",
                "interest_rate": "5.0000",
                "repayment_period_days": 90,
                "admin_note": "Approved after review.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.data["status"],
            "approved",
        )

        self.assertEqual(
            response.data["approved_amount"],
            "7000.00",
        )

        self.assertEqual(
            response.data["interest_rate"],
            "5.0000",
        )

        self.assertEqual(
            response.data["outstanding_balance"],
            "7350.00",
        )

        self.wallet.refresh_from_db()

        self.assertEqual(
            self.wallet.balance,
            Decimal("22000.00"),
        )

        transaction = Transaction.objects.get(
            loan__id=loan_id
        )

        self.assertEqual(
            transaction.transaction_type,
            Transaction.TransactionType.LOAN,
        )

        self.assertEqual(
            transaction.status,
            Transaction.Status.SUCCESS,
        )

    def test_normal_user_cannot_approve_loan(self):
        self.authenticate_user()

        application_response = self.client.post(
            "/api/loans/apply/",
            {
                "requested_amount": "5000.00",
                "loan_type": "personal",
                "reason": "Personal expenses.",
            },
            format="json",
        )

        loan_id = application_response.data["id"]

        response = self.client.post(
            f"/api/loans/admin/{loan_id}/approve/",
            {
                "approved_amount": "5000.00",
                "interest_rate": "5.0000",
                "repayment_period_days": 60,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)

        self.wallet.refresh_from_db()

        self.assertEqual(
            self.wallet.balance,
            Decimal("15000.00"),
        )

    def test_admin_can_reject_loan_through_api(self):
        self.authenticate_user()

        application_response = self.client.post(
            "/api/loans/apply/",
            {
                "requested_amount": "6000.00",
                "loan_type": "emergency",
                "reason": "Emergency expenses.",
            },
            format="json",
        )

        loan_id = application_response.data["id"]

        self.authenticate_admin()

        response = self.client.post(
            f"/api/loans/admin/{loan_id}/reject/",
            {
                "admin_note": "Application rejected after review.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.data["status"],
            "rejected",
        )

        self.assertEqual(
            response.data["admin_note"],
            "Application rejected after review.",
        )

        self.wallet.refresh_from_db()

        self.assertEqual(
            self.wallet.balance,
            Decimal("15000.00"),
        )

    def test_admin_can_read_loan_settings(self):
        self.authenticate_admin()

        response = self.client.get(
            "/api/loans/admin/settings/"
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.data["minimum_wallet_balance"],
            "10000.00",
        )

        self.assertTrue(
            response.data["is_enabled"]
        )

    def test_admin_can_update_loan_settings(self):
        self.authenticate_admin()

        response = self.client.patch(
            "/api/loans/admin/settings/",
            {
                "minimum_wallet_balance": "20000.00",
                "is_enabled": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.data["minimum_wallet_balance"],
            "20000.00",
        )

        settings = LoanSettings.objects.get(pk=1)

        self.assertEqual(
            settings.minimum_wallet_balance,
            Decimal("20000.00"),
        )

    def test_normal_user_cannot_update_loan_settings(self):
        self.authenticate_user()

        response = self.client.patch(
            "/api/loans/admin/settings/",
            {
                "minimum_wallet_balance": "1.00",
                "is_enabled": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)

        settings = LoanSettings.objects.get(pk=1)

        self.assertEqual(
            settings.minimum_wallet_balance,
            Decimal("10000.00"),
        )

        self.assertTrue(
            settings.is_enabled
        )