import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  User,
  X,
  XCircle,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../../../api/api";

import "./AdminLoans.css";


const STATUS_FILTERS = [
  {
    label: "All",
    value: "",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Approved",
    value: "approved",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
];


const formatMoney = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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


const formatDateTime = (value) => {
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


const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "admin-loan-status-approved";

    case "rejected":
      return "admin-loan-status-rejected";

    case "cancelled":
      return "admin-loan-status-cancelled";

    default:
      return "admin-loan-status-pending";
  }
};


const getInitials = (loan) => {
  const first = loan?.first_name?.charAt(0) || "";
  const last = loan?.last_name?.charAt(0) || "";

  const initials = `${first}${last}`.toUpperCase();

  if (initials) {
    return initials;
  }

  return loan?.user_email?.charAt(0)?.toUpperCase() || "U";
};


export default function AdminLoans() {
  const navigate = useNavigate();

  const [loans, setLoans] = useState([]);

  const [selectedLoan, setSelectedLoan] = useState(null);

  const [activeFilter, setActiveFilter] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [actionError, setActionError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [actionType, setActionType] = useState("");

  const [adminNote, setAdminNote] = useState("");

  const [approvedAmount, setApprovedAmount] = useState("");

  const [interestRate, setInterestRate] = useState("");

  const [repaymentPeriod, setRepaymentPeriod] =
    useState("");


  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const [settingsLoading, setSettingsLoading] =
    useState(false);

  const [settingsSaving, setSettingsSaving] =
    useState(false);

  const [settingsError, setSettingsError] =
    useState("");

  const [minimumWalletBalance, setMinimumWalletBalance] =
    useState("");

  const [loansEnabled, setLoansEnabled] =
    useState(true);


  const fetchLoans = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const params = {};

      if (activeFilter) {
        params.status = activeFilter;
      }

      const response = await api.get(
        "/loans/admin/",
        {
          params,
        }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setLoans(data);
    } catch (err) {
      console.error(
        "Failed to load admin loans:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load loan applications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const fetchLoanDetails = async (loanId) => {
    try {
      setActionError("");

      const response = await api.get(
        `/loans/admin/${loanId}/`
      );

      setSelectedLoan(response.data);

      setApprovedAmount(
        response.data?.requested_amount || ""
      );

      setInterestRate(
        response.data?.interest_rate || ""
      );

      setRepaymentPeriod(
        response.data?.repayment_period_days || ""
      );

      setAdminNote(
        response.data?.admin_note || ""
      );
    } catch (err) {
      console.error(
        "Failed to load loan details:",
        err
      );

      setActionError(
        err?.response?.data?.detail ||
          "Unable to load loan details."
      );
    }
  };


  useEffect(() => {
    fetchLoans();
  }, [activeFilter]);


  const filteredLoans = useMemo(() => {
    const query = searchTerm
      .trim()
      .toLowerCase();

    if (!query) {
      return loans;
    }

    return loans.filter((loan) => {
      const applicant = [
        loan.first_name,
        loan.last_name,
        loan.username,
        loan.user_email,
        loan.phone_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const type =
        loan.loan_type_display ||
        loan.loan_type ||
        "";

      const reference =
        loan.transaction?.reference || "";

      return (
        applicant.includes(query) ||
        type.toLowerCase().includes(query) ||
        String(loan.id).includes(query) ||
        reference.toLowerCase().includes(query)
      );
    });
  }, [loans, searchTerm]);


  const stats = useMemo(() => {
    const pending = loans.filter(
      (loan) => loan.status === "pending"
    ).length;

    const approved = loans.filter(
      (loan) => loan.status === "approved"
    ).length;

    const rejected = loans.filter(
      (loan) => loan.status === "rejected"
    ).length;

    const totalDisbursed = loans
      .filter(
        (loan) => loan.status === "approved"
      )
      .reduce(
        (total, loan) =>
          total + Number(loan.approved_amount || 0),
        0
      );

    return {
      total: loans.length,
      pending,
      approved,
      rejected,
      totalDisbursed,
    };
  }, [loans]);


  const handleSelectLoan = async (loan) => {
    setSelectedLoan(loan);

    setApprovedAmount(
      loan.requested_amount || ""
    );

    setInterestRate(
      loan.interest_rate || ""
    );

    setRepaymentPeriod(
      loan.repayment_period_days || ""
    );

    setAdminNote(
      loan.admin_note || ""
    );

    setActionError("");

    if (loan.id) {
      await fetchLoanDetails(loan.id);
    }
  };


  const closeLoanDetails = () => {
    if (actionLoading) {
      return;
    }

    setSelectedLoan(null);
    setActionError("");
    setActionType("");
    setAdminNote("");
  };


  const handleApprove = async () => {
    if (!selectedLoan) {
      return;
    }

    const amount = Number(approvedAmount);

    const rate = Number(interestRate);

    const period = Number(repaymentPeriod);

    if (!Number.isFinite(amount) || amount <= 0) {
      setActionError(
        "Enter a valid approved amount."
      );
      return;
    }

    if (
      amount >
      Number(selectedLoan.requested_amount || 0)
    ) {
      setActionError(
        "Approved amount cannot exceed the requested amount."
      );
      return;
    }

    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      setActionError(
        "Interest rate must be between 0% and 100%."
      );
      return;
    }

    if (!Number.isInteger(period) || period <= 0) {
      setActionError(
        "Enter a valid repayment period."
      );
      return;
    }

    try {
      setActionLoading(true);

      setActionType("approve");

      setActionError("");

      const response = await api.post(
        `/loans/admin/${selectedLoan.id}/approve/`,
        {
          approved_amount: amount.toFixed(2),
          interest_rate: rate.toFixed(4),
          repayment_period_days: period,
          admin_note: adminNote.trim(),
        }
      );

      setSelectedLoan(response.data);

      setApprovedAmount(
        response.data?.approved_amount || ""
      );

      setInterestRate(
        response.data?.interest_rate || ""
      );

      setRepaymentPeriod(
        response.data?.repayment_period_days || ""
      );

      setAdminNote(
        response.data?.admin_note || ""
      );

      await fetchLoans(false);
    } catch (err) {
      console.error(
        "Failed to approve loan:",
        err
      );

      setActionError(
        err?.response?.data?.detail ||
          "Unable to approve this loan."
      );
    } finally {
      setActionLoading(false);
      setActionType("");
    }
  };


  const handleReject = async () => {
    if (!selectedLoan) {
      return;
    }

    try {
      setActionLoading(true);

      setActionType("reject");

      setActionError("");

      const response = await api.post(
        `/loans/admin/${selectedLoan.id}/reject/`,
        {
          admin_note: adminNote.trim(),
        }
      );

      setSelectedLoan(response.data);

      setAdminNote(
        response.data?.admin_note || ""
      );

      await fetchLoans(false);
    } catch (err) {
      console.error(
        "Failed to reject loan:",
        err
      );

      setActionError(
        err?.response?.data?.detail ||
          "Unable to reject this loan."
      );
    } finally {
      setActionLoading(false);
      setActionType("");
    }
  };


  const openSettings = async () => {
    setSettingsOpen(true);

    setSettingsError("");

    try {
      setSettingsLoading(true);

      const response = await api.get(
        "/loans/admin/settings/"
      );

      setMinimumWalletBalance(
        response.data?.minimum_wallet_balance || ""
      );

      setLoansEnabled(
        Boolean(response.data?.is_enabled)
      );
    } catch (err) {
      console.error(
        "Failed to load loan settings:",
        err
      );

      setSettingsError(
        err?.response?.data?.detail ||
          "Unable to load loan settings."
      );
    } finally {
      setSettingsLoading(false);
    }
  };


  const closeSettings = () => {
    if (settingsSaving) {
      return;
    }

    setSettingsOpen(false);
    setSettingsError("");
  };


  const handleSaveSettings = async (event) => {
    event.preventDefault();

    const minimum = Number(
      minimumWalletBalance
    );

    if (
      !Number.isFinite(minimum) ||
      minimum < 0
    ) {
      setSettingsError(
        "Enter a valid minimum wallet balance."
      );
      return;
    }

    try {
      setSettingsSaving(true);

      setSettingsError("");

      const response = await api.patch(
        "/loans/admin/settings/",
        {
          minimum_wallet_balance:
            minimum.toFixed(2),
          is_enabled: loansEnabled,
        }
      );

      setMinimumWalletBalance(
        response.data?.minimum_wallet_balance || ""
      );

      setLoansEnabled(
        Boolean(response.data?.is_enabled)
      );

      setSettingsOpen(false);
    } catch (err) {
      console.error(
        "Failed to save loan settings:",
        err
      );

      setSettingsError(
        err?.response?.data?.detail ||
          "Unable to save loan settings."
      );
    } finally {
      setSettingsSaving(false);
    }
  };


  return (
    <div className="admin-loans-page">

      <header className="admin-loans-header">

        <div className="admin-loans-header-left">

          <button
            type="button"
            className="admin-loans-back"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <span className="admin-loans-eyebrow">
              ADMINISTRATION
            </span>

            <h1>
              Loan Management
            </h1>

            <p>
              Review applications, manage
              disbursements and control loan
              eligibility.
            </p>
          </div>

        </div>


        <div className="admin-loans-header-actions">

          <button
            type="button"
            className="admin-loans-secondary-button"
            onClick={openSettings}
          >
            <Settings2 size={17} />
            Loan settings
          </button>

          <button
            type="button"
            className="admin-loans-refresh-button"
            onClick={() => fetchLoans(false)}
            disabled={refreshing}
            aria-label="Refresh loans"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "admin-loans-spin"
                  : ""
              }
            />
          </button>

        </div>

      </header>


      <section className="admin-loans-stat-grid">

        <div className="admin-loans-stat">

          <div className="admin-loans-stat-icon">
            <FileText size={19} />
          </div>

          <div>
            <span>
              Total applications
            </span>

            <strong>
              {stats.total}
            </strong>
          </div>

        </div>


        <div className="admin-loans-stat">

          <div className="admin-loans-stat-icon admin-loans-stat-pending">
            <Clock3 size={19} />
          </div>

          <div>
            <span>
              Pending review
            </span>

            <strong>
              {stats.pending}
            </strong>
          </div>

        </div>


        <div className="admin-loans-stat">

          <div className="admin-loans-stat-icon admin-loans-stat-approved">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>
              Approved
            </span>

            <strong>
              {stats.approved}
            </strong>
          </div>

        </div>


        <div className="admin-loans-stat">

          <div className="admin-loans-stat-icon admin-loans-stat-money">
            <DollarSign size={19} />
          </div>

          <div>
            <span>
              Disbursed
            </span>

            <strong>
              {formatMoney(
                stats.totalDisbursed
              )}
            </strong>
          </div>

        </div>

      </section>


      <section className="admin-loans-toolbar">

        <div className="admin-loans-filters">

          {STATUS_FILTERS.map((filter) => (
            <button
              type="button"
              key={filter.value || "all"}
              className={
                activeFilter === filter.value
                  ? "admin-loans-filter active"
                  : "admin-loans-filter"
              }
              onClick={() =>
                setActiveFilter(
                  filter.value
                )
              }
            >
              {filter.label}

              {filter.value === "pending" &&
                stats.pending > 0 && (
                  <span>
                    {stats.pending}
                  </span>
                )}
            </button>
          ))}

        </div>


        <div className="admin-loans-search">

          <Search size={17} />

          <input
            type="search"
            placeholder="Search applicant or loan..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

        </div>

      </section>


      {error && (
        <div className="admin-loans-error-banner">

          <AlertCircle size={18} />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() => fetchLoans()}
          >
            Try again
          </button>

        </div>
      )}


      <section className="admin-loans-table-section">

        <div className="admin-loans-table-header">

          <div>
            <span className="admin-loans-section-label">
              LOAN APPLICATIONS
            </span>

            <h2>
              {activeFilter
                ? `${activeFilter
                    .charAt(0)
                    .toUpperCase()}${activeFilter.slice(1)}
                    } applications`
                : "All applications"}
            </h2>
          </div>

          <span className="admin-loans-count">
            {filteredLoans.length}{" "}
            {filteredLoans.length === 1
              ? "application"
              : "applications"}
          </span>

        </div>


        {loading ? (
          <div className="admin-loans-loading">

            <Loader2
              size={25}
              className="admin-loans-spin"
            />

            <span>
              Loading loan applications...
            </span>

          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="admin-loans-empty">

            <div className="admin-loans-empty-icon">
              <FileText size={24} />
            </div>

            <h3>
              No loan applications found
            </h3>

            <p>
              There are no applications matching
              your current filters.
            </p>

          </div>
        ) : (
          <div className="admin-loans-table-wrap">

            <table className="admin-loans-table">

              <thead>
                <tr>
                  <th>
                    Applicant
                  </th>

                  <th>
                    Requested
                  </th>

                  <th>
                    Loan type
                  </th>

                  <th>
                    Applied
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>


              <tbody>

                {filteredLoans.map((loan) => (
                  <tr
                    key={loan.id}
                    onClick={() =>
                      handleSelectLoan(loan)
                    }
                  >

                    <td>
                      <div className="admin-loan-applicant">

                        <div className="admin-loan-avatar">
                          {getInitials(loan)}
                        </div>

                        <div>
                          <strong>
                            {[
                              loan.first_name,
                              loan.last_name,
                            ]
                              .filter(Boolean)
                              .join(" ") ||
                              loan.username ||
                              "Unknown user"}
                          </strong>

                          <span>
                            {loan.user_email ||
                              "No email"}
                          </span>
                        </div>

                      </div>
                    </td>


                    <td>
                      <strong className="admin-loan-amount">
                        {formatMoney(
                          loan.requested_amount
                        )}
                      </strong>
                    </td>


                    <td>
                      <span className="admin-loan-type">
                        {loan.loan_type_display ||
                          loan.loan_type ||
                          "—"}
                      </span>
                    </td>


                    <td>
                      <span className="admin-loan-date">
                        {formatDate(
                          loan.application_date
                        )}
                      </span>
                    </td>


                    <td>
                      <span
                        className={`admin-loan-status ${getStatusClass(
                          loan.status
                        )}`}
                      >
                        <span />

                        {loan.status_display ||
                          loan.status ||
                          "Pending"}
                      </span>
                    </td>


                    <td>
                      <button
                        type="button"
                        className="admin-loan-view-button"
                        onClick={(event) => {
                          event.stopPropagation();

                          handleSelectLoan(
                            loan
                          );
                        }}
                      >
                        View
                        <ChevronRight size={15} />
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>


      {selectedLoan && (
        <div className="admin-loan-modal-backdrop">

          <div className="admin-loan-modal">

            <header className="admin-loan-modal-header">

              <div>

                <span className="admin-loans-eyebrow">
                  LOAN APPLICATION
                </span>

                <h2>
                  Loan #{selectedLoan.id}
                </h2>

              </div>

              <button
                type="button"
                className="admin-loan-modal-close"
                onClick={closeLoanDetails}
                disabled={actionLoading}
                aria-label="Close loan details"
              >
                <X size={19} />
              </button>

            </header>


            <div className="admin-loan-modal-body">

              {actionError && (
                <div className="admin-loan-action-error">

                  <AlertCircle size={17} />

                  <span>
                    {actionError}
                  </span>

                </div>
              )}


              <section className="admin-loan-detail-section">

                <div className="admin-loan-detail-heading">

                  <div className="admin-loan-detail-user">

                    <div className="admin-loan-large-avatar">
                      {getInitials(
                        selectedLoan
                      )}
                    </div>

                    <div>
                      <strong>
                        {[
                          selectedLoan.first_name,
                          selectedLoan.last_name,
                        ]
                          .filter(Boolean)
                          .join(" ") ||
                          selectedLoan.username ||
                          "Unknown user"}
                      </strong>

                      <span>
                        {selectedLoan.user_email ||
                          "No email"}
                      </span>
                    </div>

                  </div>


                  <span
                    className={`admin-loan-status ${getStatusClass(
                      selectedLoan.status
                    )}`}
                  >
                    <span />

                    {selectedLoan.status_display ||
                      selectedLoan.status}
                  </span>

                </div>


                <div className="admin-loan-user-meta">

                  <div>
                    <span>
                      Phone
                    </span>

                    <strong>
                      {selectedLoan.phone_number ||
                        "—"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Username
                    </span>

                    <strong>
                      {selectedLoan.username ||
                        "—"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Wallet balance
                    </span>

                    <strong>
                      {formatMoney(
                        selectedLoan.wallet_balance
                      )}
                    </strong>
                  </div>

                </div>

              </section>


              <section className="admin-loan-detail-section">

                <div className="admin-loan-section-title">

                  <FileText size={17} />

                  <h3>
                    Application
                  </h3>

                </div>


                <div className="admin-loan-detail-grid">

                  <div>
                    <span>
                      Requested amount
                    </span>

                    <strong>
                      {formatMoney(
                        selectedLoan.requested_amount
                      )}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Loan type
                    </span>

                    <strong>
                      {selectedLoan.loan_type_display ||
                        selectedLoan.loan_type ||
                        "—"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Application date
                    </span>

                    <strong>
                      {formatDateTime(
                        selectedLoan.application_date
                      )}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Decision date
                    </span>

                    <strong>
                      {formatDateTime(
                        selectedLoan.decision_date
                      )}
                    </strong>
                  </div>

                </div>


                <div className="admin-loan-reason">

                  <span>
                    Reason
                  </span>

                  <p>
                    {selectedLoan.reason ||
                      "No reason provided."}
                  </p>

                </div>

              </section>


              {selectedLoan.status === "pending" ? (
                <section className="admin-loan-review-section">

                  <div className="admin-loan-section-title">

                    <ShieldCheck size={17} />

                    <h3>
                      Review application
                    </h3>

                  </div>


                  <div className="admin-loan-form-grid">

                    <label>

                      <span>
                        Approved amount
                      </span>

                      <div className="admin-loan-input-wrap">
                        <span>
                          $
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
                        />
                      </div>

                    </label>


                    <label>

                      <span>
                        Interest rate
                      </span>

                      <div className="admin-loan-input-wrap">

                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={interestRate}
                          onChange={(event) =>
                            setInterestRate(
                              event.target.value
                            )
                          }
                        />

                        <span>
                          %
                        </span>

                      </div>

                    </label>


                    <label>

                      <span>
                        Repayment period
                      </span>

                      <div className="admin-loan-input-wrap">

                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={repaymentPeriod}
                          onChange={(event) =>
                            setRepaymentPeriod(
                              event.target.value
                            )
                          }
                        />

                        <span>
                          days
                        </span>

                      </div>

                    </label>

                  </div>


                  <label className="admin-loan-note-field">

                    <span>
                      Admin note
                    </span>

                    <textarea
                      rows="4"
                      placeholder="Add an internal review note..."
                      value={adminNote}
                      onChange={(event) =>
                        setAdminNote(
                          event.target.value
                        )
                      }
                    />

                  </label>


                  <div className="admin-loan-review-actions">

                    <button
                      type="button"
                      className="admin-loan-reject-button"
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      {actionLoading &&
                      actionType === "reject" ? (
                        <Loader2
                          size={17}
                          className="admin-loans-spin"
                        />
                      ) : (
                        <XCircle size={17} />
                      )}

                      Reject application
                    </button>


                    <button
                      type="button"
                      className="admin-loan-approve-button"
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      {actionLoading &&
                      actionType === "approve" ? (
                        <Loader2
                          size={17}
                          className="admin-loans-spin"
                        />
                      ) : (
                        <CheckCircle2 size={17} />
                      )}

                      Approve loan
                    </button>

                  </div>

                </section>
              ) : (
                <section className="admin-loan-detail-section">

                  <div className="admin-loan-section-title">

                    <ShieldCheck size={17} />

                    <h3>
                      Decision
                    </h3>

                  </div>


                  <div className="admin-loan-detail-grid">

                    <div>
                      <span>
                        Approved amount
                      </span>

                      <strong>
                        {formatMoney(
                          selectedLoan.approved_amount
                        )}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Interest rate
                      </span>

                      <strong>
                        {selectedLoan.interest_rate
                          ? `${selectedLoan.interest_rate}%`
                          : "—"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Repayment period
                      </span>

                      <strong>
                        {selectedLoan.repayment_period_days
                          ? `${selectedLoan.repayment_period_days} days`
                          : "—"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Due date
                      </span>

                      <strong>
                        {formatDateTime(
                          selectedLoan.due_date
                        )}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Outstanding balance
                      </span>

                      <strong>
                        {formatMoney(
                          selectedLoan.outstanding_balance
                        )}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Repayment status
                      </span>

                      <strong>
                        {selectedLoan.repayment_status_display ||
                          selectedLoan.repayment_status ||
                          "—"}
                      </strong>
                    </div>

                  </div>


                  <div className="admin-loan-review-record">

                    <div>
                      <span>
                        Reviewed by
                      </span>

                      <strong>
                        {selectedLoan.reviewer_name ||
                          "—"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Review date
                      </span>

                      <strong>
                        {formatDateTime(
                          selectedLoan.decision_date
                        )}
                      </strong>
                    </div>

                  </div>


                  <div className="admin-loan-reason">

                    <span>
                      Admin note
                    </span>

                    <p>
                      {selectedLoan.admin_note ||
                        "No admin note was added."}
                    </p>

                  </div>

                </section>
              )}


              {selectedLoan.transaction && (
                <section className="admin-loan-transaction">

                  <div className="admin-loan-section-title">

                    <DollarSign size={17} />

                    <h3>
                      Transaction
                    </h3>

                  </div>


                  <div>

                    <span>
                      Reference
                    </span>

                    <strong>
                      {selectedLoan.transaction.reference ||
                        "—"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Amount
                    </span>

                    <strong>
                      {formatMoney(
                        selectedLoan.transaction.amount
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Status
                    </span>

                    <strong>
                      {selectedLoan.transaction.status ||
                        "—"}
                    </strong>

                  </div>

                </section>
              )}

            </div>

          </div>

        </div>
      )}


      {settingsOpen && (
        <div className="admin-loan-modal-backdrop">

          <div className="admin-loan-settings-modal">

            <header className="admin-loan-modal-header">

              <div>

                <span className="admin-loans-eyebrow">
                  CONFIGURATION
                </span>

                <h2>
                  Loan settings
                </h2>

              </div>

              <button
                type="button"
                className="admin-loan-modal-close"
                onClick={closeSettings}
                disabled={settingsSaving}
                aria-label="Close loan settings"
              >
                <X size={19} />
              </button>

            </header>


            <form
              className="admin-loan-settings-body"
              onSubmit={handleSaveSettings}
            >

              {settingsError && (
                <div className="admin-loan-action-error">

                  <AlertCircle size={17} />

                  <span>
                    {settingsError}
                  </span>

                </div>
              )}


              {settingsLoading ? (
                <div className="admin-loans-loading">

                  <Loader2
                    size={23}
                    className="admin-loans-spin"
                  />

                  <span>
                    Loading settings...
                  </span>

                </div>
              ) : (
                <>
                  <div className="admin-loan-setting-description">

                    <div className="admin-loan-setting-icon">
                      <DollarSign size={19} />
                    </div>

                    <div>

                      <strong>
                        Minimum wallet balance
                      </strong>

                      <p>
                        Users must have at least this
                        amount in their USD wallet before
                        they can apply for a loan.
                      </p>

                    </div>

                  </div>


                  <label className="admin-loan-note-field">

                    <span>
                      Minimum balance
                    </span>

                    <div className="admin-loan-input-wrap">
                      <span>
                        $
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={minimumWalletBalance}
                        onChange={(event) =>
                          setMinimumWalletBalance(
                            event.target.value
                          )
                        }
                      />
                    </div>

                  </label>


                  <label className="admin-loan-settings-toggle">

                    <input
                      type="checkbox"
                      checked={loansEnabled}
                      onChange={(event) =>
                        setLoansEnabled(
                          event.target.checked
                        )
                      }
                    />

                    <span className="admin-loan-toggle-ui" />

                    <div>

                      <strong>
                        Accept loan applications
                      </strong>

                      <p>
                        Turn this off to temporarily
                        disable new loan applications.
                      </p>

                    </div>

                  </label>


                  <div className="admin-loan-settings-actions">

                    <button
                      type="button"
                      className="admin-loans-secondary-button"
                      onClick={closeSettings}
                      disabled={settingsSaving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="admin-loan-approve-button"
                      disabled={settingsSaving}
                    >
                      {settingsSaving ? (
                        <Loader2
                          size={17}
                          className="admin-loans-spin"
                        />
                      ) : (
                        <CheckCircle2 size={17} />
                      )}

                      Save settings
                    </button>

                  </div>
                </>
              )}

            </form>

          </div>

        </div>
      )}

    </div>
  );
}