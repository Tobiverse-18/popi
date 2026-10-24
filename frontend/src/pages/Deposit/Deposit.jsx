
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Copy,
  ImagePlus,
  Loader2,
  QrCode,
  ShieldCheck,
  Upload,
  Wallet,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import api from "../../api/api";
import "./Deposit.css";

const CRYPTO_OPTIONS = {
  BTC: {
    label: "Bitcoin",
    network: "Bitcoin Mainnet",
    symbol: "₿",
    warning:
      "Only send BTC through the Bitcoin network. Sending another cryptocurrency or using the wrong network may result in permanent loss of funds.",
  },
  ETH: {
    label: "Ethereum",
    network: "Ethereum Mainnet",
    symbol: "Ξ",
    warning:
      "Only send ETH through Ethereum Mainnet. Do not use another network, even if the wallet address looks the same.",
  },
};

function getWalletAsset(wallet) {
  return String(
    wallet?.asset ||
      wallet?.crypto_currency ||
      wallet?.currency ||
      ""
  ).toUpperCase();
}

function getWalletAddress(wallet) {
  return (
    wallet?.address ||
    wallet?.wallet_address ||
    ""
  );
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (data && typeof data === "object") {
    for (const value of Object.values(data)) {
      if (typeof value === "string") {
        return value;
      }

      if (Array.isArray(value)) {
        const message = value.find(
          (item) => typeof item === "string"
        );

        if (message) return message;
      }
    }
  }

  return fallback;
}

