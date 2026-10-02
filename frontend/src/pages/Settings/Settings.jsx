import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../../api/api";

import "./Settings.css";


export default function Settings() {
  const navigate = useNavigate();

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    passwordLoading,
    setPasswordLoading,
  ] = useState(false);

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    passwordSuccess,
    setPasswordSuccess,
  ] = useState("");


  const handleChangePassword = async (
    event
  ) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError(
        "Enter your current password."
      );
      return;
    }

    if (!newPassword) {
      setPasswordError(
        "Enter your new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "Your new password must be at least 8 characters long."
      );
      return;
    }

    if (!confirmPassword) {
      setPasswordError(
        "Confirm your new password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "Your new passwords do not match."
      );
      return;
    }

    if (
      currentPassword === newPassword
    ) {
      setPasswordError(
        "Your new password must be different from your current password."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      await api.post(
        "/users/change-password/",
        {
          current_password:
            currentPassword,
          new_password:
            newPassword,
          confirm_password:
            confirmPassword,
        }
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess(
        "Your password has been changed successfully."
      );
    } catch (error) {
      console.error(
        "Failed to change password:",
        error
      );

      setPasswordError(
        error.response?.data?.detail ||
          "Unable to change your password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    navigate("/login", {
      replace: true,
    });
  };


  return (
    <div className="baloz-settings-page">

      {/* HEADER */}

      <header className="baloz-settings-header">

        <Link
          to="/dashboard"
          className="baloz-settings-back"
        >
          <ArrowLeft size={17} />

          <span>
            Dashboard
          </span>
        </Link>


        <div className="baloz-settings-brand">

          <span className="baloz-settings-brand-mark">
            B
          </span>

          <span>
            Baloz
          </span>

        </div>

      </header>


      {/* CONTENT */}

      <main className="baloz-settings-content">

        <div className="baloz-settings-intro">

          <span className="baloz-settings-overline">
            ACCOUNT
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Manage your account security
            and session.
          </p>

        </div>


        {/* SECURITY */}

        <section className="baloz-settings-section">

          <div className="baloz-settings-section-heading">

            <div className="baloz-settings-section-icon">
              <ShieldCheck size={18} />
            </div>

            <div>

              <h2>
                Security
              </h2>

              <p>
                Keep your Baloz account secure.
              </p>

            </div>

          </div>


          <div className="baloz-settings-panel">

            <div className="baloz-settings-panel-header">

              <div>

                <span className="baloz-settings-label">
                  PASSWORD
                </span>

                <h3>
                  Change password
                </h3>

                <p>
                  Update your account password.
                </p>

              </div>

              <KeyRound size={20} />

            </div>


            <form
              className="baloz-password-form"
              onSubmit={
                handleChangePassword
              }
            >

              {/* CURRENT PASSWORD */}

              <div className="baloz-settings-field">

                <label htmlFor="current-password">
                  Current password
                </label>

                <div className="baloz-password-input">

                  <input
                    id="current-password"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      currentPassword
                    }
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    autoComplete="current-password"
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (current) =>
                          !current
                      )
                    }
                    aria-label={
                      showCurrentPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>


              {/* NEW PASSWORD */}

              <div className="baloz-settings-field">

                <label htmlFor="new-password">
                  New password
                </label>

                <div className="baloz-password-input">

                  <input
                    id="new-password"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      newPassword
                    }
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    placeholder="Enter new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (current) =>
                          !current
                      )
                    }
                    aria-label={
                      showNewPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

                <span className="baloz-settings-hint">
                  Use at least 8 characters.
                </span>

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="baloz-settings-field">

                <label htmlFor="confirm-password">
                  Confirm new password
                </label>

                <div className="baloz-password-input">

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) =>
                          !current
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>


              {/* ERROR */}

              {passwordError && (
                <div className="baloz-settings-message baloz-settings-message-error">
                  {passwordError}
                </div>
              )}


              {/* SUCCESS */}

              {passwordSuccess && (
                <div className="baloz-settings-message baloz-settings-message-success">

                  <CheckCircle2 size={16} />

                  <span>
                    {passwordSuccess}
                  </span>

                </div>
              )}


              {/* SUBMIT */}

              <button
                type="submit"
                className="baloz-settings-primary-button"
                disabled={
                  passwordLoading
                }
              >
                {passwordLoading
                  ? "Updating..."
                  : "Update password"}
              </button>

            </form>

          </div>

        </section>


        {/* ACCOUNT */}

        <section className="baloz-settings-section">

          <div className="baloz-settings-section-heading">

            <div className="baloz-settings-section-icon">
              <LogOut size={18} />
            </div>

            <div>

              <h2>
                Account
              </h2>

              <p>
                Manage your current session.
              </p>

            </div>

          </div>


          <div className="baloz-settings-panel">

            <div className="baloz-settings-account-row">

              <div>

                <h3>
                  Sign out
                </h3>

                <p>
                  Sign out of your Baloz account
                  on this device.
                </p>

              </div>


              <button
                type="button"
                className="baloz-settings-logout-button"
                onClick={
                  handleLogout
                }
              >
                <LogOut size={16} />

                Log out
              </button>

            </div>

          </div>

        </section>


        {/* FOOTER */}

        <footer className="baloz-settings-footer">

          <span>
            Baloz Financial Platform
          </span>

         

        </footer>

      </main>

    </div>
  );
}