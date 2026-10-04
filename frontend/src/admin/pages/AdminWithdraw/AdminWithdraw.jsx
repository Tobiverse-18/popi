import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Copy,
  Search,
  X,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../../api/api";

import "./AdminWithdraw.css";


const formatAmount = (amount) => {
  return `$${Number(amount || 0).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};


const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
};


const truncateAddress = (address) => {
  if (!address) {
    return "—";
  }

  if (address.length <= 24) {
    return address;
  }

  return `${address.slice(0, 12)}...${address.slice(-10)}`;
};


const getStatusClass = (status) => {
  switch (status) {
    case "success":
      return "admin-withdraw-status-success";

    case "processing":
      return "admin-withdraw-status-processing";

    case "pending":
      return "admin-withdraw-status-pending";

    case "failed":
      return "admin-withdraw-status-failed";

    case "cancelled":
      return "admin-withdraw-status-cancelled";

    default:
      return "";
  }
};


const getStatusLabel = (status) => {
  switch (status) {
    case "success":
      return "Successful";

    case "processing":
      return "Processing";

    case "pending":
      return "Pending";

    case "failed":
      return "Failed";

    case "cancelled":
      return "Cancelled";

    default:
      return status || "Unknown";
  }
};


export default function AdminWithdraw() {
  const [withdrawals, setWithdrawals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState(null);

  const [copied, setCopied] = useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionError, setActionError] =
    useState("");

  const [adminNote, setAdminNote] =
    useState("");


  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await api.get(
        "/admin-dashboard/withdrawals/",
        {
          params,
        }
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setWithdrawals(data);
      } else if (Array.isArray(data?.results)) {
        setWithdrawals(data.results);
      } else {
        setWithdrawals([]);
      }
    } catch (err) {
      console.error(
        "Failed to load admin withdrawals:",
        err
      );

      setError(
        "Unable to load withdrawals."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter]);


  const handleSearchSubmit = (event) => {
    event.preventDefault();

    fetchWithdrawals();
  };


  const handleCopy = async (value) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch (err) {
      console.error(
        "Failed to copy:",
        err
      );
    }
  };


  const openWithdrawal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setActionError("");
    setAdminNote("");
    setCopied(false);
  };


  const closeWithdrawal = () => {
    if (actionLoading) {
      return;
    }

    setSelectedWithdrawal(null);
    setActionError("");
    setAdminNote("");
    setCopied(false);
  };


  const handleWithdrawalAction = async (
    action
  ) => {
    if (!selectedWithdrawal) {
      return;
    }

    if (
      selectedWithdrawal.status !==
      "pending"
    ) {
      return;
    }

    const actionLabel =
      action === "approve"
        ? "approve"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} this withdrawal?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      const endpoint =
        action === "approve"
          ? `/admin-dashboard/withdrawals/${selectedWithdrawal.id}/approve/`
          : `/admin-dashboard/withdrawals/${selectedWithdrawal.id}/reject/`;

      await api.post(
        endpoint,
        {
          admin_note: adminNote.trim(),
        }
      );

      setSelectedWithdrawal(null);
      setAdminNote("");
      setActionError("");

      await fetchWithdrawals();
    } catch (err) {
      console.error(
        `Failed to ${action} withdrawal:`,
        err
      );

      setActionError(
        err.response?.data?.detail ||
          `Unable to ${action} withdrawal.`
      );
    } finally {
      setActionLoading(false);
    }
  };


  const stats = useMemo(() => {
    const total = withdrawals.length;

    const processing = withdrawals.filter(
      (item) =>
        item.status === "processing"
    ).length;

    const successful = withdrawals.filter(
      (item) =>
        item.status === "success"
    ).length;

    const failed = withdrawals.filter(
      (item) =>
        item.status === "failed"
    ).length;

    const pending = withdrawals.filter(
      (item) =>
        item.status === "pending"
    ).length;

    const totalAmount = withdrawals.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

    return {
      total,
      processing,
      successful,
      failed,
      pending,
      totalAmount,
    };
  }, [withdrawals]);


  return (
    <div className="admin-withdraw-page">

      <div className="admin-withdraw-heading">

        <div>
          <span className="admin-withdraw-overline">
            OPERATIONS
          </span>

          <h1>
            Withdrawals
          </h1>

          <p>
            Monitor customer withdrawals and
            review pending requests.
          </p>
        </div>

      </div>


      {/* STATS */}

      <div className="admin-withdraw-stats">

        <div className="admin-withdraw-stat">

          <div className="admin-withdraw-stat-icon">
            <ArrowDownLeft size={17} />
          </div>

          <div>
            <span>
              Total withdrawals
            </span>

            <strong>
              {stats.total}
            </strong>
          </div>

        </div>


        <div className="admin-withdraw-stat">

          <div className="admin-withdraw-stat-icon">
            <Clock3 size={17} />
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {stats.pending}
            </strong>
          </div>

        </div>


        <div className="admin-withdraw-stat">

          <div className="admin-withdraw-stat-icon">
            <CheckCircle2 size={17} />
          </div>

          <div>
            <span>
              Successful
            </span>

            <strong>
              {stats.successful}
            </strong>
          </div>

        </div>


        <div className="admin-withdraw-stat">

          <div className="admin-withdraw-stat-icon">
            <ArrowUpRight size={17} />
          </div>

          <div>
            <span>
              Total value
            </span>

            <strong>
              {formatAmount(
                stats.totalAmount
              )}
            </strong>
          </div>

        </div>

      </div>


      {/* CONTROLS */}

      <div className="admin-withdraw-controls">

        <form
          onSubmit={handleSearchSubmit}
          className="admin-withdraw-search"
        >

          <Search size={17} />

          <input
            type="text"
            placeholder="Search reference, user or wallet..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");

                setTimeout(
                  fetchWithdrawals,
                  0
                );
              }}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}

        </form>


        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="admin-withdraw-status-filter"
        >

          <option value="all">
            All statuses
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="processing">
            Processing
          </option>

          <option value="success">
            Successful
          </option>

          <option value="failed">
            Failed
          </option>

          <option value="cancelled">
            Cancelled
          </option>

        </select>

      </div>


      {/* ERROR */}

      {error && (
        <div className="admin-withdraw-error">
          {error}
        </div>
      )}


      {/* TABLE */}

      <section className="admin-withdraw-table-section">

        <div className="admin-withdraw-table-header">

          <div>
            <span>
              WITHDRAWAL ACTIVITY
            </span>

            <strong>
              {withdrawals.length} records
            </strong>
          </div>

        </div>


        {loading ? (
          <div className="admin-withdraw-loading">
            <span className="admin-withdraw-spinner" />
            Loading withdrawals...
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="admin-withdraw-empty">

            <div className="admin-withdraw-empty-icon">
              <ArrowDownLeft size={21} />
            </div>

            <strong>
              No withdrawals found
            </strong>

            <p>
              Withdrawals matching your current
              filters will appear here.
            </p>

          </div>
        ) : (
          <div className="admin-withdraw-table-wrap">

            <table className="admin-withdraw-table">

              <thead>
                <tr>

                  <th>
                    Withdrawal
                  </th>

                  <th>
                    User
                  </th>

                  <th>
                    Destination
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                </tr>
              </thead>

              <tbody>

                {withdrawals.map(
                  (withdrawal) => (
                    <tr
                      key={withdrawal.id}
                      onClick={() =>
                        openWithdrawal(
                          withdrawal
                        )
                      }
                    >

                      <td>
                        <div className="admin-withdraw-reference">

                          <span className="admin-withdraw-reference-icon">
                            <ArrowDownLeft
                              size={14}
                            />
                          </span>

                          <div>
                            <strong>
                              {withdrawal.reference}
                            </strong>

                            <span>
                              Crypto withdrawal
                            </span>
                          </div>

                        </div>
                      </td>


                      <td>
                        <div className="admin-withdraw-user">

                          <strong>
                            {withdrawal.username ||
                              "User"}
                          </strong>

                          <span>
                            {withdrawal.user_email ||
                              "—"}
                          </span>

                        </div>
                      </td>


                      <td>
                        <span className="admin-withdraw-destination">
                          {truncateAddress(
                            withdrawal.destination
                          )}
                        </span>
                      </td>


                      <td>
                        <strong className="admin-withdraw-amount">
                          {formatAmount(
                            withdrawal.amount
                          )}
                        </strong>
                      </td>


                      <td>
                        <span
                          className={`admin-withdraw-status ${getStatusClass(
                            withdrawal.status
                          )}`}
                        >

                          {withdrawal.status ===
                            "success" && (
                            <CheckCircle2
                              size={13}
                            />
                          )}

                          {(withdrawal.status ===
                            "processing" ||
                            withdrawal.status ===
                              "pending") && (
                            <Clock3
                              size={13}
                            />
                          )}

                          {(withdrawal.status ===
                            "failed" ||
                            withdrawal.status ===
                              "cancelled") && (
                            <XCircle
                              size={13}
                            />
                          )}

                          {getStatusLabel(
                            withdrawal.status
                          )}

                        </span>
                      </td>


                      <td>
                        <span className="admin-withdraw-date">
                          {formatDate(
                            withdrawal.created_at
                          )}
                        </span>
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>


      {/* DETAIL MODAL */}

      {selectedWithdrawal && (
        <div
          className="admin-withdraw-overlay"
          onClick={closeWithdrawal}
        >

          <div
            className="admin-withdraw-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-withdraw-modal-header">

              <div>
                <span>
                  WITHDRAWAL DETAILS
                </span>

                <h2>
                  {selectedWithdrawal.reference}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeWithdrawal}
                className="admin-withdraw-close"
                disabled={actionLoading}
              >
                <X size={18} />
              </button>

            </div>


            <div className="admin-withdraw-modal-status">

              <span
                className={`admin-withdraw-status ${getStatusClass(
                  selectedWithdrawal.status
                )}`}
              >
                {getStatusLabel(
                  selectedWithdrawal.status
                )}
              </span>

              <strong>
                {formatAmount(
                  selectedWithdrawal.amount
                )}
              </strong>

            </div>


            <div className="admin-withdraw-detail-grid">

              <div>
                <span>
                  User
                </span>

                <strong>
                  {selectedWithdrawal.username ||
                    "—"}
                </strong>

                <small>
                  {selectedWithdrawal.user_email ||
                    "—"}
                </small>
              </div>


              <div>
                <span>
                  Currency
                </span>

                <strong>
                  {selectedWithdrawal.currency ||
                    "USD"}
                </strong>
              </div>


              <div className="admin-withdraw-detail-full">

                <span>
                  Destination wallet
                </span>

                <div className="admin-withdraw-address">

                  <code>
                    {selectedWithdrawal.destination ||
                      "—"}
                  </code>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        selectedWithdrawal.destination
                      )
                    }
                    title="Copy wallet address"
                  >
                    {copied ? (
                      <CheckCircle2
                        size={16}
                      />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>

                </div>

              </div>


              <div>
                <span>
                  Transaction type
                </span>

                <strong>
                  Withdrawal
                </strong>
              </div>


              <div>
                <span>
                  Direction
                </span>

                <strong>
                  {selectedWithdrawal.direction ||
                    "debit"}
                </strong>
              </div>


              <div>
                <span>
                  Created
                </span>

                <strong>
                  {formatDate(
                    selectedWithdrawal.created_at
                  )}
                </strong>
              </div>


              <div>
                <span>
                  Last updated
                </span>

                <strong>
                  {formatDate(
                    selectedWithdrawal.updated_at
                  )}
                </strong>
              </div>


              {selectedWithdrawal.reviewed_at && (
                <div>
                  <span>
                    Reviewed
                  </span>

                  <strong>
                    {formatDate(
                      selectedWithdrawal.reviewed_at
                    )}
                  </strong>
                </div>
              )}


              {selectedWithdrawal.approved_amount && (
                <div>
                  <span>
                    Approved amount
                  </span>

                  <strong>
                    {formatAmount(
                      selectedWithdrawal.approved_amount
                    )}
                  </strong>
                </div>
              )}

            </div>


            {selectedWithdrawal.status ===
              "pending" && (
              <div className="admin-withdraw-review">

                <div className="admin-withdraw-review-heading">
                  <span>
                    ADMIN REVIEW
                  </span>

                  <p>
                    The customer's wallet will only
                    be debited if you approve this
                    withdrawal.
                  </p>
                </div>


                <label>
                  Admin note
                  <textarea
                    value={adminNote}
                    onChange={(event) =>
                      setAdminNote(
                        event.target.value
                      )
                    }
                    placeholder="Optional note about this withdrawal..."
                    maxLength={1000}
                    disabled={actionLoading}
                  />
                </label>


                {actionError && (
                  <div className="admin-withdraw-action-error">
                    {actionError}
                  </div>
                )}


                <div className="admin-withdraw-actions">

                  <button
                    type="button"
                    className="admin-withdraw-reject"
                    onClick={() =>
                      handleWithdrawalAction(
                        "reject"
                      )
                    }
                    disabled={actionLoading}
                  >
                    <XCircle size={15} />

                    {actionLoading
                      ? "Processing..."
                      : "Reject withdrawal"}
                  </button>


                  <button
                    type="button"
                    className="admin-withdraw-approve"
                    onClick={() =>
                      handleWithdrawalAction(
                        "approve"
                      )
                    }
                    disabled={actionLoading}
                  >
                    <CheckCircle2 size={15} />

                    {actionLoading
                      ? "Processing..."
                      : "Approve withdrawal"}
                  </button>

                </div>

              </div>
            )}


            {selectedWithdrawal.status !==
              "pending" && (
              <div className="admin-withdraw-modal-note">

                <span>
                  OPERATIONS NOTE
                </span>

                <p>
                  {selectedWithdrawal.status ===
                  "success"
                    ? "This withdrawal was approved and the customer's wallet was debited."
                    : selectedWithdrawal.status ===
                      "failed"
                    ? "This withdrawal was rejected and the customer's wallet was not debited."
                    : "This withdrawal is no longer awaiting administrative approval."}
                </p>

                {selectedWithdrawal.admin_note && (
                  <p className="admin-withdraw-existing-note">
                    <strong>
                      Admin note:
                    </strong>{" "}
                    {selectedWithdrawal.admin_note}
                  </p>
                )}

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}