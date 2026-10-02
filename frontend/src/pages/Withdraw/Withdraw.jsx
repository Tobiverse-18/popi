import {
  ArrowLeft,
  ArrowUpFromLine,
  Check,
  ChevronRight,
  Copy,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import api from "../../api/api";

import "./Withdraw.css";


const formatWalletBalance = (value) => {
  if (value === null || value === undefined) {
    return "—";
  }

  return `$${Number(value).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};


export default function Withdraw() {

  const [walletBalance, setWalletBalance] =
    useState(null);

  const [walletLoading, setWalletLoading] =
    useState(true);

  const [amount, setAmount] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(null);

  const [copied, setCopied] =
    useState(false);


  const fetchWallet = async () => {
    try {
      setWalletLoading(true);
      setError("");

      const response = await api.get(
        "/wallet/"
      );

      setWalletBalance(
        response.data?.balance ?? null
      );
    } catch (err) {
      console.error(
        "Failed to load wallet:",
        err
      );

      setError(
        "Unable to load your wallet balance."
      );
    } finally {
      setWalletLoading(false);
    }
  };


  useEffect(() => {
    fetchWallet();
  }, []);


  const numericAmount =
    Number(amount);


  const remainingBalance =
    walletBalance !== null &&
    Number.isFinite(numericAmount) &&
    numericAmount > 0
      ? Number(walletBalance) -
        numericAmount
      : walletBalance;


  const handleMaxAmount = () => {
    if (
      walletBalance === null ||
      walletBalance === undefined
    ) {
      return;
    }

    setAmount(
      Number(walletBalance).toFixed(2)
    );
  };


  const handleCopyDestination = async () => {
    if (!destination.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        destination.trim()
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.error(
        "Failed to copy wallet address:",
        err
      );
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(null);

    const cleanAmount =
      amount.trim();

    const cleanDestination =
      destination.trim();

    const parsedAmount =
      Number(cleanAmount);

    if (!cleanAmount) {
      setError(
        "Enter the amount you want to withdraw."
      );
      return;
    }

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      setError(
        "Enter a valid withdrawal amount."
      );
      return;
    }

    if (
      walletBalance === null ||
      walletBalance === undefined
    ) {
      setError(
        "Your wallet balance is unavailable. Please try again."
      );
      return;
    }

    if (
      parsedAmount >
      Number(walletBalance)
    ) {
      setError(
        "Withdrawal amount cannot exceed your available balance."
      );
      return;
    }

    if (!cleanDestination) {
      setError(
        "Enter the crypto wallet address you want to withdraw to."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        "/transactions/withdraw/",
        {
          amount: parsedAmount.toFixed(2),
          destination: cleanDestination,
          currency: "USD",
        }
      );

      setSuccess(response.data);

      setAmount("");
      setDestination("");

      setWalletBalance(
        response.data?.wallet_balance ??
          (
            Number(walletBalance) -
            parsedAmount
          ).toFixed(2)
      );
    } catch (err) {
      console.error(
        "Withdrawal failed:",
        err
      );

      const responseData =
        err.response?.data;

      const detail =
        typeof responseData?.detail ===
        "string"
          ? responseData.detail
          : "We could not process your withdrawal. Please try again.";

      setError(detail);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="baloz-withdraw-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="baloz-withdraw-header">

        <Link
          to="/dashboard"
          className="baloz-withdraw-brand"
        >
          <span className="baloz-withdraw-brand-mark">
            B
          </span>

          <span>
            Baloz
          </span>
        </Link>


        <Link
          to="/dashboard"
          className="baloz-withdraw-back"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>

      </header>


      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="baloz-withdraw-content">

        <div className="baloz-withdraw-intro">

          <span className="baloz-withdraw-overline">
            WALLET
          </span>

          <h1>
            Withdraw funds
          </h1>

          <p>
            Send funds from your Baloz wallet
            to a crypto wallet address.
          </p>

        </div>


        <div className="baloz-withdraw-layout">

          {/* ==================================================
              FORM
          ================================================== */}

          <section className="baloz-withdraw-form-panel">

            <div className="baloz-withdraw-panel-heading">

              <div>

                <span className="baloz-withdraw-label">
                  WITHDRAWAL
                </span>

                <h2>
                  Send crypto
                </h2>

              </div>

              <div className="baloz-withdraw-icon">
                <ArrowUpFromLine size={19} />
              </div>

            </div>


            {/* BALANCE */}

            <div className="baloz-withdraw-balance">

              <div>

                <span>
                  Available balance
                </span>

                <strong>
                  {walletLoading
                    ? "Loading..."
                    : formatWalletBalance(
                        walletBalance
                      )}
                </strong>

              </div>


              <Wallet size={19} />

            </div>


            <form
              onSubmit={handleSubmit}
              className="baloz-withdraw-form"
            >

              {/* AMOUNT */}

              <div className="baloz-withdraw-field">

                <div className="baloz-withdraw-field-header">

                  <label htmlFor="withdraw-amount">
                    Amount
                  </label>

                  <button
                    type="button"
                    onClick={
                      handleMaxAmount
                    }
                    disabled={
                      walletLoading ||
                      walletBalance === null
                    }
                  >
                    Max
                  </button>

                </div>


                <div className="baloz-withdraw-input-wrap">

                  <span className="baloz-withdraw-currency">
                    USD
                  </span>

                  <input
                    id="withdraw-amount"
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(event) =>
                      setAmount(
                        event.target.value
                      )
                    }
                    disabled={submitting}
                  />

                </div>

              </div>


              {/* DESTINATION */}

              <div className="baloz-withdraw-field">

                <div className="baloz-withdraw-field-header">

                  <label htmlFor="withdraw-destination">
                    Crypto wallet address
                  </label>

                </div>


                <div className="baloz-withdraw-input-wrap baloz-withdraw-address-wrap">

                  <input
                    id="withdraw-destination"
                    type="text"
                    placeholder="Enter wallet address"
                    value={destination}
                    onChange={(event) =>
                      setDestination(
                        event.target.value
                      )
                    }
                    disabled={submitting}
                    autoComplete="off"
                  />

                  <button
                    type="button"
                    className="baloz-withdraw-copy"
                    onClick={
                      handleCopyDestination
                    }
                    disabled={
                      !destination.trim()
                    }
                    title="Copy wallet address"
                    aria-label="Copy wallet address"
                  >
                    {copied ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>

                </div>


                <span className="baloz-withdraw-field-help">
                  Double-check the address before
                  submitting. Crypto transfers cannot
                  normally be reversed.
                </span>

              </div>


              {/* ERROR */}

              {error && (
                <div
                  className="baloz-withdraw-message baloz-withdraw-error"
                  role="alert"
                >
                  {error}
                </div>
              )}


              {/* SUCCESS */}

              {success && (
                <div
                  className="baloz-withdraw-message baloz-withdraw-success"
                  role="status"
                >

                  <div className="baloz-withdraw-success-icon">
                    <Check size={17} />
                  </div>

                  <div>

                    <strong>
                      Withdrawal submitted
                    </strong>

                    <span>
                      Your balance has been
                      deducted and the
                      withdrawal is being
                      processed.
                    </span>

                    {success.reference && (
                      <small>
                        Reference:{" "}
                        {success.reference}
                      </small>
                    )}

                  </div>

                </div>
              )}


              {/* REVIEW */}

              <div className="baloz-withdraw-review">

                <div>

                  <span>
                    Withdrawal amount
                  </span>

                  <strong>
                    {amount
                      ? `$${Number(
                          amount
                        ).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}`
                      : "$0.00"}
                  </strong>

                </div>


                <div>

                  <span>
                    Remaining balance
                  </span>

                  <strong>
                    {remainingBalance !==
                      null &&
                    Number.isFinite(
                      Number(
                        remainingBalance
                      )
                    )
                      ? formatWalletBalance(
                          Math.max(
                            0,
                            Number(
                              remainingBalance
                            )
                          )
                        )
                      : "—"}
                  </strong>

                </div>

              </div>


              <button
                type="submit"
                className="baloz-withdraw-submit"
                disabled={submitting}
              >

                {submitting ? (
                  <>
                    <span className="baloz-withdraw-spinner" />
                    Processing withdrawal...
                  </>
                ) : (
                  <>
                    <ArrowUpFromLine
                      size={17}
                    />
                    Withdraw funds
                    <ChevronRight
                      size={17}
                    />
                  </>
                )}

              </button>

            </form>

          </section>


          {/* ==================================================
              INFORMATION
          ================================================== */}

          <aside className="baloz-withdraw-info">

            <div className="baloz-withdraw-info-block">

              <div className="baloz-withdraw-info-icon">
                <ShieldCheck size={18} />
              </div>

              <div>

                <strong>
                  Secure withdrawal
                </strong>

                <p>
                  Your wallet balance is checked
                  and updated securely on the
                  Baloz server.
                </p>

              </div>

            </div>


            <div className="baloz-withdraw-info-divider" />


            <div className="baloz-withdraw-info-block">

              <div className="baloz-withdraw-info-number">
                01
              </div>

              <div>

                <strong>
                  Enter an amount
                </strong>

                <p>
                  Choose how much USD you want
                  to withdraw from your available
                  balance.
                </p>

              </div>

            </div>


            <div className="baloz-withdraw-info-block">

              <div className="baloz-withdraw-info-number">
                02
              </div>

              <div>

                <strong>
                  Add your wallet
                </strong>

                <p>
                  Enter the crypto wallet address
                  that should receive the transfer.
                </p>

              </div>

            </div>


            <div className="baloz-withdraw-info-block">

              <div className="baloz-withdraw-info-number">
                03
              </div>

              <div>

                <strong>
                  Submit
                </strong>

                <p>
                  Your Baloz balance is deducted
                  immediately and the withdrawal
                  moves into processing.
                </p>

              </div>

            </div>


            <div className="baloz-withdraw-warning">

              <strong>
                Important
              </strong>

              <p>
                Make sure the wallet address is
                correct and compatible with the
                crypto network being used. Sending
                crypto to an incorrect address may
                result in permanent loss.
              </p>

            </div>

          </aside>

        </div>

      </main>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="baloz-withdraw-footer">

        <span>
          Baloz
        </span>

        <span>
          Financial platform
        </span>

        <span>
          © {new Date().getFullYear()}
        </span>

        

      </footer>

    </div>
  );
}