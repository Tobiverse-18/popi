import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Copy,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Upload,
} from "lucide-react";

import api from "../../api/api";

import "./Deposit.css";

export default function Deposit() {
  const fileInputRef = useRef(null);

  const [bitcoinAddress, setBitcoinAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [addressError, setAddressError] = useState("");

  const [amount, setAmount] = useState("");
  const [screenshot, setScreenshot] = useState(null);

  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    fetchFundingAddress();
  }, []);

  const fetchFundingAddress = async () => {
    setLoadingAddress(true);
    setAddressError("");

    try {
      const response = await api.get(
        "/payments/funding/config/"
      );

      const address =
        response.data?.bitcoin_address || "";

      if (!address) {
        setAddressError(
          "Bitcoin funding is currently unavailable."
        );
        return;
      }

      setBitcoinAddress(address);
    } catch (error) {
      console.error(
        "Failed to load funding address:",
        error
      );

      setAddressError(
        error.response?.data?.detail ||
          "Unable to load the funding address."
      );
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!bitcoinAddress) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        bitcoinAddress
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy Bitcoin address:",
        error
      );
    }
  };

  const handleScreenshotChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSubmitError("");
    setScreenshot(file);
  };

  const handleAmountChange = (event) => {
    const value = event.target.value;

    if (value === "" || Number(value) >= 0) {
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

    if (!amount || numericAmount <= 0) {
      setSubmitError(
        "Enter the amount you want to add to your wallet."
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

    formData.append(
      "amount",
      amount
    );

    formData.append(
      "screenshot",
      screenshot
    );

    setSubmitting(true);

    try {
      const response = await api.post(
        "/payments/funding/",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      const reference =
        response.data?.reference;

      setSubmitSuccess(
        reference
          ? `Your deposit request has been submitted. Reference: ${reference}`
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

      const responseData =
        error.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const firstError =
          Object.values(responseData)
            .flat()
            .find(
              (message) =>
                typeof message === "string"
            );

        setSubmitError(
          firstError ||
            responseData.detail ||
            "Unable to submit your deposit request."
        );
      } else {
        setSubmitError(
          "Unable to submit your deposit request."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

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
          BALOZ
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
            Choose how much you want to add,
            send the required payment to the
            Baloz Bitcoin address, and upload
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
                  <span className="deposit-step">
                    01
                  </span>

                  <h2>Choose amount</h2>
                </div>

                <span className="deposit-network">
                  USD Wallet
                </span>
              </div>

              <p className="deposit-section-description">
                Enter the exact amount you want
                credited to your Baloz USD wallet.
              </p>

              <div className="deposit-field">
                <label htmlFor="deposit-amount">
                  Amount to add
                </label>

                <div className="deposit-input-wrap">
                  <span className="deposit-input-prefix">
                    $
                  </span>

                  <input
                    id="deposit-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={handleAmountChange}
                  />
                </div>

                <span className="deposit-field-hint">
                  Your wallet will be credited with
                  the USD amount you enter, after
                  your payment has been verified.
                </span>
              </div>
            </section>

            <section className="deposit-section">
              <div className="deposit-section-heading">
                <div>
                  <span className="deposit-step">
                    02
                  </span>

                  <h2>Send payment</h2>
                </div>

                <span className="deposit-network">
                  BTC
                </span>
              </div>

              <p className="deposit-section-description">
                Send the required Bitcoin payment
                using the address below. The
                payment is manually verified before
                your wallet is credited.
              </p>

              <div className="deposit-payment-summary">
                <span>
                  Amount to credit
                </span>

                <strong>
                  $
                  {amount
                    ? Number(amount).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )
                    : "0.00"}
                </strong>
              </div>

              <div className="deposit-address-box">
                <div className="deposit-address-label">
                  Baloz BTC payment address
                </div>

                {loadingAddress ? (
                  <div className="deposit-address-loading">
                    <Loader2
                      size={18}
                      className="deposit-spin"
                    />
                    Loading payment address...
                  </div>
                ) : addressError ? (
                  <div className="deposit-address-error">
                    {addressError}
                  </div>
                ) : (
                  <>
                    <div className="deposit-address">
                      {bitcoinAddress}
                    </div>

                    <button
                      type="button"
                      className="deposit-copy-button"
                      onClick={
                        handleCopyAddress
                      }
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
                  </>
                )}
              </div>

              <div className="deposit-notice">
                <div className="deposit-notice-icon">
                  <ShieldCheck size={16} />
                </div>

                <p>
                  Only send BTC through the
                  Bitcoin network to the address
                  shown above. Check the address
                  carefully before confirming your
                  payment.
                </p>
              </div>
            </section>

            <section className="deposit-section">
              <div className="deposit-section-heading">
                <div>
                  <span className="deposit-step">
                    03
                  </span>

                  <h2>Upload payment proof</h2>
                </div>
              </div>

              <p className="deposit-section-description">
                After completing your payment,
                upload a clear screenshot showing
                the payment confirmation.
              </p>

              {submitError && (
                <div className="deposit-form-message deposit-form-error">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="deposit-form-message deposit-form-success">
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
                    onChange={
                      handleScreenshotChange
                    }
                  />

                  {screenshot ? (
                    <>
                      <Check size={20} />

                      <div>
                        <strong>
                          {screenshot.name}
                        </strong>

                        <span>
                          Payment screenshot
                          selected
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImagePlus size={21} />

                      <div>
                        <strong>
                          Upload payment
                          screenshot
                        </strong>

                        <span>
                          JPG, PNG or WEBP · Max
                          5MB
                        </span>
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
                  !bitcoinAddress
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
                  "Submit deposit"
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

                <span>
                  Manual verification
                </span>
              </div>

              <p>
                Your wallet is only credited
                after the Baloz team confirms
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

                  <p>
                    Enter the USD amount you want
                    to add.
                  </p>
                </li>

                <li>
                  <span>02</span>

                  <p>
                    Send the required BTC payment
                    to the Baloz address.
                  </p>
                </li>

                <li>
                  <span>03</span>

                  <p>
                    Upload your payment
                    screenshot.
                  </p>
                </li>

                <li>
                  <span>04</span>

                  <p>
                    Your USD wallet is credited
                    after verification.
                  </p>
                </li>
              </ol>
            </div>

            <div className="deposit-sidebar-block deposit-security">
              <span className="deposit-sidebar-label">
                IMPORTANT
              </span>

              <p>
                Do not send BTC until you have
                checked the payment address
                carefully. Baloz will never ask
                you to send funds to a personal
                address.
              </p>
            </div>
          </aside>
        </form>
      </main>

      <footer className="deposit-footer">
        Designed &amp; Developed by Balora
      </footer>
    </div>
  );
}