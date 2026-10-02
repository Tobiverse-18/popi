import { Navigate, Route, Routes } from "react-router-dom";

/* =========================================================
   CUSTOMER PAGES
   ========================================================= */

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
import Terms from "./pages/Terms/Terms";

import Dashboard from "./pages/Dashboard/Dashboard";
import Deposit from "./pages/Deposit/Deposit";
import Withdraw from "./pages/Withdraw/Withdraw";

import Transactions from "./pages/Transactions/Transactions";
import TransactionDetail from "./pages/TransactionDetail/TransactionDetail";

import Investments from "./pages/Investments/Investments";
import InvestmentCategory from "./pages/InvestmentCategory/InvestmentCategory";
import InvestmentPlan from "./pages/InvestmentPlan/InvestmentPlan";
import InvestmentConfirm from "./pages/InvestmentConfirm/InvestmentConfirm";

import ActiveInvestments from "./pages/ActiveInvestments/ActiveInvestments";
import ActiveInvestmentDetail from "./pages/ActiveInvestmentDetail/ActiveInvestmentDetail";

import Settings from "./pages/Settings/Settings";


/* =========================================================
   ADMIN PAGES
   ========================================================= */

import AdminDashboard from "./admin/pages/AdminDashboard/AdminDashboard";
import AdminLogin from "./admin/pages/AdminLogin/AdminLogin";
import AdminLayout from "./admin/components/AdminLayout/AdminLayout";

import AdminUsers from "./admin/pages/AdminUsers/AdminUsers";
import AdminDeposits from "./admin/pages/AdminDeposits/AdminDeposits";
import AdminWithdraw from "./admin/pages/AdminWithdraw/AdminWithdraw";
import AdminInvestments from "./admin/pages/AdminInvestments/AdminInvestments";
import AdminInvestmentPlans from "./admin/pages/AdminInvestmentPlans/AdminInvestmentPlans";


/* =========================================================
   ROUTE GUARDS
   ========================================================= */

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "./components/AdminRoute/AdminRoute";


export default function App() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
          ===================================================== */}

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password/:uid/:token"
        element={<ResetPassword />}
      />

      <Route
        path="/privacy-policy"
        element={<PrivacyPolicy />}
      />

      <Route
        path="/terms"
        element={<Terms />}
      />


      {/* =====================================================
          CUSTOMER PROTECTED ROUTES
          ===================================================== */}

      <Route element={<ProtectedRoute />}>

        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* Wallet */}

        <Route
          path="/deposit"
          element={<Deposit />}
        />

        <Route
          path="/withdraw"
          element={<Withdraw />}
        />


        {/* Transactions */}

        <Route
          path="/transactions"
          element={<Transactions />}
        />

        <Route
          path="/transactions/:reference"
          element={<TransactionDetail />}
        />


        {/* Investments */}

        <Route
          path="/investments"
          element={<Investments />}
        />

        <Route
          path="/investments/:slug"
          element={<InvestmentCategory />}
        />

        <Route
          path="/investments/plan"
          element={<InvestmentPlan />}
        />

        <Route
          path="/investments/confirm"
          element={<InvestmentConfirm />}
        />


        {/* Active Investments */}

        <Route
          path="/active-investments"
          element={<ActiveInvestments />}
        />

        <Route
          path="/active-investments/:reference"
          element={<ActiveInvestmentDetail />}
        />


        {/* Settings */}

        <Route
          path="/settings"
          element={<Settings />}
        />

      </Route>


      {/* =====================================================
          ADMIN LOGIN
          ===================================================== */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />


      {/* =====================================================
          ADMIN PROTECTED ROUTES
          ===================================================== */}

      <Route element={<AdminRoute />}>

        <Route element={<AdminLayout />}>

          {/* Dashboard */}

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />


          {/* Users */}

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />


          {/* Deposits */}

          <Route
            path="/admin/deposits"
            element={<AdminDeposits />}
          />


          {/* Withdrawals */}

          <Route
            path="/admin/withdrawals"
            element={<AdminWithdraw />}
          />


          {/* Investments */}

          <Route
            path="/admin/investments"
            element={<AdminInvestments />}
          />


          {/* Investment Plans */}

          <Route
            path="/admin/investment-plans"
            element={<AdminInvestmentPlans />}
          />

        </Route>

      </Route>


      {/* =====================================================
          FALLBACK
          ===================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}