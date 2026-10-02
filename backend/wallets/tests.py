from decimal import Decimal

from django.test import TestCase

from users.models import User
from .models import LedgerEntry, Wallet
from .services import credit_wallet, debit_wallet


class WalletServiceTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="walletuser",
            email="walletuser@example.com",
            phone_number="08000000001",
            password="StrongPassword123!",
        )

        self.wallet = Wallet.objects.get(user=self.user)

    def test_credit_wallet(self):
        entry = credit_wallet(
            self.wallet.id,
            "1000.00",
            LedgerEntry.EntryType.DEPOSIT,
            "Test deposit",
        )

        self.wallet.refresh_from_db()

        self.assertEqual(self.wallet.balance, Decimal("1000.00"))
        self.assertEqual(entry.amount, Decimal("1000.00"))
        self.assertEqual(entry.direction, LedgerEntry.Direction.CREDIT)
        self.assertEqual(entry.balance_after, Decimal("1000.00"))

    def test_debit_wallet(self):
        credit_wallet(
            self.wallet.id,
            "1000.00",
            LedgerEntry.EntryType.DEPOSIT,
            "Initial funding",
        )

        entry = debit_wallet(
            self.wallet.id,
            "250.00",
            LedgerEntry.EntryType.INVESTMENT,
            "Test investment",
        )

        self.wallet.refresh_from_db()

        self.assertEqual(self.wallet.balance, Decimal("750.00"))
        self.assertEqual(entry.amount, Decimal("250.00"))
        self.assertEqual(entry.direction, LedgerEntry.Direction.DEBIT)
        self.assertEqual(entry.balance_after, Decimal("750.00"))

    def test_insufficient_balance_is_rejected(self):
        credit_wallet(
            self.wallet.id,
            "500.00",
            LedgerEntry.EntryType.DEPOSIT,
            "Initial funding",
        )

        with self.assertRaises(ValueError):
            debit_wallet(
                self.wallet.id,
                "1000.00",
                LedgerEntry.EntryType.WITHDRAWAL,
                "Invalid withdrawal",
            )

        self.wallet.refresh_from_db()

        self.assertEqual(self.wallet.balance, Decimal("500.00"))

    def test_negative_credit_is_rejected(self):
        with self.assertRaises(ValueError):
            credit_wallet(
                self.wallet.id,
                "-100.00",
                LedgerEntry.EntryType.DEPOSIT,
                "Invalid deposit",
            )

    def test_zero_credit_is_rejected(self):
        with self.assertRaises(ValueError):
            credit_wallet(
                self.wallet.id,
                "0.00",
                LedgerEntry.EntryType.DEPOSIT,
                "Invalid deposit",
            )

    def test_negative_debit_is_rejected(self):
        with self.assertRaises(ValueError):
            debit_wallet(
                self.wallet.id,
                "-100.00",
                LedgerEntry.EntryType.INVESTMENT,
                "Invalid investment",
            )

    def test_ledger_entries_are_created(self):
        credit_wallet(
            self.wallet.id,
            "2000.00",
            LedgerEntry.EntryType.DEPOSIT,
            "Test deposit",
        )

        debit_wallet(
            self.wallet.id,
            "500.00",
            LedgerEntry.EntryType.INVESTMENT,
            "Test investment",
        )

        self.assertEqual(
            self.wallet.ledger_entries.count(),
            2,
        )

        self.wallet.refresh_from_db()

        self.assertEqual(
            self.wallet.balance,
            Decimal("1500.00"),
        )