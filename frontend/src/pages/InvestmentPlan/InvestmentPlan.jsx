import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "../../api/api";

import "./InvestmentPlan.css";


export default function InvestmentPlan() {
  const navigate = useNavigate();
  const location = useLocation();

  const planId =
    location.state?.planId;

  const [plan, setPlan] =
    useState(null);

  const [amount, setAmount] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) {
        setError(
          "No investment plan was selected."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/investments/plans/"
          );

        const plans =
          Array.isArray(response.data)
            ? response.data
            : [];

        const selectedPlan =
          plans.find(
            (item) =>
              Number(item.id) ===
              Number(planId)
          );

        if (!selectedPlan) {
          setError(
            "The selected investment plan could not be found."
          );

          return;
        }

        setPlan(selectedPlan);

        setAmount(
          Number(
            selectedPlan.minimum_amount
          ).toFixed(2)
        );
      } catch (err) {
        console.error(
          "Failed to load investment plan:",
          err
        );

        setError(
          "Unable to load this investment plan."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);


  const numericAmount =
    Number(amount);


  const minimumAmount =
    Number(
      plan?.minimum_amount
    );


  const maximumAmount =
    plan?.maximum_amount === null ||
    plan?.maximum_amount === undefined
      ? null
      : Number(
          plan.maximum_amount
        );


  const returnRate =
    plan?.return_rate === null ||
    plan?.return_rate === undefined
      ? 0
      : Number(
          plan.return_rate
        );


  const expectedProfit =
    Number.isFinite(
      numericAmount
    )
      ? (
          numericAmount *
          returnRate
        ) / 100
      : 0;


  const totalAtMaturity =
    Number.isFinite(
      numericAmount
    )
      ? numericAmount +
        expectedProfit
      : 0;


  const amountError = useMemo(() => {
    if (!plan) {
      return "";
    }

    if (
      amount === "" ||
      !Number.isFinite(
        numericAmount
      )
    ) {
      return "Enter an investment amount.";
    }

    if (
      numericAmount <= 0
    ) {
      return "Amount must be greater than zero.";
    }

    if (
      numericAmount <
      minimumAmount
    ) {
      return `Minimum investment is ${plan.currency} ${minimumAmount.toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}.`;
    }

    if (
      maximumAmount !== null &&
      numericAmount >
        maximumAmount
    ) {
      return `Maximum investment is ${plan.currency} ${maximumAmount.toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}.`;
    }

    return "";
  }, [
    amount,
    numericAmount,
    minimumAmount,
    maximumAmount,
    plan,
  ]);


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


  const handleContinue = () => {
    if (amountError) {
      return;
    }

    navigate(
      "/investments/confirm",
      {
        state: {
          plan,
          amount: numericAmount,
        },
      }
    );
  };


  if (loading) {
    return (
      <div className="baloz-plan-page">

        <main className="baloz-plan-content">

          <section className="baloz-plan-state">
            <p>
              Loading investment plan...
            </p>
          </section>

        </main>

      </div>
    );
  }


  if (error || !plan) {
    return (
      <div className="baloz-plan-page">

        <header className="baloz-plan-header">

          <Link
            to="/investments"
            className="baloz-plan-brand"
          >
            <span className="baloz-plan-brand-mark">
              B
            </span>

            <span>Baloz</span>
          </Link>

        </header>


        <main className="baloz-plan-content">

          <section className="baloz-plan-state">

            <strong>
              {error ||
                "Investment plan unavailable."}
            </strong>

            <Link
              to="/investments"
              className="baloz-plan-state-link"
            >
              Back to investments
            </Link>

          </section>

        </main>

      </div>
    );
  }


  return (
    <div className="baloz-plan-page">

      <header className="baloz-plan-header">

        <Link
          to="/investments"
          className="baloz-plan-brand"
        >
          <span className="baloz-plan-brand-mark">
            B
          </span>

          <span>Baloz</span>
        </Link>


        <Link
          to={`/investments/${plan.category_slug}`}
          className="baloz-plan-back"
        >
          <ArrowLeft size={16} />

          {plan.category_name}
        </Link>

      </header>


      <main className="baloz-plan-content">

        <section className="baloz-plan-hero">

          <div>

            <span className="baloz-plan-overline">
              {plan.category_name}
            </span>

            <h1>
              {plan.name}
            </h1>

            <p>
              {plan.description ||
                `Review the ${plan.name} plan and choose how much you want to invest.`}
            </p>

          </div>

        </section>


        <section className="baloz-plan-layout">

          <div className="baloz-plan-information">

            <div className="baloz-plan-info-header">

              <span>
                PLAN DETAILS
              </span>

              <ShieldCheck size={18} />

            </div>


            <div className="baloz-plan-info-row">

              <span>
                Investment range
              </span>

              <strong>
                {plan.currency}{" "}
                {formatMoney(
                  plan.minimum_amount
                )}

                {" — "}

                {plan.maximum_amount
                  ? `${plan.currency} ${formatMoney(
                      plan.maximum_amount
                    )}`
                  : "No limit"}
              </strong>

            </div>


            <div className="baloz-plan-info-row">

              <span>
                Duration
              </span>

              <strong>
                <Clock3 size={15} />

                {plan.duration_days}{" "}
                {Number(
                  plan.duration_days
                ) === 1
                  ? "day"
                  : "days"}
              </strong>

            </div>


            <div className="baloz-plan-info-row">

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


            <div className="baloz-plan-info-row">

              <span>
                Currency
              </span>

              <strong>
                {plan.currency}
              </strong>

            </div>


            <div className="baloz-plan-security">

              <Wallet size={17} />

              <p>
                Your investment amount will be
                deducted from your Baloz wallet
                only after you confirm the
                investment.
              </p>

            </div>

          </div>


          <div className="baloz-plan-calculator">

            <div className="baloz-plan-calculator-header">

              <span>
                INVESTMENT AMOUNT
              </span>

              <span>
                {plan.currency}
              </span>

            </div>


            <label
              htmlFor="investment-amount"
              className="baloz-plan-input-label"
            >
              Amount to invest
            </label>


            <div className="baloz-plan-input-wrap">

              <span>
                $
              </span>

              <input
                id="investment-amount"
                type="number"
                min={
                  plan.minimum_amount
                }
                max={
                  plan.maximum_amount ||
                  undefined
                }
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
                placeholder="0.00"
              />

            </div>


            {amountError && (
              <p className="baloz-plan-input-error">
                {amountError}
              </p>
            )}


            <div className="baloz-plan-results">

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

            </div>


            <button
              type="button"
              className="baloz-plan-continue"
              onClick={
                handleContinue
              }
              disabled={
                Boolean(
                  amountError
                )
              }
            >
              Continue

              <ArrowRight
                size={17}
              />

            </button>


            <p className="baloz-plan-disclaimer">
              Expected return is based on the
              rate configured for this plan.
              Final investment processing is
              subject to Baloz platform rules.
            </p>

          </div>

        </section>


        <footer className="baloz-plan-footer">

          <span>Baloz</span>

          <span>
            Financial platform
          </span>

          <span>
            © {new Date().getFullYear()}
          </span>

          <span>
            Designed & Developed by Balora
          </span>

        </footer>

      </main>

    </div>
  );
}