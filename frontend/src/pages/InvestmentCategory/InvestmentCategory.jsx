import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../api/api";

import "./InvestmentCategory.css";


export default function InvestmentCategory() {
  const { slug } = useParams();

  const navigate = useNavigate();

  const [category, setCategory] =
    useState(null);

  const [plans, setPlans] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  const fetchPlans = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        categoryResponse,
        plansResponse,
      ] = await Promise.all([
        api.get(
          "/investments/categories/"
        ),
        api.get(
          `/investments/plans/?category=${encodeURIComponent(
            slug
          )}`
        ),
      ]);

      const categories =
        Array.isArray(categoryResponse.data)
          ? categoryResponse.data
          : [];

      const selectedCategory =
        categories.find(
          (item) =>
            item.slug.toLowerCase() ===
            slug.toLowerCase()
        );

      setCategory(
        selectedCategory || null
      );

      setPlans(
        Array.isArray(plansResponse.data)
          ? plansResponse.data
          : []
      );

      if (!selectedCategory) {
        setError(
          "This investment category could not be found."
        );
      }
    } catch (err) {
      console.error(
        "Failed to load investment plans:",
        err
      );

      setError(
        "Unable to load investment plans."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchPlans();
  }, [slug]);


  const formatMoney = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return "—";
    }

    return new Intl.NumberFormat(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  };


  const formatReturn = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Not specified";
    }

    const rate = Number(value);

    if (!Number.isFinite(rate)) {
      return "Not specified";
    }

    return `${rate}%`;
  };


  const formatDuration = (days) => {
    const duration = Number(days);

    if (!Number.isFinite(duration)) {
      return "—";
    }

    return `${duration} ${
      duration === 1
        ? "day"
        : "days"
    }`;
  };


  return (
    <div className="baloz-category-page">

      <header className="baloz-category-header">

        <Link
          to="/investments"
          className="baloz-category-brand"
        >
          <span className="baloz-category-brand-mark">
            B
          </span>

          <span>Baloz</span>
        </Link>


        <Link
          to="/investments"
          className="baloz-category-back"
        >
          <ArrowLeft size={16} />

          Investments
        </Link>

      </header>


      <main className="baloz-category-content">

        {loading ? (

          <section className="baloz-category-state">

            <RefreshCw
              size={24}
              className="baloz-category-spinner"
            />

            <p>
              Loading investment plans...
            </p>

          </section>

        ) : error ? (

          <section className="baloz-category-state baloz-category-state-error">

            <TrendingUp size={30} />

            <strong>
              {error}
            </strong>

            <Link
              to="/investments"
              className="baloz-category-state-link"
            >
              Back to investments
            </Link>

          </section>

        ) : (

          <>

            <section className="baloz-category-hero">

              <div>

                <span className="baloz-category-overline">
                  {category?.currency || "USD"}{" "}
                  INVESTMENT
                </span>

                <h1>
                  {category?.name}
                </h1>

                <p>
                  {category?.description ||
                    "Choose an investment plan that matches your preferred amount, duration, and expected return."}
                </p>

              </div>


              <button
                type="button"
                className="baloz-category-refresh"
                onClick={() =>
                  fetchPlans(true)
                }
                disabled={refreshing}
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "baloz-category-refreshing"
                      : ""
                  }
                />

                Refresh
              </button>

            </section>


            <section className="baloz-category-notice">

              <div className="baloz-category-notice-icon">
                <ShieldCheck size={18} />
              </div>

              <div>

                <strong>
                  Review the plan details carefully
                </strong>

                <p>
                  Minimum and maximum amounts,
                  duration, and stated expected
                  return vary by plan. Returns shown
                  here are the figures configured
                  for this investment option.
                </p>

              </div>

            </section>


            <section className="baloz-category-section">

              <div className="baloz-category-section-heading">

                <div>

                  <span>
                    AVAILABLE PLANS
                  </span>

                  <h2>
                    Choose a plan
                  </h2>

                </div>


                <span className="baloz-category-count">
                  {plans.length}{" "}
                  {plans.length === 1
                    ? "plan"
                    : "plans"}
                </span>

              </div>


              {plans.length === 0 ? (

                <div className="baloz-category-state">

                  <TrendingUp size={30} />

                  <strong>
                    No plans available
                  </strong>

                  <p>
                    There are currently no active
                    plans in this category.
                  </p>

                </div>

              ) : (

                <div className="baloz-plans-list">

                  {plans.map(
                    (plan) => (

                      <button
                        type="button"
                        key={plan.id}
                        className="baloz-plan"
                        onClick={() =>
                          navigate("/investments/plan", {
                            state: {
                              planId: plan.id,
                            },
                          })
                        }
                      >

                        <div className="baloz-plan-main">

                          <div className="baloz-plan-heading">

                            <div>

                              <span className="baloz-plan-label">
                                PLAN
                              </span>

                              <h3>
                                {plan.name}
                              </h3>

                            </div>

                            <span className="baloz-plan-return">
                              {formatReturn(
                                plan.return_rate
                              )}
                            </span>

                          </div>


                          <p className="baloz-plan-description">
                            {plan.description ||
                              `A ${plan.name} plan within ${category?.name || "this category"}.`}
                          </p>


                          <div className="baloz-plan-details">

                            <div>

                              <span>
                                MINIMUM
                              </span>

                              <strong>
                                {plan.currency}{" "}
                                {formatMoney(
                                  plan.minimum_amount
                                )}
                              </strong>

                            </div>


                            <div>

                              <span>
                                MAXIMUM
                              </span>

                              <strong>
                                {plan.maximum_amount
                                  ? `${plan.currency} ${formatMoney(
                                      plan.maximum_amount
                                    )}`
                                  : "No limit"}
                              </strong>

                            </div>


                            <div>

                              <span>
                                DURATION
                              </span>

                              <strong>
                                <Clock3
                                  size={14}
                                />

                                {formatDuration(
                                  plan.duration_days
                                )}
                              </strong>

                            </div>

                          </div>

                        </div>


                        <div className="baloz-plan-action">

                          <span>
                            Review plan
                          </span>

                          <ChevronRight
                            size={18}
                          />

                        </div>

                      </button>

                    )
                  )}

                </div>

              )}

            </section>

          </>

        )}


        <footer className="baloz-category-footer">

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