import {
  CheckCircle2,
  Copy,
  Edit3,
  Plus,
  RefreshCw,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import api from "../../../api/api";

import "./AdminFundingWallets.css";

export default function AdminFundingWallets() {
  const [wallets, setWallets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingWallet, setEditingWallet] =
    useState(null);

  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const [copiedId, setCopiedId] = useState(null);

  const fetchWallets = async ({
    showRefresh = false,
  } = {}) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get(
        "/payments/admin/funding-wallets/"
      );

      setWallets(response.data?.results || response.data || []);
    } catch (requestError) {
      console.error(
        "Admin funding wallets error:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to load funding wallets. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const resetForm = () => {
    setAddress("");
    setIsActive(true);
    setEditingWallet(null);
    setFormError("");
  };

  const openAddForm = () => {
    resetForm();
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (wallet) => {
    setEditingWallet(wallet);
    setAddress(wallet.address || "");
    setIsActive(Boolean(wallet.is_active));
    setFormError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccess("");

    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setFormError(
        "Enter the Bitcoin wallet address."
      );
      return;
    }

    setSaving(true);

    try {
      if (editingWallet) {
        await api.patch(
          `/payments/admin/funding-wallets/${editingWallet.id}/`,
          {
            address: trimmedAddress,
            is_active: isActive,
          }
        );

        setSuccess(
          "Bitcoin funding wallet updated successfully."
        );
      } else {
        await api.post(
          "/payments/admin/funding-wallets/",
          {
            address: trimmedAddress,
            is_active: isActive,
          }
        );

        setSuccess(
          "Bitcoin funding wallet added successfully."
        );
      }

      setShowForm(false);
      resetForm();

      await fetchWallets();
    } catch (requestError) {
      console.error(
        "Funding wallet save error:",
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
              (message) =>
                typeof message === "string"
            );

        setFormError(
          firstError ||
            responseData.detail ||
            "Unable to save the funding wallet."
        );
      } else {
        setFormError(
          "Unable to save the funding wallet."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (wallet) => {
    setError("");
    setSuccess("");

    try {
      await api.patch(
        `/payments/admin/funding-wallets/${wallet.id}/`,
        {
          is_active: !wallet.is_active,
        }
      );

      setSuccess(
        wallet.is_active
          ? "Bitcoin funding wallet deactivated."
          : "Bitcoin funding wallet activated."
      );

      await fetchWallets();
    } catch (requestError) {
      console.error(
        "Funding wallet status error:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to update wallet status."
      );
    }
  };

  const handleDelete = async (wallet) => {
    const confirmed = window.confirm(
      "Delete this Bitcoin funding wallet? Historical funding requests will keep their recorded wallet address."
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/payments/admin/funding-wallets/${wallet.id}/`
      );

      setSuccess(
        "Bitcoin funding wallet deleted successfully."
      );

      await fetchWallets();
    } catch (requestError) {
      console.error(
        "Funding wallet delete error:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to delete the funding wallet."
      );
    }
  };

  const handleCopy = async (wallet) => {
    if (!wallet.address) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        wallet.address
      );

      setCopiedId(wallet.id);

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (copyError) {
      console.error(
        "Failed to copy wallet address:",
        copyError
      );
    }
  };

  return (
    <section className="admin-funding-wallets-page">
      <div className="admin-funding-wallets-header">
        <div>
          <span className="admin-funding-wallets-eyebrow">
            Administration
          </span>

          <h1>Funding Wallets</h1>

          <p>
            Manage the Bitcoin address used for
            customer account funding.
          </p>
        </div>

        <div className="admin-funding-wallets-header-actions">
          <button
            type="button"
            className="admin-funding-wallets-refresh"
            onClick={() =>
              fetchWallets({
                showRefresh: true,
              })
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "admin-funding-wallets-spin"
                  : ""
              }
            />

            <span>
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </span>
          </button>

          <button
            type="button"
            className="admin-funding-wallets-add"
            onClick={openAddForm}
          >
            <Plus size={17} />

            <span>Add BTC wallet</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-funding-wallets-error">
          <XCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => fetchWallets()}
          >
            Try again
          </button>
        </div>
      )}

      {success && (
        <div className="admin-funding-wallets-success">
          <CheckCircle2 size={18} />

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            ×
          </button>
        </div>
      )}

      {showForm && (
        <div className="admin-funding-wallets-form-card">
          <div className="admin-funding-wallets-form-header">
            <div>
              <span className="admin-funding-wallets-form-eyebrow">
                {editingWallet
                  ? "Edit wallet"
                  : "New wallet"}
              </span>

              <h2>
                {editingWallet
                  ? "Update Bitcoin wallet"
                  : "Add Bitcoin funding wallet"}
              </h2>

              <p>
                This address will be shown to
                customers when they fund their
                HarvestCoin wallet.
              </p>
            </div>

            <button
              type="button"
              className="admin-funding-wallets-form-close"
              onClick={closeForm}
              disabled={saving}
              aria-label="Close form"
            >
              ×
            </button>
          </div>

          <form
            className="admin-funding-wallets-form"
            onSubmit={handleSubmit}
          >
            {formError && (
              <div className="admin-funding-wallets-form-error">
                <XCircle size={17} />

                <span>{formError}</span>
              </div>
            )}

            <div className="admin-funding-wallets-field">
              <label htmlFor="funding-wallet-address">
                Bitcoin wallet address
              </label>

              <input
                id="funding-wallet-address"
                type="text"
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                placeholder="Enter BTC wallet address"
                autoComplete="off"
                spellCheck="false"
                disabled={saving}
              />

              <span>
                Only send BTC through the Bitcoin
                network to this address.
              </span>
            </div>

            <label className="admin-funding-wallets-active-toggle">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(
                    event.target.checked
                  )
                }
                disabled={saving}
              />

              <span className="admin-funding-wallets-toggle-box">
                <CheckCircle2 size={14} />
              </span>

              <span>
                <strong>
                  Active funding wallet
                </strong>

                <small>
                  Customers can use this address
                  when it is active.
                </small>
              </span>
            </label>

            <div className="admin-funding-wallets-form-actions">
              <button
                type="button"
                className="admin-funding-wallets-cancel"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-funding-wallets-save"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingWallet
                    ? "Save changes"
                    : "Add wallet"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-funding-wallets-overview">
        <div className="admin-funding-wallets-overview-item">
          <span>Asset</span>

          <strong>
            <Wallet size={15} />
            Bitcoin
          </strong>
        </div>

        <div className="admin-funding-wallets-overview-item">
          <span>Network</span>

          <strong>Bitcoin</strong>
        </div>

        <div className="admin-funding-wallets-overview-item">
          <span>Active wallets</span>

          <strong>
            {wallets.filter(
              (wallet) => wallet.is_active
            ).length}
          </strong>
        </div>
      </div>

      <div className="admin-funding-wallets-table-card">
        <div className="admin-funding-wallets-table-wrap">
          <table className="admin-funding-wallets-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Wallet address</th>
                <th>Network</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map(
                  (_, index) => (
                    <tr
                      key={`wallet-skeleton-${index}`}
                      className="admin-funding-wallets-skeleton-row"
                    >
                      <td>
                        <div className="admin-funding-wallets-skeleton small" />
                      </td>

                      <td>
                        <div className="admin-funding-wallets-skeleton address" />
                      </td>

                      <td>
                        <div className="admin-funding-wallets-skeleton small" />
                      </td>

                      <td>
                        <div className="admin-funding-wallets-skeleton medium" />
                      </td>

                      <td>
                        <div className="admin-funding-wallets-skeleton medium" />
                      </td>

                      <td>
                        <div className="admin-funding-wallets-skeleton actions" />
                      </td>
                    </tr>
                  )
                )
              ) : wallets.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="admin-funding-wallets-empty"
                  >
                    <div className="admin-funding-wallets-empty-icon">
                      <Wallet size={22} />
                    </div>

                    <strong>
                      No funding wallets
                    </strong>

                    <span>
                      Add a Bitcoin wallet to enable
                      customer funding.
                    </span>

                    <button
                      type="button"
                      onClick={openAddForm}
                    >
                      Add BTC wallet
                    </button>
                  </td>
                </tr>
              ) : (
                wallets.map((wallet) => (
                  <tr key={wallet.id}>
                    <td>
                      <div className="admin-funding-wallets-asset">
                        <div className="admin-funding-wallets-asset-icon">
                          ₿
                        </div>

                        <div>
                          <strong>
                            {wallet.asset}
                          </strong>

                          <span>
                            Bitcoin
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="admin-funding-wallets-address">
                        <span>
                          {wallet.address}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(wallet)
                          }
                          aria-label="Copy wallet address"
                        >
                          {copiedId ===
                          wallet.id ? (
                            <CheckCircle2
                              size={15}
                            />
                          ) : (
                            <Copy size={15} />
                          )}
                        </button>
                      </div>
                    </td>

                    <td>
                      <span className="admin-funding-wallets-network">
                        {wallet.network}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          wallet.is_active
                            ? "admin-funding-wallets-status active"
                            : "admin-funding-wallets-status inactive"
                        }
                      >
                        <span className="admin-funding-wallets-status-dot" />

                        {wallet.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <span className="admin-funding-wallets-date">
                        {wallet.updated_at
                          ? new Intl.DateTimeFormat(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            ).format(
                              new Date(
                                wallet.updated_at
                              )
                            )
                          : "—"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-funding-wallets-actions">
                        <button
                          type="button"
                          className="admin-funding-wallets-action-edit"
                          onClick={() =>
                            openEditForm(wallet)
                          }
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-funding-wallets-action-toggle"
                          onClick={() =>
                            handleToggle(wallet)
                          }
                        >
                          {wallet.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          type="button"
                          className="admin-funding-wallets-action-delete"
                          onClick={() =>
                            handleDelete(wallet)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-funding-wallets-security">
        <div className="admin-funding-wallets-security-icon">
          <ShieldCheck size={18} />
        </div>

        <div>
          <strong>Funding address control</strong>

          <p>
            Customers only see an active Bitcoin
            funding address. When an address is
            changed, existing funding requests keep
            the address that was recorded when the
            request was submitted.
          </p>
        </div>
      </div>
    </section>
  );
}