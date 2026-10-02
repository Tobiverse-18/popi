import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import api from "../../../api/api";

import "./AdminInvestmentPlans.css";

export default function AdminInvestmentPlans() {
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emptyForm = {
    category: "",
    name: "",
    description: "",
    minimum_amount: "",
    maximum_amount: "",
    duration_days: "",
    return_rate: "",
    status: "draft",
  };

  const [form, setForm] = useState(emptyForm);

  const fetchPlans = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get(
        "/admin-dashboard/investment-plans/"
      );

      const data = response.data;

      setPlans(
        Array.isArray(data)
          ? data
          : data?.results || []
      );
    } catch (err) {
      console.error(
        "Failed to load investment plans:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load investment plans."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get(
        "/investments/categories/"
      );

      const data = response.data;

      setCategories(
        Array.isArray(data)
          ? data
          : data?.results || []
      );
    } catch (err) {
      console.error(
        "Failed to load categories:",
        err
      );
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchCategories();
  }, []);

  const filteredPlans = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return plans.filter((plan) => {
      const matchesSearch =
        !normalizedSearch ||
        plan.name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        plan.category_name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        plan.description
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        plan.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        plan.category_slug === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    plans,
    search,
    statusFilter,
    categoryFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: plans.length,

      active: plans.filter(
        (plan) => plan.status === "active"
      ).length,

      draft: plans.filter(
        (plan) => plan.status === "draft"
      ).length,

      inactive: plans.filter(
        (plan) => plan.status === "inactive"
      ).length,
    };
  }, [plans]);

  const openCreate = () => {
    setEditingPlan(null);

    setForm({
      ...emptyForm,
      category:
        categories.length > 0
          ? String(categories[0].id)
          : "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);

    setForm({
      category: String(plan.category),
      name: plan.name || "",
      description: plan.description || "",
      minimum_amount:
        plan.minimum_amount || "",
      maximum_amount:
        plan.maximum_amount || "",
      duration_days:
        plan.duration_days || "",
      return_rate:
        plan.return_rate ?? "",
      status: plan.status || "draft",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingPlan(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        category: Number(form.category),
        name: form.name.trim(),
        description: form.description.trim(),
        minimum_amount: form.minimum_amount,
        maximum_amount:
          form.maximum_amount === ""
            ? null
            : form.maximum_amount,
        duration_days: Number(
          form.duration_days
        ),
        return_rate:
          form.return_rate === ""
            ? null
            : form.return_rate,
        status: form.status,
      };

      if (editingPlan) {
        await api.patch(
          `/admin-dashboard/investment-plans/${editingPlan.id}/`,
          payload
        );

        setSuccess(
          "Investment plan updated successfully."
        );
      } else {
        await api.post(
          "/admin-dashboard/investment-plans/",
          payload
        );

        setSuccess(
          "Investment plan created successfully."
        );
      }

      await fetchPlans();

      setTimeout(() => {
        setShowModal(false);
        setEditingPlan(null);
        setForm(emptyForm);
        setSuccess("");
      }, 700);
    } catch (err) {
      console.error(
        "Failed to save investment plan:",
        err
      );

      const data = err.response?.data;

      if (data && typeof data === "object") {
        const firstError = Object.values(data)
          .flat()
          .find(Boolean);

        setError(
          firstError ||
            "Unable to save investment plan."
        );
      } else {
        setError(
          "Unable to save investment plan."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (
    amount,
    currency = "USD"
  ) => {
    if (
      amount === null ||
      amount === undefined ||
      amount === ""
    ) {
      return "—";
    }

    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
      }
    ).format(Number(amount));
  };

  const formatReturn = (rate) => {
    if (
      rate === null ||
      rate === undefined ||
      rate === ""
    ) {
      return "—";
    }

    return `${Number(rate).toFixed(2)}%`;
  };

  const formatStatus = (status) => {
    if (status === "active") {
      return "Active";
    }

    if (status === "inactive") {
      return "Inactive";
    }

    return "Draft";
  };

  return (
    <div className="admin-investment-plans">

      <section className="admin-investment-plans-header">
        <div>
          <span className="admin-investment-plans-eyebrow">
            INVESTMENT MANAGEMENT
          </span>

          <h1>Investment Plans</h1>

          <p>
            Create and manage the plans available
            to customers on the Baloz platform.
          </p>
        </div>

        <div className="admin-investment-plans-header-actions">
          <button
            type="button"
            className="admin-investment-plans-refresh"
            onClick={() => fetchPlans(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "admin-investment-plans-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            className="admin-investment-plans-create"
            onClick={openCreate}
          >
            <Plus size={17} />
            Create plan
          </button>
        </div>
      </section>

      <section className="admin-investment-plans-stats">

        <div className="admin-investment-plan-stat">
          <div className="admin-investment-plan-stat-icon">
            <TrendingUp size={18} />
          </div>

          <div>
            <span>Total plans</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="admin-investment-plan-stat">
          <div className="admin-investment-plan-stat-icon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>Active</span>
            <strong>{stats.active}</strong>
          </div>
        </div>

        <div className="admin-investment-plan-stat">
          <div className="admin-investment-plan-stat-icon">
            <Clock3 size={18} />
          </div>

          <div>
            <span>Drafts</span>
            <strong>{stats.draft}</strong>
          </div>
        </div>

        <div className="admin-investment-plan-stat">
          <div className="admin-investment-plan-stat-icon">
            <XCircle size={18} />
          </div>

          <div>
            <span>Inactive</span>
            <strong>{stats.inactive}</strong>
          </div>
        </div>

      </section>

      <section className="admin-investment-plans-toolbar">

        <div className="admin-investment-plans-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search plans or categories..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="all">
            All statuses
          </option>

          <option value="active">
            Active
          </option>

          <option value="draft">
            Draft
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(event.target.value)
          }
        >
          <option value="all">
            All categories
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.slug}
            >
              {category.name}
            </option>
          ))}
        </select>

      </section>

      {error && (
        <div
          className="admin-investment-plans-alert error"
          role="alert"
        >
          {error}
        </div>
      )}

      <section className="admin-investment-plans-table-wrap">

        {loading ? (
          <div className="admin-investment-plans-state">
            <RefreshCw
              size={22}
              className="admin-investment-plans-spin"
            />

            <p>
              Loading investment plans...
            </p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="admin-investment-plans-state">
            <TrendingUp size={30} />

            <strong>
              No investment plans found
            </strong>

            <p>
              Create your first investment plan
              to make it available to customers.
            </p>
          </div>
        ) : (
          <div className="admin-investment-plans-table-scroll">

            <table className="admin-investment-plans-table">

              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Category</th>
                  <th>Investment range</th>
                  <th>Duration</th>
                  <th>Return</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredPlans.map((plan) => (
                  <tr key={plan.id}>

                    <td>
                      <div className="admin-investment-plan-name">
                        <div className="admin-investment-plan-name-icon">
                          <DollarSign size={17} />
                        </div>

                        <div>
                          <strong>
                            {plan.name}
                          </strong>

                          <span>
                            {plan.currency}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="admin-investment-plan-category">
                        {plan.category_name}
                      </span>
                    </td>

                    <td>
                      <div className="admin-investment-plan-range">
                        <strong>
                          {formatMoney(
                            plan.minimum_amount,
                            plan.currency
                          )}
                        </strong>

                        <span>
                          to{" "}
                          {plan.maximum_amount
                            ? formatMoney(
                                plan.maximum_amount,
                                plan.currency
                              )
                            : "No limit"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-investment-plan-duration">
                        <CalendarDays size={15} />

                        {plan.duration_days} days
                      </div>
                    </td>

                    <td>
                      <strong className="admin-investment-plan-return">
                        {formatReturn(
                          plan.return_rate
                        )}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`admin-investment-plan-status ${plan.status}`}
                      >
                        <span />

                        {formatStatus(
                          plan.status
                        )}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-investment-plan-edit"
                        onClick={() =>
                          openEdit(plan)
                        }
                      >
                        <Edit3 size={15} />
                        Edit
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </section>

      {showModal && (
        <div
          className="admin-investment-plan-modal-backdrop"
          onMouseDown={closeModal}
        >
          <div
            className="admin-investment-plan-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-investment-plan-modal-header">

              <div>
                <span>
                  {editingPlan
                    ? "EDIT PLAN"
                    : "NEW PLAN"}
                </span>

                <h2>
                  {editingPlan
                    ? "Edit investment plan"
                    : "Create investment plan"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="admin-investment-plan-form"
              onSubmit={handleSubmit}
            >

              <label>
                Category

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Plan name

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Bitcoin Growth Plan"
                  required
                />
              </label>

              <label>
                Description

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the investment plan..."
                  rows="4"
                />
              </label>

              <div className="admin-investment-plan-form-grid">

                <label>
                  Minimum amount

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    name="minimum_amount"
                    value={form.minimum_amount}
                    onChange={handleChange}
                    placeholder="100"
                    required
                  />
                </label>

                <label>
                  Maximum amount

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    name="maximum_amount"
                    value={form.maximum_amount}
                    onChange={handleChange}
                    placeholder="10000"
                  />
                </label>

                <label>
                  Duration

                  <input
                    type="number"
                    min="1"
                    name="duration_days"
                    value={form.duration_days}
                    onChange={handleChange}
                    placeholder="30"
                    required
                  />
                </label>

                <label>
                  Expected return (%)

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="return_rate"
                    value={form.return_rate}
                    onChange={handleChange}
                    placeholder="5"
                  />
                </label>

              </div>

              <label>
                Status

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </label>

              {error && (
                <div className="admin-investment-plan-form-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="admin-investment-plan-form-success">
                  {success}
                </div>
              )}

              <div className="admin-investment-plan-form-actions">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="admin-investment-plan-cancel"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="admin-investment-plan-save"
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="admin-investment-plans-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      {editingPlan
                        ? "Save changes"
                        : "Create plan"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}