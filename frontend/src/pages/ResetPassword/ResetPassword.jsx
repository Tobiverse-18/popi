import { useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  LoaderCircle,
} from "lucide-react";

import api from "../../api/api";

import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";

import "./ResetPassword.css";


export default function ResetPassword() {
  const { uid, token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [resetSuccessful, setResetSuccessful] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!passwordConfirmation) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    if (!uid || !token) {
      setError(
        "This password reset link is invalid or incomplete."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/users/reset-password/", {
        uid,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      setResetSuccessful(true);
    } catch (error) {
      console.error(
        "Password reset failed:",
        error
      );

      const responseData = error.response?.data;

      if (responseData?.detail) {
        setError(
          Array.isArray(responseData.detail)
            ? responseData.detail.join(" ")
            : responseData.detail
        );
      } else if (responseData) {
        const messages = Object.values(responseData)
          .flat()
          .filter(Boolean);

        setError(
          messages.length > 0
            ? messages.join(" ")
            : "Unable to reset your password. Please try again."
        );
      } else {
        setError(
          "Unable to reset your password right now. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <main className="reset-page">

      <div className="reset-theme">
        <ThemeToggle />
      </div>


      <section className="reset-visual">

        <div className="reset-visual-overlay" />


        <div className="reset-brand">
          <Link
            to="/"
            className="reset-brand-link"
          >
            Baloz
          </Link>
        </div>


        <div className="reset-visual-content">

          <span className="reset-eyebrow">
            ACCOUNT SECURITY
          </span>

          <h1>
            Protect your account.
          </h1>

          <p>
            Create a new password and get back
            to managing your Baloz account with
            confidence.
          </p>


          <div className="reset-security-note">

            <div className="reset-security-line" />

            <span>
              Choose a strong password that you
              don't use anywhere else.
            </span>

          </div>

        </div>


        <div className="reset-visual-footer">

          <span>
            © {new Date().getFullYear()} Baloz
          </span>

          <span>
            Private &amp; Secure
          </span>

        </div>

      </section>


      <section className="reset-form-section">

        <div className="reset-form-wrapper">


          <div className="reset-mobile-brand">

            <Link
              to="/"
              className="reset-brand-link"
            >
              Baloz
            </Link>

          </div>


          {!resetSuccessful ? (

            <>

              <div className="reset-heading">

                <span className="reset-form-eyebrow">
                  NEW PASSWORD
                </span>

                <h2>
                  Create a new password.
                </h2>

                <p>
                  Enter a new password for your
                  Baloz account below.
                </p>

              </div>


              {error && (
                <div className="reset-error">
                  {error}
                </div>
              )}


              <form
                className="reset-form"
                onSubmit={handleSubmit}
                noValidate
              >


                <div className="reset-field">

                  <label htmlFor="reset-password">
                    New password
                  </label>


                  <div
                    className={`reset-input ${
                      error
                        ? "reset-input-error"
                        : ""
                    }`}
                  >

                    <LockKeyhole size={18} />


                    <input
                      id="reset-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(
                          e.target.value
                        );
                        setError("");
                      }}
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />


                    <button
                      type="button"
                      className="reset-password-toggle"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>


                <div className="reset-field">

                  <label htmlFor="reset-password-confirmation">
                    Confirm new password
                  </label>


                  <div
                    className={`reset-input ${
                      error
                        ? "reset-input-error"
                        : ""
                    }`}
                  >

                    <LockKeyhole size={18} />


                    <input
                      id="reset-password-confirmation"
                      type={
                        showPasswordConfirmation
                          ? "text"
                          : "password"
                      }
                      name="password_confirmation"
                      value={passwordConfirmation}
                      onChange={(e) => {
                        setPasswordConfirmation(
                          e.target.value
                        );
                        setError("");
                      }}
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />


                    <button
                      type="button"
                      className="reset-password-toggle"
                      onClick={() =>
                        setShowPasswordConfirmation(
                          !showPasswordConfirmation
                        )
                      }
                      aria-label={
                        showPasswordConfirmation
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPasswordConfirmation ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>


                <div className="reset-password-rule">

                  <Check size={15} />

                  <span>
                    Use at least 8 characters
                  </span>

                </div>


                <button
                  type="submit"
                  className="reset-submit"
                  disabled={isSubmitting}
                >

                  <span>
                    {isSubmitting
                      ? "Updating..."
                      : "Update password"}
                  </span>


                  {isSubmitting ? (
                    <LoaderCircle
                      size={18}
                      className="reset-spinner"
                    />
                  ) : (
                    <ArrowRight size={18} />
                  )}

                </button>

              </form>


              <Link
                to="/login"
                className="reset-back-link"
              >
                <span>
                  Back to login
                </span>
              </Link>

            </>

          ) : (

            <div className="reset-success">

              <div className="reset-success-icon">
                <Check size={25} />
              </div>


              <span className="reset-form-eyebrow">
                PASSWORD UPDATED
              </span>


              <h2>
                You're all set.
              </h2>


              <p>
                Your password has been changed
                successfully. You can now log in
                using your new password.
              </p>


              <button
                type="button"
                className="reset-success-button"
                onClick={() =>
                  navigate("/login", {
                    state: {
                      passwordResetSuccess: true,
                    },
                  })
                }
              >

                <span>
                  Continue to login
                </span>

                <ArrowRight size={18} />

              </button>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}