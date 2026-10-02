import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  ChevronRight,
  CircleDollarSign,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import api from "../../api/api";

import "./Transactions.css";


const formatAmount = (amount, direction) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "—";
  }

  const sign =
    direction === "credit"
      ? "+"
      : direction === "debit"
        ? "-"
        : "";

  return `${sign}$${Math.abs(numericAmount).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};


const formatDate = (value) => {
  if (!value) {
    return "—";
  }

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


const getTransactionLabel = (type) => {
  const labels = {
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    investment: "Investment",
    maturity: "Investment maturity",
    refund: "Refund",
    fee: "Fee",
  };

  return labels[type] || "Transaction";
};


const getTransactionIcon = (type) => {
  if (type === "deposit") {
    return <ArrowDownToLine size={17} />;
  }

  if (type === "withdrawal") {
    return <ArrowUpFromLine size={17} />;
  }

  if (type === "investment") {
    return <TrendingUp size={17} />;
  }

  return <CircleDollarSign size={17} />;
};


const getStatusLabel = (status) => {
  const labels = {
    pending: "Pending",
    processing: "Processing",
    success: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
  };

  return labels[status] || status;
};


export default function Transactions() {
  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [search, setSearch] =
    useState("");


  const fetchTransactions = async (
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
        "/transactions/"
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setTransactions(data);
      } else if (
        Array.isArray(data?.results)
      ) {
        setTransactions(data.results);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error(
        "Failed to load transactions:",
        err
      );

      setError(
        "Unable to load your transaction history."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchTransactions();
  }, []);


  const filteredTransactions =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return transactions.filter(
        (transaction) => {
          const matchesFilter =
            filter === "all" ||
            transaction.transaction_type ===
              filter;

          if (!matchesFilter) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          const searchableText = [
            transaction.reference,
            transaction.destination,
            transaction.description,
            transaction.status,
            transaction.transaction_type,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            normalizedSearch
          );
        }
      );
    }, [
      transactions,
      filter,
      search,
    ]);


  return (
    <div className="baloz-transactions-page">

      <header className="baloz-transactions-header">

        <Link
          to="/dashboard"
          className="baloz-transactions-brand"
        >
          <span className="baloz-transactions-brand-mark">
            B
          </span>

          <span>
            Baloz
          </span>
        </Link>


        <Link
          to="/dashboard"
          className="baloz-transactions-back"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>

      </header>


      <main className="baloz-transactions-content">

        <div className="baloz-transactions-intro">

          <div>

            <span className="baloz-transactions-overline">
              ACCOUNT ACTIVITY
            </span>

            <h1>
              Transactions
            </h1>

            <p>
              Review your deposits,
              withdrawals, investments,
              and other wallet activity.
            </p>

          </div>


          <button
            type="button"
            className="baloz-transactions-refresh"
            onClick={() =>
              fetchTransactions(true)
            }
            disabled={
              loading || refreshing
            }
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "baloz-transactions-refreshing"
                  : ""
              }
            />

            Refresh
          </button>

        </div>


        <section className="baloz-transactions-toolbar">

          <div className="baloz-transactions-filters">

            <button
              type="button"
              className={
                filter === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </button>

            <button
              type="button"
              className={
                filter === "deposit"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("deposit")
              }
            >
              Deposits
            </button>

            <button
              type="button"
              className={
                filter === "withdrawal"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("withdrawal")
              }
            >
              Withdrawals
            </button>

            <button
              type="button"
              className={
                filter === "investment"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter("investment")
              }
            >
              Investments
            </button>

          </div>


          <div className="baloz-transactions-search">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </section>


        {error && (
          <div
            className="baloz-transactions-error"
            role="alert"
          >
            {error}
          </div>
        )}


        <section className="baloz-transactions-list">

          <div className="baloz-transactions-list-header">

            <span>
              Transaction
            </span>

            <span>
              Amount
            </span>

            <span>
              Status
            </span>

            <span>
              Date
            </span>

          </div>


          {loading ? (
            <div className="baloz-transactions-state">

              <RefreshCw
                size={22}
                className="baloz-transactions-spinner"
              />

              <p>
                Loading transactions...
              </p>

            </div>
          ) : filteredTransactions.length ===
            0 ? (
            <div className="baloz-transactions-state">

              <CircleDollarSign
                size={30}
              />

              <strong>
                No transactions found
              </strong>

              <p>
                Your transaction activity
                will appear here.
              </p>

            </div>
          ) : (
            filteredTransactions.map(
              (transaction) => (
                <Link
                  key={
                    transaction.id ||
                    transaction.reference
                  }
                  to={`/transactions/${transaction.reference}`}
                  className="baloz-transaction-row"
                >

                  <div className="baloz-transaction-main">

                    <div
                      className={`baloz-transaction-icon ${transaction.direction || ""}`}
                    >
                      {getTransactionIcon(
                        transaction.transaction_type
                      )}
                    </div>


                    <div>

                      <strong>
                        {getTransactionLabel(
                          transaction.transaction_type
                        )}
                      </strong>

                      <span>
                        {transaction.reference}
                      </span>

                    </div>

                  </div>


                  <strong
                    className={`baloz-transaction-amount ${transaction.direction || ""}`}
                  >
                    {formatAmount(
                      transaction.amount,
                      transaction.direction
                    )}
                  </strong>


                  <span
                    className={`baloz-transaction-status ${transaction.status || ""}`}
                  >
                    {getStatusLabel(
                      transaction.status
                    )}
                  </span>


                  <div className="baloz-transaction-date">

                    <span>
                      {formatDate(
                        transaction.created_at
                      )}
                    </span>

                    <ChevronRight
                      size={16}
                    />

                  </div>

                </Link>
              )
            )
          )}

        </section>


        <footer className="baloz-transactions-footer">

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