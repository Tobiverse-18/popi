import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Info,
  Loader2,
  LockKeyhole,
  Percent,
  ShieldCheck,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

import api from "../../api/api";

import { useNavigate } from "react-router-dom";

import "./Loans.css";

export default function Loans() {
  const navigate = useNavigate();

  const [eligibility, setEligibility] = useState(null);
  const [loans, setLoans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loansLoading, setLoansLoading] = useState(true);

  const [showApplication, setShowApplication] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const [applicationLoading, setApplicationLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    requested_amount: "",
    loan_type: "personal",
    reason: "",
  });

  const fetchEligibility = async () => {
    try {
      const response = await api.get("/loans/eligibility/");
      setEligibility(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your loan eligibility."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchLoans = async () => {
    try {
      const response = await api.get("/loans/");
      setLoans(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load your loan applications."
      );
    } finally {
      setLoansLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibility();
    fetchLoans();
  }, []);

  const activeLoan = useMemo(
    () =>
      loans.find(
        (loan) =>
          loan.status === "approved" &&
          ["active", "partially_paid", "overdue"].includes(
            loan.repayment_status
          )
      ),
    [loans]
  );

  const pendingLoan = useMemo(
    () => loans.find((loan) => loan.status === "pending"),
    [loans]
  );

  const formatMoney = (amount) => {
    const value = Number(amount || 0);

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "loan-status approved";

      case "rejected":
        return "loan-status rejected";

      case "pending":
        return "loan-status pending";

      case "cancelled":
        return "loan-status cancelled";

      default:
        return "loan-status";
    }
  };

  const getRepaymentClass = (status) => {
    switch (status) {
      case "active":
        return "loan-status active";

      case "partially_paid":
        return "loan-status partial";

      case "paid":
        return "loan-status paid";

      case "overdue":
        return "loan-status overdue";

      default:
        return "loan-status";
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openApplication = () => {
    setError("");
    setSuccess("");

    setForm({
      requested_amount: "",
      loan_type: "personal",
      reason: "",
    });

    setShowApplication(true);
  };

  const closeApplication = () => {
    if (applicationLoading) return;

    setShowApplication(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const amount = Number(form.requested_amount);

    if (!amount || amount <= 0) {
      setError("Enter a valid loan amount.");
      return;
    }

    if (!form.reason.trim()) {
      setError("Please provide a reason for the loan.");
      return;
    }

    try {
      setApplicationLoading(true);

      await api.post("/loans/apply/", {
        requested_amount: form.requested_amount,
        loan_type: form.loan_type,
        reason: form.reason.trim(),
      });

      setShowApplication(false);

      setSuccess(
        "Your loan application has been submitted and is awaiting review."
      );

      await Promise.all([
        fetchEligibility(),
        fetchLoans(),
      ]);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.requested_amount?.[0] ||
          "Unable to submit your loan application."
      );
    } finally {
      setApplicationLoading(false);
    }
  };

  const handleViewLoan = async (loan) => {
    setSelectedLoan(loan);

    try {
      const response = await api.get(`/loans/${loan.id}/`);
      setSelectedLoan(response.data);
    } catch {
      // Keep the list data if detail request fails.
    }
  };

  const closeLoanDetails = () => {
    setSelectedLoan(null);
  };

  if (loading) {
    return (
      <div className="loans-page">
        <div className="loans-loading">
          <Loader2 className="loans-spinner" size={22} />
          <span>Loading loan information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="loans-page">
      <div className="loans-container">

        <button
          type="button"
          className="loans-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={17} />
          <span>Back to Dashboard</span>
        </button>

        <section className="loans-header">
          <div>
            <span className="loans-eyebrow">
              HARVESTCOIN CREDIT
            </span>

            <h1>Loans</h1>

            <p>
              Access financing based on your HarvestCoin wallet
              eligibility.
            </p>
          </div>

          <div className="loans-security">
            <ShieldCheck size={17} />
            <span>Secure lending</span>
          </div>
        </section>

        {error && !showApplication && (
          <div className="loans-alert error">
            <XCircle size={18} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="loans-alert success">
            <CheckCircle2 size={18} />
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="loan-overview">
          <div className="loan-balance-card">
            <div className="loan-card-icon">
              <Wallet size={20} />
            </div>

            <div>
              <span className="loan-card-label">
                Current wallet balance
              </span>

              <strong>
                ${formatMoney(eligibility?.wallet_balance)}
              </strong>
            </div>
          </div>

          <div className="loan-balance-card">
            <div className="loan-card-icon">
              <LockKeyhole size={20} />
            </div>

            <div>
              <span className="loan-card-label">
                Minimum required
              </span>

              <strong>
                $
                {formatMoney(
                  eligibility?.minimum_wallet_balance
                )}
              </strong>
            </div>
          </div>

          <div className="loan-balance-card">
            <div className="loan-card-icon">
              <Banknote size={20} />
            </div>

            <div>
              <span className="loan-card-label">
                Available to apply
              </span>

              <strong>
                {eligibility?.is_eligible
                  ? "Eligible"
                  : "Not eligible"}
              </strong>
            </div>
          </div>
        </section>

        <section className="loan-eligibility">
          <div className="eligibility-content">
            <div
              className={`eligibility-icon ${
                eligibility?.is_eligible
                  ? "eligible"
                  : "not-eligible"
              }`}
            >
              {eligibility?.is_eligible ? (
                <CheckCircle2 size={22} />
              ) : (
                <Info size={22} />
              )}
            </div>

            <div>
              <h2>
                {eligibility?.is_eligible
                  ? "You are eligible for a loan"
                  : "Loan eligibility"}
              </h2>

              <p>{eligibility?.message}</p>

              {!eligibility?.is_eligible &&
                Number(eligibility?.amount_needed) > 0 && (
                  <span className="eligibility-needed">
                    You need $
                    {formatMoney(
                      eligibility.amount_needed
                    )}{" "}
                    more in your wallet to meet the minimum
                    requirement.
                  </span>
                )}
            </div>
          </div>

          <button
            type="button"
            className="loan-primary-button"
            disabled={
              !eligibility?.is_eligible ||
              Boolean(pendingLoan)
            }
            onClick={openApplication}
          >
            Apply for a loan
            <ArrowRight size={17} />
          </button>
        </section>

        {activeLoan && (
          <section className="active-loan-section">
            <div className="section-heading">
              <div>
                <span className="loans-eyebrow">
                  CURRENT LOAN
                </span>
                <h2>Active loan</h2>
              </div>

              <span
                className={getRepaymentClass(
                  activeLoan.repayment_status
                )}
              >
                {activeLoan.repayment_status_display}
              </span>
            </div>

            <div className="active-loan-grid">
              <div>
                <span>Outstanding balance</span>
                <strong>
                  $
                  {formatMoney(
                    activeLoan.outstanding_balance
                  )}
                </strong>
              </div>

              <div>
                <span>Approved amount</span>
                <strong>
                  $
                  {formatMoney(
                    activeLoan.approved_amount
                  )}
                </strong>
              </div>

              <div>
                <span>Interest</span>
                <strong>
                  {Number(activeLoan.interest_rate || 0)}%
                </strong>
              </div>

              <div>
                <span>Due date</span>
                <strong>
                  {formatDate(activeLoan.due_date)}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="loan-secondary-button"
              onClick={() => handleViewLoan(activeLoan)}
            >
              View loan details
              <ChevronRight size={17} />
            </button>
          </section>
        )}

        <section className="loan-history-section">
          <div className="section-heading">
            <div>
              <span className="loans-eyebrow">
                APPLICATION HISTORY
              </span>
              <h2>Your loan applications</h2>
            </div>
          </div>

          {loansLoading ? (
            <div className="loan-empty-state">
              <Loader2 className="loans-spinner" size={21} />
              <span>Loading applications...</span>
            </div>
          ) : loans.length === 0 ? (
            <div className="loan-empty-state">
              <div className="empty-icon">
                <FileText size={22} />
              </div>

              <h3>No loan applications yet</h3>

              <p>
                Once you submit a loan application, it will
                appear here.
              </p>
            </div>
          ) : (
            <div className="loan-table-wrapper">
              <table className="loan-table">
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Applied</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td>
                        <div className="loan-reference">
                          <span>
                            Loan #{loan.id}
                          </span>

                          <small>
                            {loan.currency || "USD"}
                          </small>
                        </div>
                      </td>

                      <td>
                        <strong className="loan-amount">
                          $
                          {formatMoney(
                            loan.requested_amount
                          )}
                        </strong>
                      </td>

                      <td>
                        {loan.loan_type_display}
                      </td>

                      <td>
                        {formatDate(
                          loan.application_date
                        )}
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            loan.status
                          )}
                        >
                          {loan.status_display}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="loan-view-button"
                          onClick={() =>
                            handleViewLoan(loan)
                          }
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
      </div>

      {showApplication && (
        <div
          className="loan-modal-backdrop"
          onMouseDown={closeApplication}
        >
          <div
            className="loan-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="loan-modal-header">
              <div>
                <span className="loans-eyebrow">
                  NEW APPLICATION
                </span>
                <h2>Apply for a loan</h2>
              </div>

              <button
                type="button"
                className="loan-close-button"
                onClick={closeApplication}
                disabled={applicationLoading}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {error && (
              <div className="loans-alert error">
                <XCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <form
              className="loan-form"
              onSubmit={handleSubmit}
            >
              <div className="loan-form-field">
                <label htmlFor="requested_amount">
                  Requested amount
                </label>

                <div className="loan-input-wrap">
                  <span>$</span>

                  <input
                    id="requested_amount"
                    name="requested_amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="10,000.00"
                    value={form.requested_amount}
                    onChange={handleChange}
                    disabled={applicationLoading}
                    required
                  />
                </div>
              </div>

              <div className="loan-form-field">
                <label htmlFor="loan_type">
                  Loan type
                </label>

                <select
                  id="loan_type"
                  name="loan_type"
                  value={form.loan_type}
                  onChange={handleChange}
                  disabled={applicationLoading}
                >
                  <option value="personal">
                    Personal
                  </option>

                  <option value="business">
                    Business
                  </option>

                  <option value="education">
                    Education
                  </option>

                  <option value="emergency">
                    Emergency
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

              <div className="loan-form-field">
                <label htmlFor="reason">
                  Reason for loan
                </label>

                <textarea
                  id="reason"
                  name="reason"
                  rows="5"
                  placeholder="Tell us why you need the loan..."
                  value={form.reason}
                  onChange={handleChange}
                  disabled={applicationLoading}
                  required
                />
              </div>

              <div className="loan-form-notice">
                <Info size={17} />

                <p>
                  Submitting an application does not
                  guarantee approval. Your application will
                  be reviewed by the HarvestCoin
                  administration team.
                </p>
              </div>

              <div className="loan-form-actions">
                <button
                  type="button"
                  className="loan-cancel-button"
                  onClick={closeApplication}
                  disabled={applicationLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="loan-primary-button"
                  disabled={applicationLoading}
                >
                  {applicationLoading ? (
                    <>
                      <Loader2
                        className="loans-spinner"
                        size={17}
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit application
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedLoan && (
        <div
          className="loan-modal-backdrop"
          onMouseDown={closeLoanDetails}
        >
          <div
            className="loan-modal loan-details-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="loan-modal-header">
              <div>
                <span className="loans-eyebrow">
                  LOAN DETAILS
                </span>

                <h2>
                  Loan #{selectedLoan.id}
                </h2>
              </div>

              <button
                type="button"
                className="loan-close-button"
                onClick={closeLoanDetails}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="loan-detail-status-row">
              <span
                className={getStatusClass(
                  selectedLoan.status
                )}
              >
                {selectedLoan.status_display}
              </span>

              {selectedLoan.status === "approved" && (
                <span
                  className={getRepaymentClass(
                    selectedLoan.repayment_status
                  )}
                >
                  {selectedLoan.repayment_status_display}
                </span>
              )}
            </div>

            <div className="loan-detail-highlight">
              <span>Requested amount</span>

              <strong>
                $
                {formatMoney(
                  selectedLoan.requested_amount
                )}
              </strong>
            </div>

            <div className="loan-detail-grid">
              <div>
                <span>Approved amount</span>
                <strong>
                  {selectedLoan.approved_amount
                    ? `$${formatMoney(
                        selectedLoan.approved_amount
                      )}`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Loan type</span>
                <strong>
                  {selectedLoan.loan_type_display}
                </strong>
              </div>

              <div>
                <span>Interest rate</span>
                <strong>
                  {selectedLoan.approved_amount
                    ? `${Number(
                        selectedLoan.interest_rate || 0
                      )}%`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Interest amount</span>
                <strong>
                  {selectedLoan.approved_amount
                    ? `$${formatMoney(
                        selectedLoan.interest_amount
                      )}`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Total repayment</span>
                <strong>
                  {selectedLoan.approved_amount
                    ? `$${formatMoney(
                        selectedLoan.total_repayment_amount
                      )}`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Outstanding balance</span>
                <strong>
                  $
                  {formatMoney(
                    selectedLoan.outstanding_balance
                  )}
                </strong>
              </div>

              <div>
                <span>Repayment period</span>
                <strong>
                  {selectedLoan.repayment_period_days
                    ? `${selectedLoan.repayment_period_days} days`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Due date</span>
                <strong>
                  {formatDate(selectedLoan.due_date)}
                </strong>
              </div>

              <div>
                <span>Application date</span>
                <strong>
                  {formatDate(
                    selectedLoan.application_date
                  )}
                </strong>
              </div>

              <div>
                <span>Decision date</span>
                <strong>
                  {formatDate(
                    selectedLoan.decision_date
                  )}
                </strong>
              </div>
            </div>

            <div className="loan-detail-reason">
              <span>Reason</span>
              <p>{selectedLoan.reason}</p>
            </div>

            {selectedLoan.admin_note && (
              <div className="loan-admin-note">
                <div>
                  <Info size={16} />
                  <span>Admin note</span>
                </div>

                <p>{selectedLoan.admin_note}</p>
              </div>
            )}

            {selectedLoan.reviewer_name && (
              <div className="loan-reviewer">
                <span>Reviewed by</span>
                <strong>
                  HarvestCoin Administration Team
                </strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}