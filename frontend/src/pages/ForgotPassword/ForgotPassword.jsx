import { useState } from "react";

import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  Mail,
} from "lucide-react";

import api from "../../api/api";

import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";

import "./ForgotPassword.css";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
    ) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post(
        "/users/forgot-password/",
        {
          email: trimmedEmail,
        }
      );

      setSuccessMessage(
        response.data?.detail ||
          "If an account exists for this email, a password reset link has been sent."
      );

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Password reset request failed:",
        error
      );

      const responseData = error.response?.data;

      if (responseData?.detail) {
        setError(
          Array.isArray(responseData.detail)
            ? responseData.detail.join(" ")
            : responseData.detail
        );
      } else {
        setError(
          "Unable to process your request right now. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <main className="forgot-page">
      <div className="forgot-theme">
        <ThemeToggle />
      </div>


      <section className="forgot-visual">
        <div className="forgot-visual-overlay" />

        <div className="forgot-brand">
          <Link
            to="/"
            className="forgot-brand-link"
          >
            Baloz
          </Link>
        </div>


        <div className="forgot-visual-content">
          <span className="forgot-eyebrow">
            ACCOUNT RECOVERY
          </span>

          <h1>
            A fresh start begins here.
          </h1>

          <p>
            Forgot your password? No problem.
            We'll help you securely regain access
            to your Baloz account.
          </p>

          <div className="forgot-security-note">
            <div className="forgot-security-line" />

            <span>
              Your account security remains our
              priority throughout the recovery
              process.
            </span>
          </div>
        </div>


        <div className="forgot-visual-footer">
          <span>
            © {new Date().getFullYear()} Baloz
          </span>

          <span>
            Private &amp; Secure
          </span>
        </div>
      </section>


      <section className="forgot-form-section">
        <div className="forgot-form-wrapper">

          <div className="forgot-mobile-brand">
            <Link
              to="/"
              className="forgot-brand-link"
            >
              Baloz
            </Link>
          </div>


          {!submitted ? (
            <>
              <div className="forgot-heading">
                <span className="forgot-form-eyebrow">
                  RESET ACCESS
                </span>

                <h2>
                  Forgot your password?
                </h2>

                <p>
                  Enter the email address associated
                  with your account and we'll send
                  you a password reset link.
                </p>
              </div>


              {error && (
                <div className="forgot-error">
                  {error}
                </div>
              )}


              <form
                className="forgot-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="forgot-field">
                  <label htmlFor="forgot-email">
                    Email address
                  </label>

                  <div
                    className={`forgot-input ${
                      error
                        ? "forgot-input-error"
                        : ""
                    }`}
                  >
                    <Mail size={18} />

                    <input
                      id="forgot-email"
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>


                <button
                  type="submit"
                  className="forgot-submit"
                  disabled={isSubmitting}
                >
                  <span>
                    {isSubmitting
                      ? "Sending..."
                      : "Send reset link"}
                  </span>

                  {isSubmitting ? (
                    <LoaderCircle
                      size={18}
                      className="forgot-spinner"
                    />
                  ) : (
                    <ArrowRight size={18} />
                  )}
                </button>
              </form>


              <Link
                to="/login"
                className="forgot-back-link"
              >
                <ArrowLeft size={16} />
                <span>
                  Back to login
                </span>
              </Link>
            </>
          ) : (
            <div className="forgot-success">
              <div className="forgot-success-icon">
                <Mail size={24} />
              </div>

              <span className="forgot-form-eyebrow">
                CHECK YOUR EMAIL
              </span>

              <h2>
                Reset link sent.
              </h2>

              <p>
                {successMessage}
              </p>

              <Link
                to="/login"
                className="forgot-success-button"
              >
                <span>
                  Back to login
                </span>

                <ArrowRight size={18} />
              </Link>


              <button
                type="button"
                className="forgot-try-again"
                onClick={() => {
                  setSubmitted(false);
                  setSuccessMessage("");
                  setError("");
                }}
              >
                Try another email
              </button>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}