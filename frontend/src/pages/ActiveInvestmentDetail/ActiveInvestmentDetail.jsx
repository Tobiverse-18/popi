import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../api/api";

import "./ActiveInvestmentDetail.css";


export default function ActiveInvestmentDetail() {
  const { reference } = useParams();
  const navigate = useNavigate();

  const [investment, setInvestment] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);


  useEffect(() => {
    const fetchInvestment = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/investments/${reference}/`
        );

        setInvestment(response.data);
      } catch (err) {
        console.error(
          "Failed to load investment:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load this investment."
        );
      } finally {
        setLoading(false);
      }
    };

    if (reference) {
      fetchInvestment();
    }
  }, [reference]);


  const formatMoney = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.00";
    }

    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };


  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };


  const formatDateTime = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };


  const getDaysRemaining = () => {
    if (!investment?.maturity_date) {
      return null;
    }

    const maturity =
      new Date(investment.maturity_date);

    if (Number.isNaN(maturity.getTime())) {
      return null;
    }

    const difference =
      maturity.getTime() - Date.now();

    return Math.max(
      0,
      Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      )
    );
  };


  const getStatusLabel = () => {
    if (!investment) {
      return "";
    }

    const labels = {
      active: "Active",
      matured: "Matured",
      completed: "Completed",
      cancelled: "Cancelled",
    };

    return (
      labels[investment.status] ||
      investment.status
    );
  };


  const getProgress = () => {
    if (
      !investment?.start_date ||
      !investment?.maturity_date
    ) {
      return 0;
    }

    const start =
      new Date(
        investment.start_date
      ).getTime();

    const maturity =
      new Date(
        investment.maturity_date
      ).getTime();

    const now = Date.now();

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(maturity) ||
      maturity <= start
    ) {
      return 0;
    }

    const progress =
      ((now - start) /
        (maturity - start)) *
      100;

    return Math.min(
      100,
      Math.max(0, progress)
    );
  };


  const handleCopy = async () => {
    if (!investment?.reference) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        investment.reference
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };


  const daysRemaining =
    getDaysRemaining();

  const progress =
    getProgress();


  if (loading) {
    return (
      <div className="active-investment-detail-page">

        <header className="active-investment-detail-header">

          <Link
            to="/dashboard"
            className="active-investment-detail-brand"
          >
            <span className="active-investment-detail-brand-mark">
              B
            </span>

            <span>Baloz</span>
          </Link>

        </header>


        <main className="active-investment-detail-content">

          <div className="active-investment-detail-loading">

            <Clock3 size={22} />

            <span>
              Loading investment...
            </span>

          </div>

        </main>

      </div>
    );
  }


  if (error || !investment) {
    return (
      <div className="active-investment-detail-page">

        <header className="active-investment-detail-header">

          <Link
            to="/dashboard"
            className="active-investment-detail-brand"
          >
            <span className="active-investment-detail-brand-mark">
              B
            </span>

            <span>Baloz</span>
          </Link>

        </header>


        <main className="active-investment-detail-content">

          <section className="active-investment-detail-error">

            <div className="active-investment-detail-error-icon">
              <TrendingUp size={25} />
            </div>

            <span>
              INVESTMENT UNAVAILABLE
            </span>

            <h1>
              {error ||
                "Investment not found."}
            </h1>

            <p>
              We couldn't load the investment
              you're looking for.
            </p>

            <Link
              to="/active-investments"
              className="active-investment-detail-error-button"
            >
              <ArrowLeft size={16} />
              Back to active investments
            </Link>

          </section>

        </main>

      </div>
    );
  }


  return (
    <div className="active-investment-detail-page">

      <header className="active-investment-detail-header">

        <Link
          to="/dashboard"
          className="active-investment-detail-brand"
        >
          <span className="active-investment-detail-brand-mark">
            B
          </span>

          <span>Baloz</span>
        </Link>


        <button
          type="button"
          className="active-investment-detail-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />

          <span>
            Back
          </span>
        </button>

      </header>


      <main className="active-investment-detail-content">

        <section className="active-investment-detail-heading">

          <div>

            <span className="active-investment-detail-overline">
              ACTIVE INVESTMENT
            </span>

            <h1>
              {investment.category_name}
            </h1>

            <p>
              {investment.plan_name}
            </p>

          </div>


          <div
            className={`active-investment-detail-status active-investment-detail-status-${investment.status}`}
          >
            <CheckCircle2 size={15} />

            <span>
              {getStatusLabel()}
            </span>
          </div>

        </section>


        <section className="active-investment-detail-value">

          <div>

            <span>
              CURRENT INVESTMENT
            </span>

            <strong>
              {investment.currency}{" "}
              {formatMoney(
                investment.principal_amount
              )}
            </strong>

          </div>


          <div className="active-investment-detail-value-divider" />


          <div>

            <span>
              EXPECTED PROFIT
            </span>

            <strong className="active-investment-detail-profit">
              {investment.currency}{" "}
              {formatMoney(
                investment.return_amount
              )}
            </strong>

          </div>


          <div className="active-investment-detail-value-divider" />


          <div>

            <span>
              AT MATURITY
            </span>

            <strong>
              {investment.currency}{" "}
              {formatMoney(
                investment.total_amount
              )}
            </strong>

          </div>

        </section>


        <section className="active-investment-detail-grid">

          <div className="active-investment-detail-main-card">

            <div className="active-investment-detail-card-header">

              <div>

                <span>
                  INVESTMENT PROGRESS
                </span>

                <h2>
                  Maturity timeline
                </h2>

              </div>

              <TrendingUp size={19} />

            </div>


            <div className="active-investment-detail-progress">

              <div className="active-investment-detail-progress-top">

                <span>
                  {investment.duration_days}{" "}
                  {Number(
                    investment.duration_days
                  ) === 1
                    ? "day"
                    : "days"}
                </span>

                <strong>
                  {daysRemaining === 0
                    ? "Matures today"
                    : daysRemaining === null
                    ? "—"
                    : `${daysRemaining} ${
                        daysRemaining === 1
                          ? "day"
                          : "days"
                      } remaining`}
                </strong>

              </div>


              <div className="active-investment-detail-progress-track">

                <div
                  className="active-investment-detail-progress-fill"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>


              <div className="active-investment-detail-progress-dates">

                <div>

                  <span>
                    START DATE
                  </span>

                  <strong>
                    {formatDate(
                      investment.start_date
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    MATURITY DATE
                  </span>

                  <strong>
                    {formatDate(
                      investment.maturity_date
                    )}
                  </strong>

                </div>

              </div>

            </div>

          </div>


          <aside className="active-investment-detail-side-card">

            <div className="active-investment-detail-card-header">

              <div>

                <span>
                  PLAN DETAILS
                </span>

                <h2>
                  {investment.plan_name}
                </h2>

              </div>

              <ShieldCheck size={19} />

            </div>


            <div className="active-investment-detail-side-rows">

              <div>

                <span>
                  Category
                </span>

                <strong>
                  {investment.category_name}
                </strong>

              </div>


              <div>

                <span>
                  Currency
                </span>

                <strong>
                  {investment.currency}
                </strong>

              </div>


              <div>

                <span>
                  Duration
                </span>

                <strong>
                  {investment.duration_days ||
                    "—"}{" "}
                  {Number(
                    investment.duration_days
                  ) === 1
                    ? "day"
                    : "days"}
                </strong>

              </div>


              <div>

                <span>
                  Investment date
                </span>

                <strong>
                  {formatDate(
                    investment.start_date
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Maturity date
                </span>

                <strong>
                  {formatDate(
                    investment.maturity_date
                  )}
                </strong>

              </div>

            </div>

          </aside>

        </section>


        <section className="active-investment-detail-reference">

          <div className="active-investment-detail-reference-icon">
            <Wallet size={18} />
          </div>


          <div className="active-investment-detail-reference-info">

            <span>
              INVESTMENT REFERENCE
            </span>

            <strong>
              {investment.reference}
            </strong>

          </div>


          <button
            type="button"
            className="active-investment-detail-copy"
            onClick={handleCopy}
          >
            <Copy size={15} />

            <span>
              {copied
                ? "Copied"
                : "Copy reference"}
            </span>
          </button>

        </section>


        <section className="active-investment-detail-information">

          <div className="active-investment-detail-information-icon">
            <CalendarDays size={18} />
          </div>


          <div>

            <strong>
              Investment timeline
            </strong>

            <p>
              Your investment started on{" "}
              {formatDateTime(
                investment.start_date
              )}{" "}
              and is scheduled to mature on{" "}
              {formatDateTime(
                investment.maturity_date
              )}
              .
            </p>

          </div>

        </section>


        <section className="active-investment-detail-note">

          <ShieldCheck size={18} />

          <div>

            <strong>
              Investment information
            </strong>

            <p>
              The expected profit and maturity
              amount shown here are calculated
              from the configuration of your
              selected investment plan. Expected
              returns are not a guarantee of future
              performance.
            </p>

          </div>

        </section>


        <footer className="active-investment-detail-footer">

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

      </main>

    </div>
  );
}