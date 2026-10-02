import {
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import api from "../../api/api";

import "./Investments.css";


const categoryMeta = {
  "bitcoin-growth": {
    eyebrow: "DIGITAL ASSETS",
    icon: "₿",
  },

  "crypto-growth": {
    eyebrow: "DIGITAL ASSETS",
    icon: "◈",
  },

  "tech-investment": {
    eyebrow: "EQUITIES",
    icon: "T",
  },

  "us-growth": {
    eyebrow: "EQUITIES",
    icon: "US",
  },
};


export default function Investments() {
  const navigate = useNavigate();

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  const fetchCategories = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get(
        "/investments/categories/"
      );

      const data = response.data;

      setCategories(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load investment categories:",
        err
      );

      setError(
        "Unable to load investment opportunities."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchCategories();
  }, []);


  const handleCategoryClick = (
    category
  ) => {
    navigate(
      `/investments/${category.slug}`
    );
  };


  return (
    <div className="baloz-investments-page">

      <header className="baloz-investments-header">

        <Link
          to="/dashboard"
          className="baloz-investments-brand"
        >
          <span className="baloz-investments-brand-mark">
            B
          </span>

          <span>Baloz</span>
        </Link>


        <Link
          to="/dashboard"
          className="baloz-investments-back"
        >
          <ArrowLeft size={16} />

          Dashboard
        </Link>

      </header>


      <main className="baloz-investments-content">

        <section className="baloz-investments-hero">

          <div>

            <span className="baloz-investments-overline">
              INVESTMENTS
            </span>

            <h1>
              Put your capital to work.
            </h1>

            <p>
              Explore investment categories,
              compare available plans, and
              choose an option that fits your
              strategy.
            </p>

          </div>


          <button
            type="button"
            className="baloz-investments-refresh"
            onClick={() =>
              fetchCategories(true)
            }
            disabled={
              loading ||
              refreshing
            }
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "baloz-investments-refreshing"
                  : ""
              }
            />

            Refresh
          </button>

        </section>


        <section className="baloz-investments-notice">

          <div className="baloz-investments-notice-icon">
            <ShieldCheck size={18} />
          </div>

          <div>
            <strong>
              Structured investment options
            </strong>

            <p>
              Each category contains plans
              with different investment
              amounts, durations, and stated
              expected returns.
            </p>
          </div>

        </section>


        {error && (
          <div
            className="baloz-investments-error"
            role="alert"
          >
            {error}
          </div>
        )}


        <section className="baloz-investments-section">

          <div className="baloz-investments-section-heading">

            <div>
              <span>
                AVAILABLE CATEGORIES
              </span>

              <h2>
                Choose where to invest
              </h2>
            </div>

            {!loading && (
              <span className="baloz-investments-count">
                {categories.length}{" "}
                {categories.length === 1
                  ? "category"
                  : "categories"}
              </span>
            )}

          </div>


          {loading ? (

            <div className="baloz-investments-state">

              <RefreshCw
                size={22}
                className="baloz-investments-spinner"
              />

              <p>
                Loading investment categories...
              </p>

            </div>

          ) : categories.length === 0 ? (

            <div className="baloz-investments-state">

              <TrendingUp size={30} />

              <strong>
                No investment categories available
              </strong>

              <p>
                Investment opportunities will
                appear here when they become
                available.
              </p>

            </div>

          ) : (

            <div className="baloz-investments-grid">

              {categories.map(
                (category) => {

                  const meta =
                    categoryMeta[
                      category.slug.toLowerCase()
                    ] || {
                      eyebrow:
                        "INVESTMENT",
                      icon: "B",
                    };


                  return (
                    <button
                      type="button"
                      key={category.id}
                      className="baloz-investment-category"
                      onClick={() =>
                        handleCategoryClick(
                          category
                        )
                      }
                    >

                      <div className="baloz-investment-category-top">

                        <div className="baloz-investment-category-icon">
                          {meta.icon}
                        </div>

                        <span>
                          {meta.eyebrow}
                        </span>

                      </div>


                      <div className="baloz-investment-category-body">

                        <h3>
                          {category.name}
                        </h3>

                        <p>
                          {category.description ||
                            "Explore available investment plans and choose an option that fits your strategy."}
                        </p>

                      </div>


                      <div className="baloz-investment-category-footer">

                        <span>
                          {category.currency}
                          {" "}investment
                        </span>

                        <span className="baloz-investment-category-action">
                          Explore
                          <ChevronRight
                            size={17}
                          />
                        </span>

                      </div>

                    </button>
                  );
                }
              )}

            </div>
          )}

        </section>


        <footer className="baloz-investments-footer">

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