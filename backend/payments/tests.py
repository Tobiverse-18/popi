
from decimal import Decimal
from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from PIL import Image

from rest_framework import status
from rest_framework.test import APITestCase

from wallets.models import Wallet

from .models import FundingWallet, ManualFundingRequest


User = get_user_model()


class FundingWorkflowTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="fundingadmin",
            email="fundingadmin@example.com",
            password="TestPassword123!",
            phone_number="+2348000000001",
        )

        self.customer = User.objects.create_user(
            username="fundingcustomer",
            email="customer@example.com",
            password="TestPassword123!",
            phone_number="+2348000000002",
        )

        self.wallet = Wallet.objects.get(user=self.customer)
        self.wallet.balance = Decimal("0.00")
        self.wallet.save()

        self.btc_address = "bc1qtestbitcoinaddress000000000000000000"
        self.eth_address = "0x1234567890123456789012345678901234567890"

        FundingWallet.objects.create(
            asset="BTC",
            network="Bitcoin",
            address=self.btc_address,
            is_active=True,
        )

        FundingWallet.objects.create(
            asset="ETH",
            network="Ethereum Mainnet",
            address=self.eth_address,
            is_active=True,
        )

        self.client.force_authenticate(user=self.customer)

        self.config_url = reverse("funding-config")
        self.create_url = reverse("funding-create")
        self.history_url = reverse("funding-history")
        self.admin_list_url = reverse("admin-funding-list")

    def make_screenshot(self):
        """Generate a genuine, valid PNG for image validation."""
        buffer = BytesIO()

        image = Image.new("RGB", (20, 20), color="white")
        image.save(buffer, format="PNG")
        buffer.seek(0)

        return SimpleUploadedFile(
            "payment.png",
            buffer.getvalue(),
            content_type="image/png",
        )

    def create_funding_request(self, asset="BTC", amount="25.00"):
        return self.client.post(
            self.create_url,
            {
                "amount": amount,
                "crypto_currency": asset,
                "screenshot": self.make_screenshot(),
            },
            format="multipart",
        )

    def test_configuration_returns_active_btc_and_eth_wallets(self):
        response = self.client.get(self.config_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            response.data,
        )

        assets = {
            wallet["asset"]: wallet
            for wallet in response.data["wallets"]
        }

        self.assertEqual(assets["BTC"]["address"], self.btc_address)
        self.assertEqual(assets["ETH"]["address"], self.eth_address)
        self.assertEqual(
            assets["ETH"]["network"],
            "Ethereum Mainnet",
        )

    def test_btc_request_uses_bitcoin_address_and_remains_pending(self):
        response = self.create_funding_request("BTC")

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            response.data,
        )

        funding = ManualFundingRequest.objects.get(
            reference=response.data["reference"]
        )

        self.assertEqual(funding.crypto_currency, "BTC")
        self.assertEqual(funding.wallet_address, self.btc_address)
        self.assertEqual(funding.status, "pending")

        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal("0.00"))

    def test_eth_request_uses_ethereum_address_and_remains_pending(self):
        response = self.create_funding_request("ETH")

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            response.data,
        )

        funding = ManualFundingRequest.objects.get(
            reference=response.data["reference"]
        )

        self.assertEqual(funding.crypto_currency, "ETH")
        self.assertEqual(funding.wallet_address, self.eth_address)
        self.assertEqual(funding.status, "pending")

        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal("0.00"))

    def test_unsupported_crypto_asset_is_rejected(self):
        response = self.create_funding_request("DOGE")

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_inactive_eth_wallet_prevents_eth_request(self):
        FundingWallet.objects.filter(asset="ETH").update(is_active=False)

        response = self.create_funding_request("ETH")

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal("0.00"))

    def test_non_admin_cannot_approve_funding(self):
        response = self.create_funding_request("BTC")

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            response.data,
        )

        funding = ManualFundingRequest.objects.get(
            reference=response.data["reference"]
        )

        approval_url = reverse(
            "funding-approve",
            kwargs={"pk": funding.pk},
        )

        response = self.client.post(
            approval_url,
            {"approved_amount": "25.00"},
            format="json",
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            ],
        )

    def test_duplicate_approval_does_not_credit_wallet_twice(self):
        response = self.create_funding_request("BTC")

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            response.data,
        )

        funding = ManualFundingRequest.objects.get(
            reference=response.data["reference"]
        )

        approval_url = reverse(
            "funding-approve",
            kwargs={"pk": funding.pk},
        )

        self.client.force_authenticate(user=self.admin)

        first_response = self.client.post(
            approval_url,
            {"approved_amount": "25.00"},
            format="json",
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_200_OK,
            first_response.data,
        )

        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal("25.00"))

        second_response = self.client.post(
            approval_url,
            {"approved_amount": "25.00"},
            format="json",
        )

        self.assertGreaterEqual(second_response.status_code, 400)

        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal("25.00"))

    def test_admin_cannot_approve_more_than_requested(self):
        response = self.create_funding_request("BTC", "25.00")

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            response.data,
        )

        funding = ManualFundingRequest.objects.get(
            reference=response.data["reference"]
        )

        approval_url = reverse(
            "funding-approve",
            kwargs={"pk": funding.pk},
        )

        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            approval_url,
            {"approved_amount": "30.00"},
            format="json",
        )

        self.assertGreaterEqual(response.status_code, 400)

        funding.refresh_from_db()
        self.assertEqual(funding.status, "pending")

        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal("0.00"))

    def test_rejection_does_not_credit_wallet(self):
        response = self.create_funding_request("BTC")

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            response.data,
        )

        funding = ManualFundingRequest.objects.get(
            reference=response.data["reference"]
        )

        rejection_url = reverse(
            "funding-reject",
            kwargs={"pk": funding.pk},
        )

        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            rejection_url,
            {"admin_note": "Payment could not be verified."},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            response.data,
        )

        funding.refresh_from_db()
        self.assertEqual(funding.status, "rejected")

        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, Decimal("0.00"))

    def test_customer_can_view_funding_history(self):
        response = self.create_funding_request("ETH")

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            response.data,
        )

        response = self.client.get(self.history_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
            response.data,
        )

    def test_admin_funding_list_requires_admin(self):
        response = self.client.get(self.admin_list_url)

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            ],
        )
