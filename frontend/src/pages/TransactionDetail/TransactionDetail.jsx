import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../api/api";

import "./TransactionDetail.css";


export default function TransactionDetail() {
  const { reference } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/transactions/${reference}/`
        );

        setTransaction(response.data);
      } catch (err) {
        console.error(
          "Failed to load transaction:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load this transaction."
        );
      } finally {
        setLoading(false);
      }
    };

    if (reference) {
      fetchTransaction();
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

    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };


  const getTransactionLabel = () => {
    if (!transaction) {
      return "Transaction";
    }

    const labels = {
      deposit: "Deposit",
      withdrawal: "Withdrawal",
      investment: "Investment",
      maturity: "Investment Maturity",
      refund: "Refund",
      fee: "Fee",
    };

    return (
      labels[transaction.transaction_type] ||
      "Transaction"
    );
  };


  const getStatusLabel = () => {
    if (!transaction) {
      return "";
    }

    const labels = {
      pending: "Pending",
      processing: "Processing",
      success: "Successful",
      failed: "Failed",
      cancelled: "Cancelled",
    };

    return (
      labels[transaction.status] ||
      transaction.status
    );
  };


  const getStatusIcon = () => {
    if (!transaction) {
      return null;
    }

    if (transaction.status === "success") {
      return <CheckCircle2 size={20} />;
    }

    if (
      transaction.status === "failed" ||
      transaction.status === "cancelled"
    ) {
      return <XCircle size={20} />;
    }

    return <Clock3 size={20} />;
  };


  const handleCopy = async () => {
    if (!transaction?.reference) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        transaction.reference
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };


  if (loading) {
    return (
      <div className="transaction-page">
        <header className="transaction-header">
          <Link
            to="/dashboard"
            className="transaction-brand"
          >
            <span className="transaction-brand-mark">
              B
            </span>

            <span>Baloz</span>
          </Link>
        </header>

        <main className="transaction-container">
          <div className="transaction-loading">
            <Clock3 size={22} />
            <span>Loading transaction...</span>
          </div>
        </main>
      </div>
    );
  }


  if (error || !transaction) {
    return (
      <div className="transaction-page">
        <header className="transaction-header">
          <Link
            to="/dashboard"
            className="transaction-brand"
          >
            <span className="transaction-brand-mark">
              B
            </span>

            <span>Baloz</span>
          </Link>
        </header>

        <main className="transaction-container">
          <div className="transaction-error">
            <XCircle size={28} />

            <strong>
              {error || "Transaction not found."}
            </strong>

            <Link
              to="/transactions"
              className="transaction-error-link"
            >
              Back to transactions
            </Link>
          </div>
        </main>
      </div>
    );
  }


  return (
    <div className="transaction-page">

      {/* HEADER */}

      <header className="transaction-header">

        <Link
          to="/dashboard"
          className="transaction-brand"
        >
          <span className="transaction-brand-mark">
            B
          </span>

          <span>Baloz</span>
        </Link>


        <button
          type="button"
          className="transaction-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

      </header>


      <main className="transaction-container">

        {/* PAGE TITLE */}

        <section className="transaction-heading">

          <span className="transaction-eyebrow">
            TRANSACTION
          </span>

          <h1>
            {getTransactionLabel()}
          </h1>

          <p>
            Transaction details and status
          </p>

        </section>


        {/* STATUS */}

        <section
          className={`transaction-status transaction-status-${transaction.status}`}
        >
          <div className="transaction-status-icon">
            {getStatusIcon()}
          </div>

          <div className="transaction-status-content">
            <span>Status</span>

            <strong>
              {getStatusLabel()}
            </strong>
          </div>
        </section>


        {/* MAIN CARD */}

        <section className="transaction-card">

          {/* AMOUNT */}

          <div className="transaction-amount">

            <div className="transaction-amount-top">
              <span>Amount</span>

              <span
                className={`transaction-direction transaction-direction-${transaction.direction}`}
              >
                {transaction.direction === "credit"
                  ? "Credit"
                  : "Debit"}
              </span>
            </div>

            <strong>
              {transaction.currency}{" "}
              {formatMoney(transaction.amount)}
            </strong>

          </div>


          {/* DETAILS */}

          <div className="transaction-details">

            <div className="transaction-detail">
              <span>Transaction type</span>

              <strong>
                {getTransactionLabel()}
              </strong>
            </div>


            <div className="transaction-detail">
              <span>Date</span>

              <strong>
                {formatDate(
                  transaction.created_at
                )}
              </strong>
            </div>


            <div className="transaction-detail">
              <span>Approved amount</span>

              <strong>
                {transaction.approved_amount
                  ? `${transaction.currency} ${formatMoney(
                      transaction.approved_amount
                    )}`
                  : "—"}
              </strong>
            </div>


            <div className="transaction-detail">
              <span>Description</span>

              <strong>
                {transaction.description || "—"}
              </strong>
            </div>


            {transaction.destination && (
              <div className="transaction-detail">
                <span>Destination</span>

                <strong>
                  {transaction.destination}
                </strong>
              </div>
            )}

          </div>

        </section>


        {/* REFERENCE */}

        <section className="transaction-reference">

          <div className="transaction-reference-info">

            <span>REFERENCE</span>

            <strong>
              {transaction.reference}
            </strong>

          </div>


          <button
            type="button"
            className="transaction-copy"
            onClick={handleCopy}
          >
            <Copy size={15} />

            <span>
              {copied ? "Copied" : "Copy"}
            </span>
          </button>

        </section>


        {/* INFORMATION */}

        <section className="transaction-info">

          <div className="transaction-info-block">

            <div className="transaction-info-icon">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h3>
                Secure transaction
              </h3>

              <p>
                This transaction is linked to
                your Baloz account and can only
                be viewed by you.
              </p>
            </div>

          </div>


          {transaction.status === "success" && (
            <div className="transaction-info-block transaction-success">

              <div className="transaction-info-icon">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <h3>
                  Transaction completed
                </h3>

                <p>
                  This transaction has been
                  successfully recorded on your
                  Baloz account.
                </p>
              </div>

            </div>
          )}


          <Link
            to="/transactions"
            className="transaction-history"
          >
            <span>
              View transaction history
            </span>

            <ExternalLink size={15} />
          </Link>

        </section>


        {/* FOOTER */}

        <footer className="transaction-footer">

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