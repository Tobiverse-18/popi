import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  DollarSign,
  Search,
  TrendingUp,
  User,
  X,
  XCircle,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import api from "../../../api/api";

import "./AdminInvestments.css";


const STATUS_LABELS = {
  active: "Active",
  matured: "Matured",
  completed: "Completed",
  cancelled: "Cancelled",
};


const STATUS_ICONS = {
  active: Activity,
  matured: Clock3,
  completed: CheckCircle2,
  cancelled: XCircle,
};


const formatMoney = (amount, currency = "USD") => {
  const value = Number(amount || 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};


const formatDate = (value) => {
  if (!value) return "—";

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


const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};


const getStatusClass = (status) => {
  return `baloz-admin-investment-status baloz-admin-investment-status-${status}`;
};


export default function AdminInvestments() {
  const [investments, setInvestments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedInvestment, setSelectedInvestment] =
    useState(null);

  const [copied, setCopied] = useState("");


  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin-dashboard/investments/"
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setInvestments(data);
      } else if (Array.isArray(data?.results)) {
        setInvestments(data.results);
      } else {
        setInvestments([]);
      }
    } catch (err) {
      console.error(
        "Failed to load admin investments:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load investments."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchInvestments();
  }, []);


  const filteredInvestments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return investments.filter((investment) => {
      const matchesStatus =
        statusFilter === "all" ||
        investment.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        investment.reference,
        investment.username,
        investment.user_email,
        investment.plan_name,
        investment.category_name,
        investment.category_slug,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    });
  }, [
    investments,
    search,
    statusFilter,
  ]);


  const stats = useMemo(() => {
    const active = investments.filter(
      (item) => item.status === "active"
    ).length;

    const matured = investments.filter(
      (item) => item.status === "matured"
    ).length;

    const completed = investments.filter(
      (item) => item.status === "completed"
    ).length;

    const cancelled = investments.filter(
      (item) => item.status === "cancelled"
    ).length;

    const principal = investments.reduce(
      (total, item) =>
        total + Number(item.principal_amount || 0),
      0
    );

    const returns = investments.reduce(
      (total, item) =>
        total + Number(item.return_amount || 0),
      0
    );

    return {
      total: investments.length,
      active,
      matured,
      completed,
      cancelled,
      principal,
      returns,
    };
  }, [investments]);


  const copyValue = async (value, key) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(
        String(value)
      );

      setCopied(key);

      window.setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch (err) {
      console.error(
        "Failed to copy value:",
        err
      );
    }
  };


  const closeModal = () => {
    setSelectedInvestment(null);
  };


  return (
    <div className="baloz-admin-investments-page">

      <div className="baloz-admin-investments-header">

        <div>
          <span className="baloz-admin-investments-eyebrow">
            INVESTMENT OPERATIONS
          </span>

          <h1>
            Investments
          </h1>

          <p>
            Monitor customer investments,
            plans, returns, and maturity
            schedules.
          </p>
        </div>

      </div>


      {error && (
        <div
          className="baloz-admin-investments-error"
          role="alert"
        >
          <XCircle size={18} />

          <span>{error}</span>
        </div>
      )}


      <section className="baloz-admin-investments-stats">

        <div className="baloz-admin-investment-stat">

          <div className="baloz-admin-investment-stat-icon">
            <TrendingUp size={19} />
          </div>

          <div>
            <span>Total investments</span>

            <strong>
              {stats.total}
            </strong>
          </div>

        </div>


        <div className="baloz-admin-investment-stat">

          <div className="baloz-admin-investment-stat-icon">
            <Activity size={19} />
          </div>

          <div>
            <span>Active</span>

            <strong>
              {stats.active}
            </strong>
          </div>

        </div>


        <div className="baloz-admin-investment-stat">

          <div className="baloz-admin-investment-stat-icon">
            <Clock3 size={19} />
          </div>

          <div>
            <span>Matured</span>

            <strong>
              {stats.matured}
            </strong>
          </div>

        </div>


        <div className="baloz-admin-investment-stat">

          <div className="baloz-admin-investment-stat-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Completed</span>

            <strong>
              {stats.completed}
            </strong>
          </div>

        </div>


        <div className="baloz-admin-investment-stat">

          <div className="baloz-admin-investment-stat-icon">
            <DollarSign size={19} />
          </div>

          <div>
            <span>Principal invested</span>

            <strong>
              {formatMoney(stats.principal)}
            </strong>
          </div>

        </div>


        <div className="baloz-admin-investment-stat">

          <div className="baloz-admin-investment-stat-icon">
            <TrendingUp size={19} />
          </div>

          <div>
            <span>Expected returns</span>

            <strong>
              {formatMoney(stats.returns)}
            </strong>
          </div>

        </div>

      </section>


      <section className="baloz-admin-investments-toolbar">

        <div className="baloz-admin-investments-search">

          <Search size={18} />

          <input
            type="search"
            placeholder="Search reference, customer, plan..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>


        <div className="baloz-admin-investments-filters">

          <button
            type="button"
            className={
              statusFilter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("all")
            }
          >
            All
          </button>

          <button
            type="button"
            className={
              statusFilter === "active"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("active")
            }
          >
            Active
          </button>

          <button
            type="button"
            className={
              statusFilter === "matured"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("matured")
            }
          >
            Matured
          </button>

          <button
            type="button"
            className={
              statusFilter === "completed"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("completed")
            }
          >
            Completed
          </button>

          <button
            type="button"
            className={
              statusFilter === "cancelled"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("cancelled")
            }
          >
            Cancelled
          </button>

        </div>

      </section>


      <section className="baloz-admin-investments-table-section">

        <div className="baloz-admin-investments-table-header">

          <div>
            <span>
              INVESTMENT RECORDS
            </span>

            <strong>
              {filteredInvestments.length}{" "}
              {filteredInvestments.length === 1
                ? "investment"
                : "investments"}
            </strong>
          </div>

        </div>


        {loading ? (

          <div className="baloz-admin-investments-state">

            <div className="baloz-admin-investments-loader" />

            <p>
              Loading investment records...
            </p>

          </div>

        ) : filteredInvestments.length === 0 ? (

          <div className="baloz-admin-investments-state">

            <TrendingUp size={30} />

            <strong>
              No investments found
            </strong>

            <p>
              Try adjusting your search or
              status filter.
            </p>

          </div>

        ) : (

          <div className="baloz-admin-investments-table-wrap">

            <table className="baloz-admin-investments-table">

              <thead>
                <tr>
                  <th>Investment</th>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Principal</th>
                  <th>Return</th>
                  <th>Maturity</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>

              <tbody>

                {filteredInvestments.map(
                  (investment) => {

                    const StatusIcon =
                      STATUS_ICONS[
                        investment.status
                      ] || Activity;

                    return (
                      <tr
                        key={
                          investment.id
                        }
                        onClick={() =>
                          setSelectedInvestment(
                            investment
                          )
                        }
                      >

                        <td>

                          <div className="baloz-admin-investment-reference">

                            <strong>
                              {
                                investment.reference
                              }
                            </strong>

                            <span>
                              {formatDate(
                                investment.created_at
                              )}
                            </span>

                          </div>

                        </td>


                        <td>

                          <div className="baloz-admin-investment-customer">

                            <div className="baloz-admin-investment-avatar">
                              <User size={15} />
                            </div>

                            <div>

                              <strong>
                                {
                                  investment.username ||
                                  "Unknown user"
                                }
                              </strong>

                              <span>
                                {
                                  investment.user_email ||
                                  "—"
                                }
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          <div className="baloz-admin-investment-plan">

                            <strong>
                              {
                                investment.plan_name ||
                                "—"
                              }
                            </strong>

                            <span>
                              {
                                investment.category_name ||
                                "—"
                              }
                            </span>

                          </div>

                        </td>


                        <td>

                          <strong>
                            {formatMoney(
                              investment.principal_amount,
                              investment.currency
                            )}
                          </strong>

                        </td>


                        <td>

                          <span className="baloz-admin-investment-return">
                            +
                            {formatMoney(
                              investment.return_amount,
                              investment.currency
                            )}
                          </span>

                        </td>


                        <td>

                          <div className="baloz-admin-investment-maturity">

                            <CalendarDays
                              size={14}
                            />

                            <span>
                              {formatDate(
                                investment.maturity_date
                              )}
                            </span>

                          </div>

                        </td>


                        <td>

                          <span
                            className={getStatusClass(
                              investment.status
                            )}
                          >

                            <StatusIcon
                              size={13}
                            />

                            {
                              STATUS_LABELS[
                                investment.status
                              ] ||
                                investment.status
                            }

                          </span>

                        </td>


                        <td>

                          <button
                            type="button"
                            className="baloz-admin-investment-view"
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              setSelectedInvestment(
                                investment
                              );
                            }}
                          >
                            View
                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {selectedInvestment && (
        <div
          className="baloz-admin-investment-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div
            className="baloz-admin-investment-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Investment details"
          >

            <div className="baloz-admin-investment-modal-header">

              <div>

                <span>
                  INVESTMENT DETAILS
                </span>

                <h2>
                  Investment record
                </h2>

              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close investment details"
              >
                <X size={19} />
              </button>

            </div>


            <div className="baloz-admin-investment-modal-status">

              <span
                className={getStatusClass(
                  selectedInvestment.status
                )}
              >
                {(() => {
                  const Icon =
                    STATUS_ICONS[
                      selectedInvestment.status
                    ] || Activity;

                  return (
                    <Icon size={14} />
                  );
                })()}

                {
                  STATUS_LABELS[
                    selectedInvestment.status
                  ] ||
                    selectedInvestment.status
                }
              </span>

              <span>
                {selectedInvestment.currency}
              </span>

            </div>


            <div className="baloz-admin-investment-modal-reference">

              <span>
                Reference
              </span>

              <div>

                <strong>
                  {
                    selectedInvestment.reference
                  }
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    copyValue(
                      selectedInvestment.reference,
                      "reference"
                    )
                  }
                  aria-label="Copy investment reference"
                >
                  <Copy size={15} />

                  {copied ===
                  "reference"
                    ? "Copied"
                    : "Copy"}
                </button>

              </div>

            </div>


            <div className="baloz-admin-investment-modal-grid">

              <div className="baloz-admin-investment-detail">

                <span>
                  Customer
                </span>

                <strong>
                  {
                    selectedInvestment.username ||
                    "—"
                  }
                </strong>

              </div>


              <div className="baloz-admin-investment-detail">

                <span>
                  Email
                </span>

                <div className="baloz-admin-investment-detail-copy">

                  <strong>
                    {
                      selectedInvestment.user_email ||
                      "—"
                    }
                  </strong>

                  {selectedInvestment.user_email && (
                    <button
                      type="button"
                      onClick={() =>
                        copyValue(
                          selectedInvestment.user_email,
                          "email"
                        )
                      }
                      aria-label="Copy customer email"
                    >
                      <Copy size={14} />
                    </button>
                  )}

                </div>

              </div>


              <div className="baloz-admin-investment-detail">

                <span>
                  Category
                </span>

                <strong>
                  {
                    selectedInvestment.category_name ||
                    "—"
                  }
                </strong>

              </div>


              <div className="baloz-admin-investment-detail">

                <span>
                  Investment plan
                </span>

                <strong>
                  {
                    selectedInvestment.plan_name ||
                    "—"
                  }
                </strong>

              </div>


              <div className="baloz-admin-investment-detail">

                <span>
                  Duration
                </span>

                <strong>
                  {selectedInvestment.duration_days
                    ? `${selectedInvestment.duration_days} days`
                    : "—"}
                </strong>

              </div>


              <div className="baloz-admin-investment-detail">

                <span>
                  Return rate
                </span>

                <strong>
                  {selectedInvestment.return_rate !==
                  null &&
                  selectedInvestment.return_rate !==
                  undefined
                    ? `${Number(
                        selectedInvestment.return_rate
                      ).toFixed(2)}%`
                    : "—"}
                </strong>

              </div>

            </div>


            <div className="baloz-admin-investment-amounts">

              <div>

                <span>
                  Principal
                </span>

                <strong>
                  {formatMoney(
                    selectedInvestment.principal_amount,
                    selectedInvestment.currency
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Expected return
                </span>

                <strong className="positive">
                  +
                  {formatMoney(
                    selectedInvestment.return_amount,
                    selectedInvestment.currency
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Total at maturity
                </span>

                <strong>
                  {formatMoney(
                    selectedInvestment.total_amount,
                    selectedInvestment.currency
                  )}
                </strong>

              </div>

            </div>


            <div className="baloz-admin-investment-dates">

              <div>

                <span>
                  Started
                </span>

                <strong>
                  {formatDateTime(
                    selectedInvestment.start_date
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Maturity date
                </span>

                <strong>
                  {formatDateTime(
                    selectedInvestment.maturity_date
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Created
                </span>

                <strong>
                  {formatDateTime(
                    selectedInvestment.created_at
                  )}
                </strong>

              </div>

            </div>


            <div className="baloz-admin-investment-modal-note">

              <TrendingUp size={17} />

              <p>
                Investment status and maturity
                should be changed by the
                investment processing system.
                Manual wallet adjustments should
                not be performed from this screen.
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}