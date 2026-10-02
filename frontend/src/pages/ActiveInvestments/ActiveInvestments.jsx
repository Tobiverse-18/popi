import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../../api/api";

import "./ActiveInvestments.css";


export default function ActiveInvestments() {
  const navigate = useNavigate();

  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");


  const fetchInvestments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/investments/");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setInvestments(data);
    } catch (err) {
      console.error(
        "Failed to load active investments:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load your investments."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchInvestments();
  }, []);


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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };


  const getDaysRemaining = (maturityDate) => {
    if (!maturityDate) {
      return null;
    }

    const maturity = new Date(maturityDate);

    if (Number.isNaN(maturity.getTime())) {
      return null;
    }

    const now = new Date();

    const difference =
      maturity.getTime() - now.getTime();

    return Math.max(
      0,
      Math.ceil(
        difference / (1000 * 60 * 60 * 24)
      )
    );
  };


  const activeInvestments =
    investments.filter(
      (investment) =>
        investment.status === "active"
    );


  const totalInvested =
    activeInvestments.reduce(
      (total, investment) =>
        total +
        Number(
          investment.principal_amount || 0
        ),
      0
    );


  const totalExpectedProfit =
    activeInvestments.reduce(
      (total, investment) =>
        total +
        Number(
          investment.return_amount || 0
        ),
      0
    );


  const totalAtMaturity =
    activeInvestments.reduce(
      (total, investment) =>
        total +
        Number(
          investment.total_amount || 0
        ),
      0
    );


  if (loading) {
    return (
      <div className="active-investments-page">

        <header className="active-investments-header">

          <Link
            to="/dashboard"
            className="active-investments-brand"
          >
            <span className="active-investments-brand-mark">
              B
            </span>

            <span>Baloz</span>
          </Link>

        </header>


        <main className="active-investments-content">

          <div className="active-investments-loading">

            <RefreshCw size={22} />

            <span>
              Loading active investments...
            </span>

          </div>

        </main>

      </div>
    );
  }


  return (
    <div className="active-investments-page">

      <header className="active-investments-header">

        <Link
          to="/dashboard"
          className="active-investments-brand"
        >
          <span className="active-investments-brand-mark">
            B
          </span>

          <span>Baloz</span>
        </Link>


        <Link
          to="/dashboard"
          className="active-investments-back"
        >
          <ArrowLeft size={16} />

          <span>
            Dashboard
          </span>
        </Link>

      </header>


      <main className="active-investments-content">

        <section className="active-investments-hero">

          <div>

            <span className="active-investments-overline">
              PORTFOLIO
            </span>

            <h1>
              Active investments
            </h1>

            <p>
              Track your current investments,
              expected returns, and maturity dates.
            </p>

          </div>


          <button
            type="button"
            className="active-investments-refresh"
            onClick={() => fetchInvestments(true)}
            disabled={refreshing}
          >

            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "active-investments-refresh-spin"
                  : ""
              }
            />

            <span>
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </span>

          </button>

        </section>


        {error && (
          <div
            className="active-investments-error"
            role="alert"
          >

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() => fetchInvestments()}
            >
              Try again
            </button>

          </div>
        )}


        {!error &&
          activeInvestments.length > 0 && (
            <>

              <section className="active-investments-summary">

                <div className="active-investments-summary-item">

                  <span>
                    Active investments
                  </span>

                  <strong>
                    {activeInvestments.length}
                  </strong>

                </div>


                <div className="active-investments-summary-item">

                  <span>
                    Total invested
                  </span>

                  <strong>
                    USD {formatMoney(totalInvested)}
                  </strong>

                </div>


                <div className="active-investments-summary-item">

                  <span>
                    Expected profit
                  </span>

                  <strong className="active-investments-profit">
                    USD {formatMoney(
                      totalExpectedProfit
                    )}
                  </strong>

                </div>


                <div className="active-investments-summary-item">

                  <span>
                    At maturity
                  </span>

                  <strong>
                    USD {formatMoney(
                      totalAtMaturity
                    )}
                  </strong>

                </div>

              </section>


              <section className="active-investments-list">

                <div className="active-investments-list-header">

                  <div>

                    <span>
                      CURRENT POSITIONS
                    </span>

                    <h2>
                      Your active investments
                    </h2>

                  </div>

                  <ShieldCheck size={19} />

                </div>


                <div className="active-investments-items">

                  {activeInvestments.map(
                    (investment) => {

                      const daysRemaining =
                        getDaysRemaining(
                          investment.maturity_date
                        );

                      return (
                        <button
                          type="button"
                          key={investment.id}
                          className="active-investment-item"
                          onClick={() =>
                            navigate(
                              `/active-investments/${investment.reference}`
                            )
                          }
                        >

                          <div className="active-investment-main">

                            <div className="active-investment-icon">
                              <TrendingUp size={19} />
                            </div>


                            <div className="active-investment-name">

                              <strong>
                                {investment.category_name}
                              </strong>

                              <span>
                                {investment.plan_name}
                              </span>

                            </div>

                          </div>


                          <div className="active-investment-amount">

                            <span>
                              Invested
                            </span>

                            <strong>
                              {investment.currency}{" "}
                              {formatMoney(
                                investment.principal_amount
                              )}
                            </strong>

                          </div>


                          <div className="active-investment-return">

                            <span>
                              Expected profit
                            </span>

                            <strong>
                              {investment.currency}{" "}
                              {formatMoney(
                                investment.return_amount
                              )}
                            </strong>

                          </div>


                          <div className="active-investment-maturity">

                            <span>
                              Maturity
                            </span>

                            <strong>
                              <Clock3 size={14} />

                              {formatDate(
                                investment.maturity_date
                              )}
                            </strong>

                            {daysRemaining !== null && (
                              <small>
                                {daysRemaining === 0
                                  ? "Matures today"
                                  : `${daysRemaining} ${
                                      daysRemaining === 1
                                        ? "day"
                                        : "days"
                                    } remaining`}
                              </small>
                            )}

                          </div>


                          <div className="active-investment-arrow">

                            <ArrowRight size={17} />

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>

              </section>

            </>
          )}


        {!error &&
          activeInvestments.length === 0 && (
            <section className="active-investments-empty">

              <div className="active-investments-empty-icon">
                <TrendingUp size={25} />
              </div>

              <span className="active-investments-empty-label">
                NO ACTIVE INVESTMENTS
              </span>

              <h2>
                You don't have an active investment.
              </h2>

              <p>
                Explore the available investment
                plans and choose one that suits you.
              </p>

              <Link
                to="/investments"
                className="active-investments-empty-button"
              >
                Explore investments
                <ArrowRight size={16} />
              </Link>

            </section>
          )}


        <section className="active-investments-note">

          <ShieldCheck size={18} />

          <div>

            <strong>
              Investment information
            </strong>

            <p>
              Expected returns and maturity
              amounts are calculated from the
              configuration of your selected
              investment plan. They are not a
              guarantee of future performance.
            </p>

          </div>

        </section>


        <footer className="active-investments-footer">

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