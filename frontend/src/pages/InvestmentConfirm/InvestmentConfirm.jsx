import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { useMemo, useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "../../api/api";

import "./InvestmentConfirm.css";


export default function InvestmentConfirm() {
  const navigate = useNavigate();
  const location = useLocation();

  const plan =
    location.state?.plan;

  const amount =
    Number(location.state?.amount);


  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");


  const returnRate =
    plan?.return_rate === null ||
    plan?.return_rate === undefined
      ? 0
      : Number(
          plan.return_rate
        );


  const expectedProfit =
    Number.isFinite(amount)
      ? (
          amount *
          returnRate
        ) / 100
      : 0;


  const totalAtMaturity =
    Number.isFinite(amount)
      ? amount +
        expectedProfit
      : 0;


  const formattedAmount =
    useMemo(
      () =>
        Number.isFinite(amount)
          ? amount.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )
          : "0.00",
      [amount]
    );


  const formatMoney = (
    value
  ) => {
    if (
      !Number.isFinite(
        Number(value)
      )
    ) {
      return "0.00";
    }

    return Number(value).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };


  const handleConfirm = async () => {
    if (
      !plan ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError(
        "Investment details are invalid."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response =
        await api.post(
          "/investments/create/",
          {
            plan: plan.id,
            amount: amount.toFixed(2),
          }
        );

      navigate(
        `/transactions/${response.data.reference}`,
        {
          replace: true,
          state: {
            investmentCreated: true,
            investment:
              response.data,
          },
        }
      );
    } catch (err) {
      console.error(
        "Investment creation failed:",
        err
      );

      const message =
        err.response?.data?.detail ||
        err.response?.data?.amount?.[0] ||
        "Unable to create this investment. Please try again.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };


  if (!plan || !Number.isFinite(amount)) {
    return (
      <div className="baloz-confirm-page">

        <header className="baloz-confirm-header">

          <Link
            to="/investments"
            className="baloz-confirm-brand"
          >
            <span className="baloz-confirm-brand-mark">
              B
            </span>

            <span>Baloz</span>
          </Link>

        </header>


        <main className="baloz-confirm-content">

          <section className="baloz-confirm-state">

            <strong>
              Investment details unavailable.
            </strong>

            <p>
              Please select an investment plan
              and enter an amount again.
            </p>

            <Link
              to="/investments"
              className="baloz-confirm-state-link"
            >
              Back to investments
            </Link>

          </section>

        </main>

      </div>
    );
  }


  return (
    <div className="baloz-confirm-page">

      <header className="baloz-confirm-header">

        <Link
          to="/investments"
          className="baloz-confirm-brand"
        >
          <span className="baloz-confirm-brand-mark">
            B
          </span>

          <span>Baloz</span>
        </Link>


        <button
          type="button"
          className="baloz-confirm-back"
          onClick={() =>
            navigate(-1)
          }
          disabled={submitting}
        >
          <ArrowLeft size={16} />

          Back
        </button>

      </header>


      <main className="baloz-confirm-content">

        <section className="baloz-confirm-hero">

          <span className="baloz-confirm-overline">
            REVIEW INVESTMENT
          </span>

          <h1>
            Confirm your investment.
          </h1>

          <p>
            Review the details below before
            confirming. Your wallet will be
            debited only after you confirm.
          </p>

        </section>


        {error && (
          <div
            className="baloz-confirm-error"
            role="alert"
          >
            {error}
          </div>
        )}


        <section className="baloz-confirm-layout">

          <div className="baloz-confirm-summary">

            <div className="baloz-confirm-summary-header">

              <div>

                <span>
                  INVESTMENT PLAN
                </span>

                <h2>
                  {plan.name}
                </h2>

              </div>

              <ShieldCheck size={20} />

            </div>


            <div className="baloz-confirm-category">

              <span>
                CATEGORY
              </span>

              <strong>
                {plan.category_name}
              </strong>

            </div>


            <div className="baloz-confirm-rows">

              <div>

                <span>
                  Amount to invest
                </span>

                <strong>
                  {plan.currency}{" "}
                  {formattedAmount}
                </strong>

              </div>


              <div>

                <span>
                  Expected return
                </span>

                <strong>
                  {plan.return_rate ===
                  null
                    ? "Not specified"
                    : `${plan.return_rate}%`}
                </strong>

              </div>


              <div>

                <span>
                  Expected profit
                </span>

                <strong>
                  {plan.currency}{" "}
                  {formatMoney(
                    expectedProfit
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Total at maturity
                </span>

                <strong>
                  {plan.currency}{" "}
                  {formatMoney(
                    totalAtMaturity
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Duration
                </span>

                <strong>
                  <Clock3 size={14} />

                  {plan.duration_days}{" "}
                  {Number(
                    plan.duration_days
                  ) === 1
                    ? "day"
                    : "days"}
                </strong>

              </div>

            </div>

          </div>


          <div className="baloz-confirm-action">

            <div className="baloz-confirm-action-icon">
              <Wallet size={21} />
            </div>

            <h3>
              Ready to invest?
            </h3>

            <p>
              Confirming this investment will
              immediately deduct{" "}
              <strong>
                {plan.currency}{" "}
                {formattedAmount}
              </strong>{" "}
              from your Baloz wallet.
            </p>


            <div className="baloz-confirm-warning">

              <CheckCircle2 size={17} />

              <span>
                Make sure your wallet has enough
                available balance before confirming.
              </span>

            </div>


            <button
              type="button"
              className="baloz-confirm-button"
              onClick={
                handleConfirm
              }
              disabled={submitting}
            >
              {submitting
                ? "Processing..."
                : "Confirm investment"}
            </button>


            <p className="baloz-confirm-note">
              By confirming, you agree that the
              investment amount and selected plan
              are correct.
            </p>

          </div>

        </section>


        <footer className="baloz-confirm-footer">

          <span>Baloz</span>

          <span>
            Financial platform
          </span>

          <span>
            © {new Date().getFullYear()}
          </span>

          
        </footer>

      </main>

    </div>
  );
}