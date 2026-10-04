import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  User,
  Wallet,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../../api/api";

import "./AdminUserDetail.css";


export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [direction, setDirection] = useState("credit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [adjusting, setAdjusting] = useState(false);

  const [messageModalOpen, setMessageModalOpen] =
    useState(false);

  const [messageTitle, setMessageTitle] =
    useState("");

  const [messageText, setMessageText] =
    useState("");

  const [sendingMessage, setSendingMessage] =
    useState(false);

  const [messageError, setMessageError] =
    useState("");

  const [messageSuccess, setMessageSuccess] =
    useState("");


  const fetchUser = async ({
    showRefresh = false,
  } = {}) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setSuccess("");

    try {
      const response = await api.get(
        `/admin-dashboard/users/${id}/`
      );

      setUser(response.data);
    } catch (requestError) {
      console.error(
        "Admin user detail error:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to load this user."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchUser();
  }, [id]);


  const formatCurrency = (value) => {
    const amountValue = Number(value || 0);

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountValue);
  };


  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };


  const getUserInitials = () => {
    const source =
      user?.username ||
      user?.email ||
      "U";

    return source
      .trim()
      .slice(0, 2)
      .toUpperCase();
  };


  const handleWalletAdjustment = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const numericAmount = Number(amount);

    if (
      !amount ||
      !Number.isFinite(numericAmount)
    ) {
      setError(
        "Please enter a valid wallet amount."
      );
      return;
    }

    if (numericAmount <= 0) {
      setError(
        "Wallet amount must be greater than zero."
      );
      return;
    }

    if (
      direction === "debit" &&
      numericAmount >
        Number(user?.wallet_balance || 0)
    ) {
      setError(
        "The debit amount cannot be greater than the user's wallet balance."
      );
      return;
    }

    setAdjusting(true);

    try {
      const response = await api.post(
        `/admin-dashboard/users/${id}/wallet-adjustment/`,
        {
          direction,
          amount: numericAmount.toFixed(2),
          description: description.trim(),
        }
      );

      setSuccess(
        response.data?.detail ||
          "Wallet updated successfully."
      );

      setAmount("");
      setDescription("");

      await fetchUser({
        showRefresh: true,
      });
    } catch (requestError) {
      console.error(
        "Wallet adjustment error:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          requestError.response?.data?.amount?.[0] ||
          "Unable to update the user's wallet."
      );
    } finally {
      setAdjusting(false);
    }
  };


  const openMessageModal = () => {
    setMessageTitle("");
    setMessageText("");
    setMessageError("");
    setMessageSuccess("");
    setMessageModalOpen(true);
  };


  const closeMessageModal = () => {
    if (sendingMessage) {
      return;
    }

    setMessageModalOpen(false);
    setMessageTitle("");
    setMessageText("");
    setMessageError("");
    setMessageSuccess("");
  };


  const handleSendMessage = async (
    event
  ) => {
    event.preventDefault();

    setMessageError("");
    setMessageSuccess("");

    const title = messageTitle.trim();
    const message = messageText.trim();

    if (!title) {
      setMessageError(
        "Please enter a message title."
      );
      return;
    }

    if (!message) {
      setMessageError(
        "Please enter your message."
      );
      return;
    }

    setSendingMessage(true);

    try {
      await api.post(
        `/notifications/admin/users/${id}/messages/`,
        {
          title,
          message,
        }
      );

      setMessageSuccess(
        "Message sent successfully."
      );

      setMessageTitle("");
      setMessageText("");

      setTimeout(() => {
        setMessageModalOpen(false);
        setMessageSuccess("");
      }, 1200);
    } catch (requestError) {
      console.error(
        "Admin notification error:",
        requestError
      );

      const responseData =
        requestError.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const firstError =
          Object.values(responseData)
            .flat()
            .find(
              (messageValue) =>
                typeof messageValue ===
                "string"
            );

        setMessageError(
          firstError ||
            responseData.detail ||
            "Unable to send the message."
        );
      } else {
        setMessageError(
          "Unable to send the message."
        );
      }
    } finally {
      setSendingMessage(false);
    }
  };


  if (loading) {
    return (
      <section className="admin-user-detail-page">
        <div className="admin-user-detail-loading">
          <RefreshCw
            size={20}
            className="admin-user-detail-spin"
          />

          <span>
            Loading user...
          </span>
        </div>
      </section>
    );
  }


  if (!user) {
    return (
      <section className="admin-user-detail-page">
        <div className="admin-user-detail-error-page">
          <div className="admin-user-detail-error-icon">
            <XCircle size={26} />
          </div>

          <h2>
            User not found
          </h2>

          <p>
            {error ||
              "This user could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/users")
            }
            className="admin-user-detail-back-button"
          >
            <ArrowLeft size={17} />

            Back to users
          </button>
        </div>
      </section>
    );
  }


  return (
    <section className="admin-user-detail-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="admin-user-detail-header">

        <div>
          <Link
            to="/admin/users"
            className="admin-user-detail-back-link"
          >
            <ArrowLeft size={16} />

            Back to users
          </Link>

          <span className="admin-user-detail-eyebrow">
            User Management
          </span>

          <h1>
            {user.username ||
              "Unnamed user"}
          </h1>

          <p>
            Review account information and
            manage this user's account.
          </p>
        </div>


        <div className="admin-user-detail-header-actions">

          <button
            type="button"
            className="admin-user-detail-message-button"
            onClick={openMessageModal}
          >
            <MessageSquare size={17} />

            <span>
              Message User
            </span>
          </button>


          <button
            type="button"
            className="admin-user-detail-refresh"
            onClick={() =>
              fetchUser({
                showRefresh: true,
              })
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "admin-user-detail-spin"
                  : ""
              }
            />

            <span>
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </span>
          </button>

        </div>

      </div>


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="admin-user-detail-alert error">
          <XCircle size={18} />

          <span>{error}</span>
        </div>
      )}


      {/* =====================================================
          SUCCESS
          ===================================================== */}

      {success && (
        <div className="admin-user-detail-alert success">
          <CheckCircle2 size={18} />

          <span>{success}</span>
        </div>
      )}


      {/* =====================================================
          USER OVERVIEW
          ===================================================== */}

      <div className="admin-user-detail-grid">

        {/* USER PROFILE */}

        <div className="admin-user-detail-card">

          <div className="admin-user-detail-card-header">
            <div>
              <span className="admin-user-detail-card-eyebrow">
                Account
              </span>

              <h2>
                User information
              </h2>
            </div>

            <div className="admin-user-detail-card-icon">
              <User size={18} />
            </div>
          </div>


          <div className="admin-user-detail-profile">

            <div className="admin-user-detail-avatar">
              {getUserInitials()}
            </div>

            <div>
              <strong>
                {user.username ||
                  "Unnamed user"}
              </strong>

              <span>
                User ID #{user.id}
              </span>
            </div>

          </div>


          <div className="admin-user-detail-info-list">

            <div className="admin-user-detail-info-item">
              <div className="admin-user-detail-info-icon">
                <Mail size={16} />
              </div>

              <div>
                <span>Email</span>

                <strong>
                  {user.email ||
                    "No email"}
                </strong>
              </div>
            </div>


            <div className="admin-user-detail-info-item">
              <div className="admin-user-detail-info-icon">
                <Phone size={16} />
              </div>

              <div>
                <span>Phone number</span>

                <strong>
                  {user.phone_number ||
                    "No phone number"}
                </strong>
              </div>
            </div>


            <div className="admin-user-detail-info-item">
              <div className="admin-user-detail-info-icon">
                <ShieldCheck size={16} />
              </div>

              <div>
                <span>Role</span>

                <strong>
                  {user.role ||
                    "customer"}
                </strong>
              </div>
            </div>

          </div>

        </div>


        {/* ACCOUNT STATUS */}

        <div className="admin-user-detail-card">

          <div className="admin-user-detail-card-header">
            <div>
              <span className="admin-user-detail-card-eyebrow">
                Security
              </span>

              <h2>
                Account status
              </h2>
            </div>

            <div className="admin-user-detail-card-icon">
              <ShieldCheck size={18} />
            </div>
          </div>


          <div className="admin-user-detail-status-list">

            <div className="admin-user-detail-status-item">

              <div>
                <strong>
                  Account
                </strong>

                <span>
                  Current account status
                </span>
              </div>

              <span
                className={
                  user.is_active
                    ? "admin-user-detail-status active"
                    : "admin-user-detail-status inactive"
                }
              >
                <span className="status-dot" />

                {user.is_active
                  ? "Active"
                  : "Inactive"}
              </span>

            </div>


            <div className="admin-user-detail-status-item">

              <div>
                <strong>
                  Email verification
                </strong>

                <span>
                  Email address verification
                </span>
              </div>

              <span
                className={
                  user.email_verified
                    ? "admin-user-detail-status active"
                    : "admin-user-detail-status pending"
                }
              >
                {user.email_verified
                  ? "Verified"
                  : "Pending"}
              </span>

            </div>


            <div className="admin-user-detail-status-item">

              <div>
                <strong>
                  KYC verification
                </strong>

                <span>
                  Identity verification status
                </span>
              </div>

              <span
                className={
                  user.is_kyc_verified
                    ? "admin-user-detail-status active"
                    : "admin-user-detail-status pending"
                }
              >
                {user.is_kyc_verified
                  ? "Verified"
                  : "Pending"}
              </span>

            </div>


            <div className="admin-user-detail-status-item">

              <div>
                <strong>
                  Joined
                </strong>

                <span>
                  Account creation date
                </span>
              </div>

              <span className="admin-user-detail-date">
                {formatDate(
                  user.date_joined
                )}
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          WALLET
          ===================================================== */}

      <div className="admin-user-detail-wallet-grid">

        {/* CURRENT BALANCE */}

        <div className="admin-user-detail-wallet-card">

          <div className="admin-user-detail-wallet-top">

            <div>
              <span>
                Wallet balance
              </span>

              <strong>
                {formatCurrency(
                  user.wallet_balance
                )}
              </strong>
            </div>

            <div className="admin-user-detail-wallet-icon">
              <Wallet size={21} />
            </div>

          </div>

          <p>
            Current available balance in
            the user's USD wallet.
          </p>

        </div>


        {/* WALLET ADJUSTMENT */}

        <div className="admin-user-detail-card admin-user-detail-adjustment-card">

          <div className="admin-user-detail-card-header">

            <div>
              <span className="admin-user-detail-card-eyebrow">
                Wallet management
              </span>

              <h2>
                Adjust balance
              </h2>
            </div>

            <div className="admin-user-detail-card-icon">
              <Wallet size={18} />
            </div>

          </div>


          <form
            className="admin-user-detail-adjustment-form"
            onSubmit={
              handleWalletAdjustment
            }
          >

            <div className="admin-user-detail-direction">

              <button
                type="button"
                className={
                  direction === "credit"
                    ? "selected credit"
                    : ""
                }
                onClick={() =>
                  setDirection("credit")
                }
              >
                Credit wallet
              </button>

              <button
                type="button"
                className={
                  direction === "debit"
                    ? "selected debit"
                    : ""
                }
                onClick={() =>
                  setDirection("debit")
                }
              >
                Debit wallet
              </button>

            </div>


            <label>
              Amount

              <div className="admin-user-detail-input-wrap">

                <span>$</span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value
                    )
                  }
                  placeholder="0.00"
                  required
                />

              </div>
            </label>


            <label>
              Description

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder={
                  direction === "credit"
                    ? "Reason for wallet credit"
                    : "Reason for wallet debit"
                }
                rows="3"
                maxLength="255"
              />

            </label>


            <button
              type="submit"
              className={
                direction === "credit"
                  ? "admin-user-detail-adjust-button credit"
                  : "admin-user-detail-adjust-button debit"
              }
              disabled={adjusting}
            >

              {adjusting ? (
                <>
                  <RefreshCw
                    size={17}
                    className="admin-user-detail-spin"
                  />

                  Processing...
                </>
              ) : (
                <>
                  <Wallet size={17} />

                  {direction === "credit"
                    ? "Credit wallet"
                    : "Debit wallet"}
                </>
              )}

            </button>

          </form>

        </div>

      </div>


      {/* =====================================================
          ACCOUNT TIMESTAMPS
          ===================================================== */}

      <div className="admin-user-detail-meta">

        <div>
          <span>
            Account created
          </span>

          <strong>
            {formatDate(
              user.created_at
            )}
          </strong>
        </div>

        <div>
          <span>
            Last updated
          </span>

          <strong>
            {formatDate(
              user.updated_at
            )}
          </strong>
        </div>

      </div>


      {/* =====================================================
          MESSAGE MODAL
          ===================================================== */}

      {messageModalOpen && (
        <div
          className="admin-user-detail-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeMessageModal();
            }
          }}
        >
          <div
            className="admin-user-detail-message-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-user-title"
          >

            <div className="admin-user-detail-message-modal-header">

              <div>
                <span className="admin-user-detail-card-eyebrow">
                  Direct communication
                </span>

                <h2 id="message-user-title">
                  Message User
                </h2>

                <p>
                  Send a private message directly
                  to{" "}
                  <strong>
                    {user.username ||
                      user.email}
                  </strong>
                  .
                </p>
              </div>

              <button
                type="button"
                className="admin-user-detail-message-modal-close"
                onClick={closeMessageModal}
                disabled={sendingMessage}
                aria-label="Close message dialog"
              >
                ×
              </button>

            </div>


            {messageError && (
              <div className="admin-user-detail-message-alert error">
                <XCircle size={17} />

                <span>
                  {messageError}
                </span>
              </div>
            )}


            {messageSuccess && (
              <div className="admin-user-detail-message-alert success">
                <CheckCircle2 size={17} />

                <span>
                  {messageSuccess}
                </span>
              </div>
            )}


            <form
              className="admin-user-detail-message-form"
              onSubmit={
                handleSendMessage
              }
            >

              <label>
                Message title

                <input
                  type="text"
                  value={messageTitle}
                  onChange={(event) =>
                    setMessageTitle(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Account update"
                  maxLength="150"
                  disabled={sendingMessage}
                  autoFocus
                />
              </label>


              <label>
                Message

                <textarea
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(
                      event.target.value
                    )
                  }
                  placeholder="Write your message to this user..."
                  rows="7"
                  disabled={sendingMessage}
                />
              </label>


              <div className="admin-user-detail-message-form-footer">

                <span>
                  The user will receive this
                  message in their HarvestCoin
                  notifications.
                </span>

                <button
                  type="submit"
                  className="admin-user-detail-send-message-button"
                  disabled={sendingMessage}
                >
                  {sendingMessage ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="admin-user-detail-spin"
                      />

                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={17} />

                      Send message
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </section>
  );
}