import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import api from "../../api/api";

import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";

import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registrationSuccess =
    location.state?.registrationSuccess || "";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    const email = formData.email.trim();

    if (!email) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const loginData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    try {
      const response = await api.post(
        "/users/login/",
        loginData
      );

      console.log("Login response:", response.data);

      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      if (!accessToken || !refreshToken) {
        setServerError(
          "Login was successful, but authentication tokens were not received."
        );

        return;
      }

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      const responseData = error.response?.data;

      if (responseData) {
        if (responseData.detail) {
          setServerError(
            Array.isArray(responseData.detail)
              ? responseData.detail.join(" ")
              : responseData.detail
          );
        } else {
          const backendMessages = Object.entries(
            responseData
          )
            .map(([field, messages]) => {
              const messageText = Array.isArray(messages)
                ? messages.join(" ")
                : String(messages);

              return `${field}: ${messageText}`;
            })
            .join(" ");

          setServerError(
            backendMessages ||
              "Login failed. Please check your details and try again."
          );
        }
      } else {
        setServerError(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-background">
        <div className="login-glow login-glow-one" />
        <div className="login-glow login-glow-two" />
      </div>

      <div className="login-topbar">
        <Link to="/" className="login-brand">
          <span className="login-brand-mark">B</span>
          <span>Baloz</span>
        </Link>

        <ThemeToggle />
      </div>

      <div className="login-layout">
        <section className="login-intro">
          <div className="login-intro-content">
            <span className="login-eyebrow">
              <span />
              BALOZ ACCOUNT
            </span>

            <h1>
              Welcome back.
            </h1>

            <p>
              Access your account and continue managing your
              investments, digital assets, and financial activity
              from one place.
            </p>

            <div className="login-trust-list">
              <div className="login-trust-item">
                <CheckCircle2
                  size={17}
                  strokeWidth={1.7}
                />
                <span>Secure account access</span>
              </div>

              <div className="login-trust-item">
                <CheckCircle2
                  size={17}
                  strokeWidth={1.7}
                />
                <span>
                  Your financial activity in one place
                </span>
              </div>

              <div className="login-trust-item">
                <CheckCircle2
                  size={17}
                  strokeWidth={1.7}
                />
                <span>
                  Built around clarity and control
                </span>
              </div>
            </div>
          </div>

          <div className="login-intro-footer">
            <span>
              Digital finance, thoughtfully built.
            </span>

            <span>
              © {new Date().getFullYear()} Baloz
            </span>
          </div>
        </section>

        <section className="login-form-section">
          <div className="login-form-wrapper">
            <div className="login-form-header">
              <span className="login-form-number">
                01
              </span>

              <div>
                <span className="login-form-label">
                  SIGN IN
                </span>

                <h2>Log in to Baloz</h2>

                <p>
                  Enter your account details to continue.
                </p>
              </div>
            </div>

            {registrationSuccess && (
              <div className="login-success-message">
                {registrationSuccess}
              </div>
            )}

            {serverError && (
              <div className="login-error-message">
                {serverError}
              </div>
            )}

            <form
              className="login-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="login-field">
                <label htmlFor="email">
                  Email address
                </label>

                <div
                  className={`login-input-wrapper ${
                    errors.email
                      ? "login-input-error"
                      : ""
                  }`}
                >
                  <Mail
                    className="login-input-icon"
                    size={18}
                    strokeWidth={1.6}
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {errors.email && (
                  <span className="login-field-error">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="login-field">
                <div className="login-field-header">
                  <label htmlFor="password">
                    Password
                  </label>

                  <Link to="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div
                  className={`login-input-wrapper ${
                    errors.password
                      ? "login-input-error"
                      : ""
                  }`}
                >
                  <LockKeyhole
                    className="login-input-icon"
                    size={18}
                    strokeWidth={1.6}
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                        strokeWidth={1.6}
                      />
                    ) : (
                      <Eye
                        size={18}
                        strokeWidth={1.6}
                      />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <span className="login-field-error">
                    {errors.password}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="login-submit"
                disabled={isSubmitting}
              >
                <span>
                  {isSubmitting
                    ? "Logging in..."
                    : "Log in"}
                </span>

                {!isSubmitting && (
                  <ArrowRight
                    size={18}
                    strokeWidth={1.9}
                  />
                )}
              </button>
            </form>

            <div className="login-divider">
              <span />
              <p>NEW TO BALOZ?</p>
              <span />
            </div>

            <Link
              to="/register"
              className="login-create-account"
            >
              <span>Create your account</span>

              <ArrowRight
                size={17}
                strokeWidth={1.8}
              />
            </Link>

            <p className="login-legal">
              By continuing, you acknowledge that you have
              read and understood the Baloz terms and privacy
              policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}