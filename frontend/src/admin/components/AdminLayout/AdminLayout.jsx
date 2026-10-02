import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import api from "../../../api/api";

import "./AdminLayout.css";

const navigation = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Deposits",
    path: "/admin/deposits",
    icon: ArrowDownToLine,
  },
  {
    label: "Withdrawals",
    path: "/admin/withdrawals",
    icon: ArrowUpFromLine,
  },
  {
    label: "Investments",
    path: "/admin/investments",
    icon: TrendingUp,
  },
  {
    label: "Investment Plans",
    path: "/admin/investment-plans",
    icon: TrendingUp,
  },

];

export default function AdminLayout() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const handleLogout = async () => {
    const refreshToken =
      localStorage.getItem("refresh_token");

    try {
      if (refreshToken) {
        await api.post("/users/logout/", {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error(
        "Admin logout error:",
        error
      );
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      setSidebarOpen(false);

      navigate("/admin/login", {
        replace: true,
      });
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      <button
        type="button"
        className={`admin-mobile-overlay ${
          sidebarOpen
            ? "admin-mobile-overlay-visible"
            : ""
        }`}
        onClick={closeSidebar}
        aria-label="Close admin navigation"
      />

      <aside
        className={`admin-sidebar ${
          sidebarOpen
            ? "admin-sidebar-open"
            : ""
        }`}
      >
        <div className="admin-sidebar-top">
          <div className="admin-brand">
            <span className="admin-brand-mark">
              B
            </span>

            <div>
              <strong>Baloz</strong>

              <span>Administration</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-mobile-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        <div className="admin-nav-label">
          Workspace
        </div>

        <nav className="admin-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `admin-nav-item ${
                    isActive
                      ? "admin-nav-item-active"
                      : ""
                  }`
                }
                onClick={closeSidebar}
              >
                <Icon
                  size={18}
                  strokeWidth={1.7}
                />

                <span>{item.label}</span>

                <ChevronRight
                  className="admin-nav-arrow"
                  size={15}
                  strokeWidth={1.7}
                />
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-account">
            <div className="admin-account-avatar">
              <UserRound
                size={17}
                strokeWidth={1.7}
              />
            </div>

            <div className="admin-account-info">
              <strong>Administrator</strong>

              <span>Staff account</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            <LogOut
              size={17}
              strokeWidth={1.7}
            />

            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-mobile-header">
          <button
            type="button"
            className="admin-menu-button"
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open admin navigation"
          >
            <Menu size={21} />
          </button>

          <div className="admin-mobile-title">
            
            <strong>ADMIN</strong>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}