export default function Deposit() {
  const fileInputRef = useRef(null);

  const [wallets, setWallets] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [addressError, setAddressError] = useState("");

  const [cryptoCurrency, setCryptoCurrency] =
    useState("BTC");
  const [paymentMethod, setPaymentMethod] =
    useState("qr");

  const [amount, setAmount] = useState("");
  const [screenshot, setScreenshot] = useState(null);

  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const selectedCrypto = CRYPTO_OPTIONS[cryptoCurrency];

  const selectedWallet = wallets.find(
    (wallet) =>
      getWalletAsset(wallet) === cryptoCurrency &&
      wallet.is_active !== false &&
      Boolean(getWalletAddress(wallet))
  );

  const walletAddress = getWalletAddress(selectedWallet);

  useEffect(() => {
    fetchFundingWallets();
  }, []);

  const fetchFundingWallets = async () => {
    setLoadingAddress(true);
    setAddressError("");

    try {
      const response = await api.get(
        "/payments/funding/config/"
      );

      const data = response.data;
      let configuredWallets = Array.isArray(data?.wallets)
        ? data.wallets
        : [];

      // Support the previous BTC-only configuration response.
      if (
        configuredWallets.length === 0 &&
        data?.bitcoin_address
      ) {
        configuredWallets = [
          {
            asset: "BTC",
            address: data.bitcoin_address,
            network: "Bitcoin",
            is_active: true,
          },
        ];
      }

      setWallets(configuredWallets);
    } catch (error) {
      console.error(
        "Failed to load funding wallets:",
        error
      );

      setAddressError(
        getErrorMessage(
          error,
          "Unable to load funding wallets. Please try again."
        )
      );
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleCryptoChange = (event) => {
    setCryptoCurrency(event.target.value);
    setCopied(false);
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleCopyAddress = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy wallet address:", error);
      setSubmitError(
        "Unable to copy the address automatically. Please select and copy it manually."
      );
    }
  };

  const handleScreenshotChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSubmitError("");
    setSubmitSuccess("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSubmitError(
        "Please upload a JPG, PNG or WEBP image."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError(
        "Your screenshot must be 5MB or smaller."
      );
      event.target.value = "";
      return;
    }

    setScreenshot(file);
  };

  const handleAmountChange = (event) => {
    const value = event.target.value;

    if (
      value === "" ||
      (/^\d*\.?\d{0,2}$/.test(value) &&
        Number(value) >= 0)
    ) {
      setAmount(value);
      setSubmitError("");
      setSubmitSuccess("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");
    setSubmitSuccess("");

    const numericAmount = Number(amount);

    if (
      !amount ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setSubmitError(
        "Enter a valid USD amount greater than zero."
      );
      return;
    }

    if (!walletAddress) {
      setSubmitError(
        `Funding with ${cryptoCurrency} is currently unavailable.`
      );
      return;
    }

    if (!screenshot) {
      setSubmitError(
        "Please upload your payment screenshot."
      );
      return;
    }

    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("crypto_currency", cryptoCurrency);
    formData.append("screenshot", screenshot);

    setSubmitting(true);

    try {
      const response = await api.post(
        "/payments/funding/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const reference = response.data?.reference;

      setSubmitSuccess(
        reference
          ? `Your ${cryptoCurrency} deposit request has been submitted. Reference: ${reference}`
          : "Your deposit request has been submitted successfully."
      );

      setAmount("");
      setScreenshot(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(
        "Funding submission failed:",
        error
      );

      setSubmitError(
        getErrorMessage(
          error,
          "Unable to submit your deposit request."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formattedAmount = amount
    ? Number(amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  return (
    <div className="deposit-page">
      <header className="deposit-header">
        <Link
          to="/dashboard"
          className="deposit-back-link"
        >
          <ArrowLeft size={17} />
          <span>Back to Dashboard</span>
        </Link>

        <div className="deposit-header-brand">
          HarvestCoin
        </div>

        <div className="deposit-header-spacer" />
      </header>

      <main className="deposit-main">
        <section className="deposit-intro">
          <span className="deposit-eyebrow">
            FUND ACCOUNT
          </span>

          <h1>Add funds to your wallet</h1>

          <p>
            Choose a cryptocurrency, send your payment
            using a QR code or wallet address, and upload
            your payment proof for verification.
          </p>
        </section>

        <form
          className="deposit-layout"
          onSubmit={handleSubmit}
        >
          <div className="deposit-primary">
            <section className="deposit-section">
              <div className="deposit-section-heading">
                <div>
                  <span className="deposit-step">01</span>
                  <h2>Choose amount</h2>
                </div>

                <span className="deposit-network">
                  USD Wallet
                </span>
              </div>

              <p className="deposit-section-description">
                Enter the USD amount you want credited
                to your HarvestCoin wallet after your
                payment has been verified.
              </p>

              <div className="deposit-field">
                <label htmlFor="deposit-amount">
                  Amount to add (USD)
                </label>

                <div className="deposit-input-wrap">
                  <span className="deposit-input-prefix">
                    $
                  </span>

                  <input
                    id="deposit-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={handleAmountChange}
                  />
                </div>

                <span className="deposit-field-hint">
                  This is the USD amount you are
                  requesting to have credited. Make sure
                  you understand the payment amount
                  required in your crypto wallet before
                  sending funds.
                </span>
              </div>
            </section>

            <section className="deposit-section">
              <div className="deposit-section-heading">
                <div>
                  <span className="deposit-step">02</span>
                  <h2>Send payment</h2>
                </div>

                <span className="deposit-network">
                  {cryptoCurrency}
                </span>
              </div>

              <p className="deposit-section-description">
                Select your cryptocurrency and payment
                method. Always verify the network before
                sending funds.
              </p>

              <div className="deposit-field">
                <label htmlFor="deposit-crypto">
                  Cryptocurrency
                </label>

                <select
                  id="deposit-crypto"
                  className="deposit-select"
                  value={cryptoCurrency}
                  onChange={handleCryptoChange}
                >
                  <option value="BTC">
                    Bitcoin (BTC)
                  </option>
                  <option value="ETH">
                    Ethereum (ETH)
                  </option>
                </select>
              </div>

              <div className="deposit-payment-summary">
                <span>USD amount requested</span>
                <strong>${formattedAmount}</strong>
              </div>

              <div className="deposit-method-heading">
                <span>Choose payment method</span>
              </div>

              <div
                className="deposit-method-switch"
                role="group"
                aria-label="Payment method"
              >
                <button
                  type="button"
                  className={
                    paymentMethod === "qr"
                      ? "deposit-method-button deposit-method-active"
                      : "deposit-method-button"
                  }
                  onClick={() => setPaymentMethod("qr")}
                  aria-pressed={paymentMethod === "qr"}
                >
                  <QrCode size={17} />
                  QR Code
                </button>

                <button
                  type="button"
                  className={
                    paymentMethod === "address"
                      ? "deposit-method-button deposit-method-active"
                      : "deposit-method-button"
                  }
                  onClick={() => setPaymentMethod("address")}
                  aria-pressed={paymentMethod === "address"}
                >
                  <Wallet size={17} />
                  Wallet Address
                </button>
              </div>

              <div className="deposit-address-box">
                <div className="deposit-address-label">
                  {selectedCrypto.label} payment address
                </div>

                {loadingAddress ? (
                  <div className="deposit-address-loading">
                    <Loader2
                      size={18}
                      className="deposit-spin"
                    />
                    Loading payment wallets...
                  </div>
                ) : addressError ? (
                  <div className="deposit-address-error">
                    {addressError}
                    <button
                      type="button"
                      className="deposit-retry-button"
                      onClick={fetchFundingWallets}
                    >
                      Try again
                    </button>
                  </div>
                ) : !walletAddress ? (
                  <div className="deposit-address-error">
                    {cryptoCurrency} funding is currently
                    unavailable. Please choose another
                    cryptocurrency or contact support.
                  </div>
                ) : paymentMethod === "qr" ? (
                  <div className="deposit-qr-panel">
                    <div className="deposit-qr-frame">
                      <QRCodeSVG
                        value={walletAddress}
                        size={220}
                        level="M"
                        marginSize={2}
                        title={`${selectedCrypto.label} wallet address QR code`}
                        bgColor="#ffffff"
                        fgColor="#080d13"
                      />
                    </div>

                    <div className="deposit-qr-title">
                      Scan to get the wallet address
                    </div>

                    <p className="deposit-qr-description">
                      Open a compatible crypto wallet and
                      scan this QR code. Confirm the
                      displayed address and network before
                      sending.
                    </p>

                    <div className="deposit-qr-address-preview">
                      {walletAddress}
                    </div>

                    <button
                      type="button"
                      className="deposit-copy-button"
                      onClick={handleCopyAddress}
                    >
                      {copied ? (
                        <>
                          <Check size={16} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy address instead
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="deposit-address">
                      {walletAddress}
                    </div>

                    <button
                      type="button"
                      className="deposit-copy-button"
                      onClick={handleCopyAddress}
                    >
                      {copied ? (
                        <>
                          <Check size={16} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy address
                        </>
                      )}
                    </button>

                    <p className="deposit-address-help">
                      Copy this address and paste it into
                      your crypto wallet's recipient field.
                    </p>
                  </>
                )}
              </div>

              {walletAddress && (
                <div className="deposit-network-details">
                  <div>
                    <span>Asset</span>
                    <strong>
                      {selectedCrypto.label} ({cryptoCurrency})
                    </strong>
                  </div>

                  <div>
                    <span>Network</span>
                    <strong>{selectedCrypto.network}</strong>
                  </div>
                </div>
              )}

              <div className="deposit-notice">
                <div className="deposit-notice-icon">
                  <ShieldCheck size={16} />
                </div>

                <p>{selectedCrypto.warning}</p>
              </div>

              <div className="deposit-notice deposit-notice-muted">
                <div className="deposit-notice-icon">
                  <ShieldCheck size={16} />
                </div>

                <p>
                  The QR code contains the wallet address
                  only. It does not confirm a payment or
                  calculate the crypto equivalent of your
                  USD deposit.
                </p>
              </div>
            </section>

            <section className="deposit-section">
              <div className="deposit-section-heading">
                <div>
                  <span className="deposit-step">03</span>
                  <h2>Upload payment proof</h2>
                </div>
              </div>

              <p className="deposit-section-description">
                After completing your payment, upload a
                clear screenshot showing the transaction
                details.
              </p>

              {submitError && (
                <div
                  className="deposit-form-message deposit-form-error"
                  role="alert"
                >
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div
                  className="deposit-form-message deposit-form-success"
                  role="status"
                >
                  <Check size={17} />
                  <span>{submitSuccess}</span>
                </div>
              )}

              <div className="deposit-field">
                <label htmlFor="deposit-screenshot">
                  Payment screenshot
                </label>

                <label
                  htmlFor="deposit-screenshot"
                  className={
                    screenshot
                      ? "deposit-upload deposit-upload-selected"
                      : "deposit-upload"
                  }
                >
                  <input
                    ref={fileInputRef}
                    id="deposit-screenshot"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleScreenshotChange}
                  />

                  {screenshot ? (
                    <>
                      <Check size={20} />

                      <div>
                        <strong>{screenshot.name}</strong>
                        <span>
                          Payment screenshot selected
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImagePlus size={21} />

                      <div>
                        <strong>
                          Upload payment screenshot
                        </strong>
                        <span>JPG, PNG or WEBP · Max 5MB</span>
                      </div>

                      <Upload size={17} />
                    </>
                  )}
                </label>
              </div>

              <button
                type="submit"
                className="deposit-submit-button"
                disabled={
                  submitting ||
                  loadingAddress ||
                  !walletAddress
                }
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={17}
                      className="deposit-spin"
                    />
                    Submitting request...
                  </>
                ) : (
                  `Submit ${cryptoCurrency} deposit`
                )}
              </button>
            </section>
          </div>

          <aside className="deposit-sidebar">
            <div className="deposit-sidebar-block">
              <span className="deposit-sidebar-label">
                DEPOSIT STATUS
              </span>

              <div className="deposit-status-row">
                <span className="deposit-status-dot" />
                <span>Manual verification</span>
              </div>

              <p>
                Your USD wallet is credited only after
                the HarvestCoin team confirms receipt of
                your payment.
              </p>
            </div>

            <div className="deposit-sidebar-block">
              <span className="deposit-sidebar-label">
                HOW IT WORKS
              </span>

              <ol className="deposit-process">
                <li>
                  <span>01</span>
                  <p>Enter the USD amount you want to add.</p>
                </li>

                <li>
                  <span>02</span>
                  <p>
                    Select BTC or ETH, then scan the QR
                    code or copy the wallet address.
                  </p>
                </li>

                <li>
                  <span>03</span>
                  <p>
                    Send crypto over the displayed
                    network and upload your screenshot.
                  </p>
                </li>

                <li>
                  <span>04</span>
                  <p>
                    Your USD wallet is credited after
                    manual verification.
                  </p>
                </li>
              </ol>
            </div>

            <div className="deposit-sidebar-block deposit-security">
              <span className="deposit-sidebar-label">
                IMPORTANT
              </span>

              <p>
                Never send funds to an unverified
                address. Check the asset and network
                carefully before confirming your
                transaction.
              </p>
            </div>
          </aside>
        </form>
      </main>

      <footer className="deposit-footer">
        HarvestCoin
      </footer>
    </div>
  );
}
