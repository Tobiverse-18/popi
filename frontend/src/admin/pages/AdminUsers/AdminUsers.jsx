import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

import api from "../../../api/api";

import "./AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [totalUsers, setTotalUsers] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  const totalPages = Math.max(
    1,
    Math.ceil(totalUsers / pageSize)
  );

  const fetchUsers = async ({
    currentPage = page,
    currentSearch = appliedSearch,
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
        "/admin-dashboard/users/",
        {
          params: {
            page: currentPage,
            page_size: pageSize,
            ...(currentSearch
              ? { search: currentSearch }
              : {}),
          },
        }
      );

      setUsers(response.data?.results || []);
      setTotalUsers(response.data?.count || 0);
    } catch (requestError) {
      console.error(
        "Admin users error:",
        requestError
      );

      setError(
        requestError.response?.data?.detail ||
          "Unable to load users. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, appliedSearch]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const nextSearch = search.trim();

    setPage(1);
    setAppliedSearch(nextSearch);
  };

  const handleClearSearch = () => {
    setSearch("");
    setAppliedSearch("");
    setPage(1);
  };

  const handleRefresh = () => {
    fetchUsers({
      currentPage: page,
      currentSearch: appliedSearch,
      showRefresh: true,
    });
  };

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

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

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getUserInitials = (user) => {
    const source =
      user.username ||
      user.email ||
      "U";

    return source
      .trim()
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <section className="admin-users-page">
      <div className="admin-users-header">
        <div>
          <span className="admin-users-eyebrow">
            Administration
          </span>

          <h1>Users</h1>

          <p>
            Manage registered users and review
            account information.
          </p>
        </div>

        <button
          type="button"
          className="admin-users-refresh"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "admin-users-spin"
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

      <div className="admin-users-toolbar">
        <form
          className="admin-users-search"
          onSubmit={handleSearchSubmit}
        >
          <Search size={18} />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, email or phone"
            aria-label="Search users"
          />

          {search && (
            <button
              type="button"
              className="admin-users-search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <XCircle size={17} />
            </button>
          )}

          <button
            type="submit"
            className="admin-users-search-button"
          >
            Search
          </button>
        </form>

        <div className="admin-users-count">
          <span>Total users</span>
          <strong>{totalUsers}</strong>
        </div>
      </div>

      {error && (
        <div className="admin-users-error">
          <XCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={handleRefresh}
          >
            Try again
          </button>
        </div>
      )}

      <div className="admin-users-table-card">
        <div className="admin-users-table-wrap">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Verification</th>
                <th>Status</th>
                <th>Wallet</th>
                <th>Joined</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map(
                  (_, index) => (
                    <tr
                      key={`skeleton-${index}`}
                      className="admin-users-skeleton-row"
                    >
                      <td>
                        <div className="admin-users-skeleton user" />
                      </td>

                      <td>
                        <div className="admin-users-skeleton medium" />
                      </td>

                      <td>
                        <div className="admin-users-skeleton small" />
                      </td>

                      <td>
                        <div className="admin-users-skeleton medium" />
                      </td>

                      <td>
                        <div className="admin-users-skeleton small" />
                      </td>

                      <td>
                        <div className="admin-users-skeleton medium" />
                      </td>

                      <td>
                        <div className="admin-users-skeleton small" />
                      </td>
                    </tr>
                  )
                )
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="admin-users-empty"
                  >
                    <div className="admin-users-empty-icon">
                      <User size={22} />
                    </div>

                    <strong>
                      No users found
                    </strong>

                    <span>
                      {appliedSearch
                        ? "Try a different search."
                        : "There are no registered users yet."}
                    </span>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-users-user">
                        <div className="admin-users-avatar">
                          {getUserInitials(user)}
                        </div>

                        <div className="admin-users-user-info">
                          <strong>
                            {user.username ||
                              "Unnamed user"}
                          </strong>

                          <span>
                            ID #{user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="admin-users-contact">
                        <div>
                          <Mail size={14} />

                          <span>
                            {user.email ||
                              "No email"}
                          </span>
                        </div>

                        {user.phone_number && (
                          <span className="admin-users-phone">
                            {user.phone_number}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="admin-users-role">
                        {user.role || "customer"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-users-verification">
                        <span
                          className={
                            user.email_verified
                              ? "verification verified"
                              : "verification pending"
                          }
                        >
                          {user.email_verified ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}

                          {user.email_verified
                            ? "Email"
                            : "Email pending"}
                        </span>

                        <span
                          className={
                            user.is_kyc_verified
                              ? "verification verified"
                              : "verification pending"
                          }
                        >
                          <ShieldCheck size={14} />

                          {user.is_kyc_verified
                            ? "KYC"
                            : "KYC pending"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          user.is_active
                            ? "admin-users-status active"
                            : "admin-users-status inactive"
                        }
                      >
                        <span className="status-dot" />

                        {user.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <strong className="admin-users-balance">
                        {formatCurrency(
                          user.wallet_balance
                        )}
                      </strong>
                    </td>

                    <td>
                      <span className="admin-users-date">
                        {formatDate(
                          user.date_joined
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && users.length > 0 && (
          <div className="admin-users-pagination">
            <span>
              Showing{" "}
              <strong>
                {(page - 1) * pageSize + 1}
              </strong>
              {" — "}
              <strong>
                {Math.min(
                  page * pageSize,
                  totalUsers
                )}
              </strong>{" "}
              of{" "}
              <strong>{totalUsers}</strong>
            </span>

            <div className="admin-users-page-controls">
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                disabled={page === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="admin-users-page-number">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      totalPages,
                      current + 1
                    )
                  )
                }
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}