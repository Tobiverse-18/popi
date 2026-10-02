import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import api from "../../../api/api";

import "./AdminDeposits.css";

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedDeposit, setSelectedDeposit] =
    useState(null);

  const [action, setAction] = useState(null);
  const [approvedAmount, setApprovedAmount] =
    useState("");
  const [adminNote, setAdminNote] = useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionError, setActionError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [copied, setCopied] = useState(false);

  const fetchDeposits = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = new URLSearchParams();

        params.set("page", page);

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (statusFilter) {
          params.set("status", statusFilter);
        }

        const response = await api.get(
          `/payments/admin/funding/?${params.toString()}`
        );

        setDeposits(response.data.results || []);

        const count = response.data.count || 0;

        const pageSize = 20;

        setTotalPages(
          Math.max(
            1,
            Math.ceil(count / pageSize)
          )
        );
      } catch (error) {
        console.error(
          "Failed to fetch deposits:",
          error
        );

        setDeposits([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, statusFilter]
  );

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const formatAmount = (amount) => {
    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return amount || "0.00";
    }

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusIcon = (status) => {
    if (status === "approved") {
      return (
        <CheckCircle2
          size={14}
          strokeWidth={1.8}
        />
      );
    }

    if (status === "rejected") {
      return (
        <XCircle
          size={14}
          strokeWidth={1.8}
        />
      );
    }

    return (
      <Clock3
        size={14}
        strokeWidth={1.8}
      />
    );
  };

  const getStatusLabel = (status) => {
    if (status === "approved") {
      return "Approved";
    }

    if (status === "rejected") {
      return "Rejected";
    }

    return "Pending";
  };

  const openDeposit = (deposit) => {
    setSelectedDeposit(deposit);
    setAction(null);
    setActionError("");
    setCopied(false);
    setApprovedAmount(
      deposit.amount
        ? String(deposit.amount)
        : ""
    );
    setAdminNote("");
  };

  const closeDeposit = () => {
    if (actionLoading) {
      return;
    }

    setSelectedDeposit(null);
    setAction(null);
    setActionError("");
    setApprovedAmount("");
    setAdminNote("");
    setCopied(false);
  };

  const openApprove = () => {
    if (!selectedDeposit) {
      return;
    }

    setAction("approve");
    setActionError("");
    setApprovedAmount(
      selectedDeposit.amount
        ? String(selectedDeposit.amount)
        : ""
    );
  };

  const openReject = () => {
    setAction("reject");
    setActionError("");
    setAdminNote("");
  };

  const handleApprove = async () => {
    if (!selectedDeposit) {
      return;
    }

    const amount = Number(approvedAmount);

    if (
      !approvedAmount ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      setActionError(
        "Enter a valid approved amount greater than zero."
      );
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      await api.post(
        `/payments/funding/${selectedDeposit.id}/approve/`,
        {
          approved_amount: approvedAmount,
        }
      );

      setSuccessMessage(
        `${selectedDeposit.reference} was approved successfully.`
      );

      closeDeposit();

      await fetchDeposits(true);
    } catch (error) {
      console.error(
        "Failed to approve deposit:",
        error
      );

      const data = error.response?.data;

      if (data?.approved_amount) {
        setActionError(
          Array.isArray(data.approved_amount)
            ? data.approved_amount[0]
            : data.approved_amount
        );
      } else if (data?.detail) {
        setActionError(data.detail);
      } else {
        setActionError(
          "Unable to approve this deposit. Please try again."
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDeposit) {
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      await api.post(
        `/payments/funding/${selectedDeposit.id}/reject/`,
        {
          admin_note: adminNote.trim(),
        }
      );

      setSuccessMessage(
        `${selectedDeposit.reference} was rejected.`
      );

      closeDeposit();

      await fetchDeposits(true);
    } catch (error) {
      console.error(
        "Failed to reject deposit:",
        error
      );

      const data = error.response?.data;

      if (data?.detail) {
        setActionError(data.detail);
      } else if (data?.admin_note) {
        setActionError(
          Array.isArray(data.admin_note)
            ? data.admin_note[0]
            : data.admin_note
        );
      } else {
        setActionError(
          "Unable to reject this deposit. Please try again."
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const copyWalletAddress = async () => {
    if (!selectedDeposit?.wallet_address) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        selectedDeposit.wallet_address
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy wallet address:",
        error
      );
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      setPage(1);
      fetchDeposits();
    }
  };

  const isPending =
    selectedDeposit?.status === "pending";

  return (
    <div className="admin-deposits">
      {successMessage && (
        <div className="admin-deposits-toast admin-deposits-toast-success">
          <CheckCircle2 size={17} />

          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="admin-deposits-header">
        <div>
          <span className="admin-deposits-eyebrow">
            Funding
          </span>

          <h1>Deposits</h1>

          <p>
            Review and manage customer funding
            requests.
          </p>
        </div>

        <button
          type="button"
          className="admin-deposits-refresh"
          onClick={() => fetchDeposits(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "admin-deposits-spin"
                : ""
            }
          />

          <span>Refresh</span>
        </button>
      </div>

      <div className="admin-deposits-toolbar">
        <div className="admin-deposits-search">
          <Search
            size={16}
            strokeWidth={1.7}
          />

          <input
            type="text"
            placeholder="Search reference, username or email..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        <div className="admin-deposits-filters">
          <button
            type="button"
            className={
              !statusFilter
                ? "admin-deposit-filter-active"
                : ""
            }
            onClick={() => {
              setStatusFilter("");
              setPage(1);
            }}
          >
            All
          </button>

          <button
            type="button"
            className={
              statusFilter === "pending"
                ? "admin-deposit-filter-active"
                : ""
            }
            onClick={() => {
              setStatusFilter("pending");
              setPage(1);
            }}
          >
            Pending
          </button>

          <button
            type="button"
            className={
              statusFilter === "approved"
                ? "admin-deposit-filter-active"
                : ""
            }
            onClick={() => {
              setStatusFilter("approved");
              setPage(1);
            }}
          >
            Approved
          </button>

          <button
            type="button"
            className={
              statusFilter === "rejected"
                ? "admin-deposit-filter-active"
                : ""
            }
            onClick={() => {
              setStatusFilter("rejected");
              setPage(1);
            }}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="admin-deposits-table-wrap">
        {loading ? (
          <div className="admin-deposits-state">
            <div className="admin-deposits-loader" />

            <span>
              Loading deposits...
            </span>
          </div>
        ) : deposits.length === 0 ? (
          <div className="admin-deposits-state">
            <div className="admin-deposits-empty-icon">
              <Clock3 size={20} />
            </div>

            <strong>No deposits found</strong>

            <span>
              There are no funding requests matching
              your current filters.
            </span>
          </div>
        ) : (
          <table className="admin-deposits-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>User</th>
                <th>Amount</th>
                <th>Crypto</th>
                <th>Status</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {deposits.map((deposit) => (
                <tr key={deposit.id}>
                  <td>
                    <div className="admin-deposit-reference">
                      <strong>
                        {deposit.reference}
                      </strong>

                      <span>
                        {deposit.currency}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="admin-deposit-user">
                      <strong>
                        {deposit.username ||
                          "Unknown user"}
                      </strong>

                      <span>
                        {deposit.user_email ||
                          "—"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <strong className="admin-deposit-amount">
                      {deposit.currency}{" "}
                      {formatAmount(
                        deposit.amount
                      )}
                    </strong>

                    {deposit.approved_amount && (
                      <span className="admin-deposit-approved">
                        Approved:{" "}
                        {deposit.currency}{" "}
                        {formatAmount(
                          deposit.approved_amount
                        )}
                      </span>
                    )}
                  </td>

                  <td>
                    <span className="admin-deposit-crypto">
                      {deposit.crypto_currency}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`admin-deposit-status admin-deposit-status-${deposit.status}`}
                    >
                      {getStatusIcon(
                        deposit.status
                      )}

                      {getStatusLabel(
                        deposit.status
                      )}
                    </span>
                  </td>

                  <td>
                    <div className="admin-deposit-date">
                      <span>
                        {formatDate(
                          deposit.created_at
                        )}
                      </span>

                      <small>
                        {formatTime(
                          deposit.created_at
                        )}
                      </small>
                    </div>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="admin-deposit-view"
                      onClick={() =>
                        openDeposit(deposit)
                      }
                      aria-label={`View ${deposit.reference}`}
                    >
                      <Eye
                        size={16}
                        strokeWidth={1.7}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && deposits.length > 0 && (
        <div className="admin-deposits-pagination">
          <span>
            Page {page} of {totalPages}
          </span>

          <div>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    totalPages,
                    current + 1
                  )
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedDeposit && (
        <div
          className="admin-deposit-modal-backdrop"
          onClick={closeDeposit}
        >
          <div
            className="admin-deposit-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-deposit-modal-header">
              <div>
                <span>
                  Deposit request
                </span>

                <h2>
                  {selectedDeposit.reference}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDeposit}
                disabled={actionLoading}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {!action && (
              <>
                <div className="admin-deposit-modal-content">
                  <div className="admin-deposit-detail">
                    <span>User</span>

                    <strong>
                      {selectedDeposit.username ||
                        "Unknown user"}
                    </strong>

                    <small>
                      {selectedDeposit.user_email ||
                        "—"}
                    </small>
                  </div>

                  <div className="admin-deposit-detail">
                    <span>
                      Requested amount
                    </span>

                    <strong>
                      {selectedDeposit.currency}{" "}
                      {formatAmount(
                        selectedDeposit.amount
                      )}
                    </strong>
                  </div>

                  <div className="admin-deposit-detail">
                    <span>
                      Cryptocurrency
                    </span>

                    <strong>
                      {selectedDeposit.crypto_currency}
                    </strong>
                  </div>

                  <div className="admin-deposit-detail">
                    <span>
                      Wallet address
                    </span>

                    <div className="admin-deposit-wallet-row">
                      <strong className="admin-deposit-wallet">
                        {
                          selectedDeposit.wallet_address
                        }
                      </strong>

                      <button
                        type="button"
                        onClick={
                          copyWalletAddress
                        }
                        aria-label="Copy wallet address"
                      >
                        {copied ? (
                          <Check size={15} />
                        ) : (
                          <Copy size={15} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="admin-deposit-detail">
                    <span>Status</span>

                    <strong>
                      <span
                        className={`admin-deposit-status admin-deposit-status-${selectedDeposit.status}`}
                      >
                        {getStatusIcon(
                          selectedDeposit.status
                        )}

                        {getStatusLabel(
                          selectedDeposit.status
                        )}
                      </span>
                    </strong>
                  </div>

                  {selectedDeposit.admin_note && (
                    <div className="admin-deposit-detail">
                      <span>
                        Admin note
                      </span>

                      <strong>
                        {
                          selectedDeposit.admin_note
                        }
                      </strong>
                    </div>
                  )}

                  {selectedDeposit.screenshot && (
                    <div className="admin-deposit-screenshot">
                      <span>
                        Payment screenshot
                      </span>

                      <a
                        href={
                          selectedDeposit.screenshot
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={
                            selectedDeposit.screenshot
                          }
                          alt="Payment screenshot"
                        />
                      </a>
                    </div>
                  )}
                </div>

                {isPending && (
                  <div className="admin-deposit-actions">
                    <button
                      type="button"
                      className="admin-deposit-reject-button"
                      onClick={openReject}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>

                    <button
                      type="button"
                      className="admin-deposit-approve-button"
                      onClick={openApprove}
                    >
                      <CheckCircle2 size={16} />
                      Approve
                    </button>
                  </div>
                )}
              </>
            )}

            {action === "approve" && (
              <div className="admin-deposit-action-panel">
                <div className="admin-deposit-action-icon admin-deposit-action-icon-approve">
                  <CheckCircle2 size={22} />
                </div>

                <h3>
                  Approve deposit
                </h3>

                <p>
                  Confirm the verified amount that
                  should be credited to the
                  customer's USD wallet.
                </p>

                <label>
                  Verified amount
                </label>

                <div className="admin-deposit-amount-input">
                  <span>
                    {selectedDeposit.currency}
                  </span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={approvedAmount}
                    onChange={(event) =>
                      setApprovedAmount(
                        event.target.value
                      )
                    }
                    disabled={actionLoading}
                    autoFocus
                  />
                </div>

                {actionError && (
                  <div className="admin-deposit-action-error">
                    <AlertCircle size={16} />

                    <span>
                      {actionError}
                    </span>
                  </div>
                )}

                <div className="admin-deposit-action-buttons">
                  <button
                    type="button"
                    className="admin-deposit-cancel-button"
                    onClick={() =>
                      setAction(null)
                    }
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="admin-deposit-confirm-approve"
                    onClick={handleApprove}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span className="admin-deposit-button-loader" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Confirm approval
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {action === "reject" && (
              <div className="admin-deposit-action-panel">
                <div className="admin-deposit-action-icon admin-deposit-action-icon-reject">
                  <XCircle size={22} />
                </div>

                <h3>
                  Reject deposit
                </h3>

                <p>
                  Reject this funding request. You
                  can provide a reason for the
                  customer record.
                </p>

                <label>
                  Reason
                  <span>Optional</span>
                </label>

                <textarea
                  value={adminNote}
                  onChange={(event) =>
                    setAdminNote(
                      event.target.value
                    )
                  }
                  placeholder="Enter a reason for rejecting this deposit..."
                  rows={4}
                  disabled={actionLoading}
                  autoFocus
                />

                {actionError && (
                  <div className="admin-deposit-action-error">
                    <AlertCircle size={16} />

                    <span>
                      {actionError}
                    </span>
                  </div>
                )}

                <div className="admin-deposit-action-buttons">
                  <button
                    type="button"
                    className="admin-deposit-cancel-button"
                    onClick={() =>
                      setAction(null)
                    }
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="admin-deposit-confirm-reject"
                    onClick={handleReject}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span className="admin-deposit-button-loader" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <X size={16} />
                        Confirm rejection
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}