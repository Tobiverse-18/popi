import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleDollarSign,
  TrendingUp,
  Users,
} from "lucide-react";

import api from "../../../api/api";

import "./AdminDashboard.css";


export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/admin-dashboard/dashboard/"
        );

        setData(response.data);
      } catch (error) {
        console.error(
          "Admin dashboard error:",
          error
        );

        setError(
          error.response?.data?.detail ||
            "Unable to load the admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = data?.stats;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  if (loading) {
    return (
      <main className="admin-dashboard">
        <div className="admin-dashboard-loading">
          Loading admin dashboard...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-dashboard">
        <div className="admin-dashboard-error">
          <strong>
            Unable to load dashboard
          </strong>

          <span>{error}</span>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <span className="admin-overline">
            BALOZ ADMIN
          </span>

          <h1>Dashboard</h1>

          <p>
            Monitor users, funds, transactions and
            investments across the platform.
          </p>
        </div>
      </header>

      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <Users size={20} />
          </div>

          <span>Total users</span>

          <strong>
            {stats?.total_users ?? 0}
          </strong>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <CircleDollarSign size={20} />
          </div>

          <span>Total wallet balance</span>

          <strong>
            {formatCurrency(
              stats?.total_wallet_balance
            )}
          </strong>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <TrendingUp size={20} />
          </div>

          <span>Active investments</span>

          <strong>
            {stats?.active_investments ?? 0}
          </strong>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">
            <CircleDollarSign size={20} />
          </div>

          <span>Total invested</span>

          <strong>
            {formatCurrency(
              stats?.total_invested
            )}
          </strong>
        </article>
      </section>

      

      <section className="admin-recent-section">
        <div className="admin-section-heading">
          <div>
            <span className="admin-overline">
              ACTIVITY
            </span>

            <h2>
              Recent transactions
            </h2>
          </div>
        </div>

        {data?.recent_transactions?.length ? (
          <div className="admin-transactions-table">
            <div className="admin-table-head">
              <span>User</span>
              <span>Type</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Reference</span>
            </div>

            {data.recent_transactions.map(
              (transaction) => (
                <div
                  className="admin-table-row"
                  key={transaction.reference}
                >
                  <span>
                    {transaction.user?.email}
                  </span>

                  <span>
                    {transaction.type}
                  </span>

                  <span>
                    {formatCurrency(
                      transaction.amount
                    )}
                  </span>

                  <span
                    className={`admin-status admin-status-${transaction.status}`}
                  >
                    {transaction.status}
                  </span>

                  <span>
                    {transaction.reference}
                  </span>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="admin-empty-state">
            No transactions yet.
          </div>
        )}
      </section>
    </main>
  );
}