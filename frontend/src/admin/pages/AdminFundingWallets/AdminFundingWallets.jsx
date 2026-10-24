
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
import { useEffect, useState } from "react";

import api from "../../../api/api";
import "./AdminFundingWallets.css";

const ASSETS = {
  BTC: {
    name: "Bitcoin",
    network: "Bitcoin",
    symbol: "₿",
    placeholder: "Enter your Bitcoin wallet address",
    instruction: "Only send BTC through the Bitcoin network to this address.",
  },
  ETH: {
    name: "Ethereum",
    network: "Ethereum Mainnet",
    symbol: "Ξ",
    placeholder: "Enter your Ethereum wallet address (0x...)",
    instruction: "Only send native ETH through Ethereum Mainnet to this address.",
  },
};

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (data && typeof data === "object") {
    for (const value of Object.values(data)) {
      if (typeof value === "string") return value;

      if (Array.isArray(value)) {
        const message = value.find(
          (item) => typeof item === "string" ||
            (item && typeof item.toString === "function")
        );

        if (message) return String(message);
      }
    }
  }

  return fallback;
};

export default function AdminFundingWallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [asset, setAsset] = useState("BTC");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const fetchWallets = async ({ showRefresh = false } = {}) => {
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

      const data = response.data;
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      setWallets(items);
    } catch (requestError) {
      console.error("Admin funding wallets error:", requestError);
      setError(
        getErrorMessage(
          requestError,
          "Unable to load funding wallets. Please try again."
        )
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
    setAsset("BTC");
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
    const walletAsset = wallet.asset === "ETH" ? "ETH" : "BTC";

    setEditingWallet(wallet);
    setAsset(walletAsset);
    setAddress(wallet.address || "");
    setIsActive(Boolean(wallet.is_active));
    setFormError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

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
        `Enter the ${ASSETS[asset].name} wallet address.`
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
          `${ASSETS[asset].name} funding wallet updated successfully.`
        );
      } else {
        await api.post(
          "/payments/admin/funding-wallets/",
          {
            asset,
            address: trimmedAddress,
            is_active: isActive,
          }
        );

        setSuccess(
          `${ASSETS[asset].name} funding wallet added successfully.`
        );
      }

      setShowForm(false);
      resetForm();
      await fetchWallets();
    } catch (requestError) {
      console.error("Funding wallet save error:", requestError);
      setFormError(
        getErrorMessage(
          requestError,
          "Unable to save the funding wallet."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (wallet) => {
    setError("");
    setSuccess("");

    const walletAsset = wallet.asset === "ETH" ? "ETH" : "BTC";
    const assetName = ASSETS[walletAsset].name;

    try {
      await api.patch(
        `/payments/admin/funding-wallets/${wallet.id}/`,
        { is_active: !wallet.is_active }
      );

      setSuccess(
        wallet.is_active
          ? `${assetName} funding wallet deactivated.`
          : `${assetName} funding wallet activated.`
      );

      await fetchWallets();
    } catch (requestError) {
      console.error("Funding wallet status error:", requestError);
      setError(
        getErrorMessage(
          requestError,
          "Unable to update wallet status."
        )
      );
    }
  };

  const handleDelete = async (wallet) => {
    const walletAsset = wallet.asset === "ETH" ? "ETH" : "BTC";
    const assetName = ASSETS[walletAsset].name;

    const confirmed = window.confirm(
      `Delete this ${assetName} funding wallet? Existing funding requests should retain their recorded wallet address.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/payments/admin/funding-wallets/${wallet.id}/`
      );

      setSuccess(`${assetName} funding wallet deleted successfully.`);
      await fetchWallets();
    } catch (requestError) {
      console.error("Funding wallet delete error:", requestError);
      setError(
        getErrorMessage(
          requestError,
          "Unable to delete the funding wallet."
        )
      );
    }
  };

  const handleCopy = async (wallet) => {
    if (!wallet.address) return;

    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopiedId(wallet.id);

      window.setTimeout(() => {
        setCopiedId((current) =>
          current === wallet.id ? null : current
        );
      }, 2000);
    } catch (copyError) {
      console.error("Failed to copy wallet address:", copyError);
      setError(
        "Unable to copy automatically. Select and copy the address manually."
      );
    }
  };

  const btcWallets = wallets.filter((wallet) => wallet.asset === "BTC");
  const ethWallets = wallets.filter((wallet) => wallet.asset === "ETH");
  const activeBtc = btcWallets.filter((wallet) => wallet.is_active).length;
  const activeEth = ethWallets.filter((wallet) => wallet.is_active).length;

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <section className="admin-funding-wallets-page">
      <header className="admin-funding-wallets-header">
        <div>
          <span className="admin-funding-wallets-eyebrow">
            Administration
          </span>
          <h1>Funding Wallets</h1>
          <p>
            Manage Bitcoin and Ethereum Mainnet addresses used for
            customer account funding.
          </p>
        </div>

        <div className="admin-funding-wallets-header-actions">
          <button
            type="button"
            className="admin-funding-wallets-refresh"
            onClick={() => fetchWallets({ showRefresh: true })}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "admin-funding-wallets-spin" : ""}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            className="admin-funding-wallets-add"
            onClick={openAddForm}
          >
            <Plus size={17} />
            <span>Add wallet</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="admin-funding-wallets-error" role="alert">
          <XCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => fetchWallets()}>
            Try again
          </button>
        </div>
      )}

      {success && (
        <div className="admin-funding-wallets-success" role="status">
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
                {editingWallet ? "Edit wallet" : "New wallet"}
              </span>
              <h2>
                {editingWallet
                  ? `Update ${ASSETS[asset].name} wallet`
                  : "Add funding wallet"}
              </h2>
              <p>
                Only use an address you control and verify the network
                carefully before activating it.
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
              <div className="admin-funding-wallets-form-error" role="alert">
                <XCircle size={17} />
                <span>{formError}</span>
              </div>
            )}

            <div className="admin-funding-wallets-field">
              <label htmlFor="funding-wallet-asset">Crypto asset</label>
              <select
                id="funding-wallet-asset"
                value={asset}
                onChange={(event) => setAsset(event.target.value)}
                disabled={saving || Boolean(editingWallet)}
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
              </select>
              {editingWallet && (
                <span>
                  The asset cannot be changed when editing an existing
                  wallet. Add a separate wallet for the other asset.
                </span>
              )}
            </div>

            <div className="admin-funding-wallets-network-preview">
              <span>Network</span>
              <strong>{ASSETS[asset].network}</strong>
              <p>{ASSETS[asset].instruction}</p>
            </div>

            <div className="admin-funding-wallets-field">
              <label htmlFor="funding-wallet-address">
                {ASSETS[asset].name} wallet address
              </label>
              <input
                id="funding-wallet-address"
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder={ASSETS[asset].placeholder}
                autoComplete="off"
                spellCheck="false"
                disabled={saving}
              />
              <span>
                Customers will be shown this address when funding with{" "}
                {asset}.
              </span>
            </div>

            <label className="admin-funding-wallets-active-toggle">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                disabled={saving}
              />
              <span className="admin-funding-wallets-toggle-box">
                <CheckCircle2 size={14} />
              </span>
              <span>
                <strong>Active funding wallet</strong>
                <small>
                  Customers can use this address while it is active.
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
          <span>Bitcoin wallets</span>
          <strong>
            <span className="admin-funding-wallets-overview-symbol">₿</span>
            {btcWallets.length} total
          </strong>
          <small>{activeBtc} active</small>
        </div>

        <div className="admin-funding-wallets-overview-item">
          <span>Ethereum wallets</span>
          <strong>
            <span className="admin-funding-wallets-overview-symbol">Ξ</span>
            {ethWallets.length} total
          </strong>
          <small>{activeEth} active</small>
        </div>

        <div className="admin-funding-wallets-overview-item">
          <span>Active addresses</span>
          <strong>
            <Wallet size={15} />
            {activeBtc + activeEth}
          </strong>
          <small>Across both assets</small>
        </div>
      </div>

      <div className="admin-funding-wallets-table-card">
        <div className="admin-funding-wallets-table-heading">
          <div>
            <h2>Configured addresses</h2>
            <p>BTC and ETH addresses are managed separately.</p>
          </div>
          <span>{wallets.length} wallet{wallets.length === 1 ? "" : "s"}</span>
        </div>

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
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={`wallet-skeleton-${index}`}>
                    <td colSpan="6">
                      <div className="admin-funding-wallets-skeleton-row" />
                    </td>
                  </tr>
                ))
              ) : wallets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-funding-wallets-empty">
                    <div className="admin-funding-wallets-empty-icon">
                      <Wallet size={22} />
                    </div>
                    <strong>No funding wallets</strong>
                    <span>
                      Add a Bitcoin or Ethereum wallet to enable customer
                      funding.
                    </span>
                    <button type="button" onClick={openAddForm}>
                      Add wallet
                    </button>
                  </td>
                </tr>
              ) : (
                wallets.map((wallet) => {
                  const walletAsset =
                    wallet.asset === "ETH" ? "ETH" : "BTC";
                  const details = ASSETS[walletAsset];

                  return (
                    <tr key={wallet.id}>
                      <td>
                        <div className="admin-funding-wallets-asset">
                          <div
                            className={`admin-funding-wallets-asset-icon ${walletAsset.toLowerCase()}`}
                          >
                            {details.symbol}
                          </div>
                          <div>
                            <strong>{walletAsset}</strong>
                            <span>{details.name}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="admin-funding-wallets-address">
                          <span title={wallet.address}>
                            {wallet.address}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(wallet)}
                            aria-label={`Copy ${walletAsset} wallet address`}
                            title="Copy address"
                          >
                            {copiedId === wallet.id ? (
                              <CheckCircle2 size={15} />
                            ) : (
                              <Copy size={15} />
                            )}
                          </button>
                        </div>
                      </td>

                      <td>
                        <span className="admin-funding-wallets-network">
                          {wallet.network || details.network}
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
                          {wallet.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <span className="admin-funding-wallets-date">
                          {formatDate(wallet.updated_at)}
                        </span>
                      </td>

                      <td>
                        <div className="admin-funding-wallets-actions">
                          <button
                            type="button"
                            className="admin-funding-wallets-action-edit"
                            onClick={() => openEditForm(wallet)}
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-funding-wallets-action-toggle"
                            onClick={() => handleToggle(wallet)}
                          >
                            {wallet.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            className="admin-funding-wallets-action-delete"
                            onClick={() => handleDelete(wallet)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
          <strong>Funding address security</strong>
          <p>
            Verify every address and its network before activating it.
            Bitcoin and Ethereum Mainnet are different networks; sending
            funds to the wrong network may result in permanent loss.
            Funding requests should only credit customer balances after
            an administrator verifies the payment and approves it.
          </p>
        </div>
      </div>
    </section>
  );
}
