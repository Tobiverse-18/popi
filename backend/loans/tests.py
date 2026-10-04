from decimal import Decimal

from django.test import TestCase

from loans.models import Loan, LoanSettings
from loans.services import (
    approve_loan,
    create_loan_application,
    reject_loan,
)
from transactions.models import Transaction
from users.models import User
from wallets.models import LedgerEntry, Wallet


class LoanServiceTests(TestCase):

    def setUp(self):
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

        # HarvestCoin automatically creates a wallet
        # when the user is created.
        self.wallet = Wallet.objects.get(
            user=self.user
        )

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
            minimum_wallet_balance=Decimal(
                "10000.00"
            ),
            is_enabled=True,
        )

    def test_user_can_apply_when_minimum_balance_is_met(self):
        loan = create_loan_application(
            user=self.user,
            requested_amount=Decimal("8000.00"),
            loan_type=Loan.LoanType.BUSINESS,
            reason="Business expansion.",
        )

        self.assertEqual(
            loan.status,
            Loan.Status.PENDING,
        )

        self.assertEqual(
            loan.requested_amount,
            Decimal("8000.00"),
        )

        self.wallet.refresh_from_db()

        self.assertEqual(
            self.wallet.balance,
            Decimal("15000.00"),
        )

    def test_user_cannot_apply_below_minimum_balance(self):
        self.wallet.balance = Decimal("9000.00")
        self.wallet.save(
            update_fields=[
                "balance",
                "updated_at",
            ]
        )

        with self.assertRaises(ValueError):
            create_loan_application(
                user=self.user,
                requested_amount=Decimal("5000.00"),
                loan_type=Loan.LoanType.PERSONAL,
                reason="Personal expenses.",
            )

        self.assertFalse(
            Loan.objects.filter(
                user=self.user
            ).exists()
        )

    def test_user_cannot_have_two_pending_applications(self):
        create_loan_application(
            user=self.user,
            requested_amount=Decimal("5000.00"),
            loan_type=Loan.LoanType.BUSINESS,
            reason="Business expansion.",
        )

        with self.assertRaises(ValueError):
            create_loan_application(
                user=self.user,
                requested_amount=Decimal("3000.00"),
                loan_type=Loan.LoanType.PERSONAL,
                reason="Personal expenses.",
            )

        self.assertEqual(
            Loan.objects.filter(
                user=self.user
            ).count(),
            1,
        )

    def test_admin_approval_credits_wallet(self):
        loan = create_loan_application(
            user=self.user,
            requested_amount=Decimal("8000.00"),
            loan_type=Loan.LoanType.BUSINESS,
            reason="Business expansion.",
        )

        approved_loan = approve_loan(
            loan_id=loan.id,
            admin_user=self.admin,
            approved_amount=Decimal("7000.00"),
            interest_rate=Decimal("5.0000"),
            repayment_period_days=90,
            admin_note="Approved after review.",
        )

        self.wallet.refresh_from_db()

        self.assertEqual(
            self.wallet.balance,
            Decimal("22000.00"),
        )

        self.assertEqual(
            approved_loan.status,
            Loan.Status.APPROVED,
        )

        self.assertEqual(
            approved_loan.approved_amount,
            Decimal("7000.00"),
        )

        self.assertEqual(
            approved_loan.interest_rate,
            Decimal("5.0000"),
        )

        self.assertEqual(
            approved_loan.outstanding_balance,
            Decimal("7350.00"),
        )

        self.assertEqual(
            approved_loan.repayment_status,
            Loan.RepaymentStatus.ACTIVE,
        )

        self.assertIsNotNone(
            approved_loan.due_date
        )

        self.assertIsNotNone(
            approved_loan.transaction
        )

        transaction = Transaction.objects.get(
            id=approved_loan.transaction_id
        )

        self.assertEqual(
            transaction.transaction_type,
            Transaction.TransactionType.LOAN,
        )

        self.assertEqual(
            transaction.status,
            Transaction.Status.SUCCESS,
        )

        self.assertEqual(
            transaction.direction,
            Transaction.Direction.CREDIT,
        )

        self.assertEqual(
            transaction.amount,
            Decimal("7000.00"),
        )

        ledger_entry = LedgerEntry.objects.get(
            reference=transaction.reference
        )

        self.assertEqual(
            ledger_entry.entry_type,
            LedgerEntry.EntryType.ADJUSTMENT,
        )

        self.assertEqual(
            ledger_entry.direction,
            LedgerEntry.Direction.CREDIT,
        )

        self.assertEqual(
            ledger_entry.amount,
            Decimal("7000.00"),
        )

        self.assertEqual(
            ledger_entry.balance_after,
            Decimal("22000.00"),
        )

    def test_admin_cannot_approve_more_than_requested(self):
        loan = create_loan_application(
            user=self.user,
            requested_amount=Decimal("5000.00"),
            loan_type=Loan.LoanType.PERSONAL,
            reason="Personal expenses.",
        )

        with self.assertRaises(ValueError):
            approve_loan(
                loan_id=loan.id,
                admin_user=self.admin,
                approved_amount=Decimal("6000.00"),
                interest_rate=Decimal("5.0000"),
                repayment_period_days=60,
                admin_note="Invalid approval.",
            )

        self.wallet.refresh_from_db()

        self.assertEqual(
            self.wallet.balance,
            Decimal("15000.00"),
        )

        loan.refresh_from_db()

        self.assertEqual(
            loan.status,
            Loan.Status.PENDING,
        )

    def test_admin_rejection_does_not_change_wallet(self):
        loan = create_loan_application(
            user=self.user,
            requested_amount=Decimal("6000.00"),
            loan_type=Loan.LoanType.EMERGENCY,
            reason="Emergency expenses.",
        )

        rejected_loan = reject_loan(
            loan_id=loan.id,
            admin_user=self.admin,
            admin_note=(
                "Application rejected after review."
            ),
        )

        self.wallet.refresh_from_db()

        self.assertEqual(
            self.wallet.balance,
            Decimal("15000.00"),
        )

        self.assertEqual(
            rejected_loan.status,
            Loan.Status.REJECTED,
        )

        self.assertIsNotNone(
            rejected_loan.decision_date
        )

        self.assertEqual(
            rejected_loan.reviewed_by,
            self.admin,
        )

        self.assertEqual(
            rejected_loan.admin_note,
            "Application rejected after review.",
        )

        self.assertFalse(
            Transaction.objects.filter(
                user=self.user,
                transaction_type=(
                    Transaction.TransactionType.LOAN
                ),
            ).exists()
        )

    def test_loan_calculates_interest_correctly(self):
        loan = create_loan_application(
            user=self.user,
            requested_amount=Decimal("10000.00"),
            loan_type=Loan.LoanType.BUSINESS,
            reason="Business expansion.",
        )

        approved_loan = approve_loan(
            loan_id=loan.id,
            admin_user=self.admin,
            approved_amount=Decimal("10000.00"),
            interest_rate=Decimal("7.5000"),
            repayment_period_days=120,
        )

        self.assertEqual(
            approved_loan.interest_amount,
            Decimal("750.00"),
        )

        self.assertEqual(
            approved_loan.total_repayment_amount,
            Decimal("10750.00"),
        )