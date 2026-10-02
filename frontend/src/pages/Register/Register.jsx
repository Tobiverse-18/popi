import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  User,
} from "lucide-react";

import api from "../../api/api";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";

import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    const firstName = formData.first_name.trim();
    const lastName = formData.last_name.trim();
    const email = formData.email.trim();
    const phone = formData.phone_number.trim();

    if (!firstName) {
      newErrors.first_name = "First name is required.";
    }

    if (!lastName) {
      newErrors.last_name = "Last name is required.";
    }

    if (!email) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!phone) {
      newErrors.phone_number = "Phone number is required.";
    } else if (phone.replace(/\D/g, "").length < 10) {
      newErrors.phone_number = "Enter a valid phone number.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Please confirm your password.";
    } else if (
      formData.password !== formData.password_confirmation
    ) {
      newErrors.password_confirmation = "Passwords do not match.";
    }

    if (!acceptedTerms) {
      newErrors.terms = "You must accept the terms and conditions.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");

    console.log("REGISTER BUTTON CLICKED");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const username =
      `${formData.first_name.trim()}${formData.last_name.trim()}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const registrationData = {
      username,
      email: formData.email.trim().toLowerCase(),
      phone_number: formData.phone_number.trim(),
      password: formData.password,
      password_confirmation: formData.password_confirmation,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
    };

    console.log("Registration data:", registrationData);

    try {
      const response = await api.post(
        "/users/register/",
        registrationData
      );

      console.log("Backend response:", response.data);

      navigate("/login", {
        replace: true,
        state: {
          registrationSuccess:
            "Your account has been created successfully. Please log in.",
        },
      });
    } catch (error) {
      console.error("Registration error:", error);

      const responseData = error.response?.data;

      console.log("Backend response:", responseData);

      if (responseData) {
        if (responseData.detail) {
          setServerError(
            Array.isArray(responseData.detail)
              ? responseData.detail.join(" ")
              : responseData.detail
          );
        } else {
          const backendMessages = Object.entries(responseData)
            .map(([field, messages]) => {
              const messageText = Array.isArray(messages)
                ? messages.join(" ")
                : String(messages);

              return `${field}: ${messageText}`;
            })
            .join(" ");

          setServerError(
            backendMessages || "Registration failed. Please try again."
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
    <main className="register-page">
      <div className="register-theme">
        <ThemeToggle />
      </div>

      <section className="register-visual">
        <div className="register-visual-overlay" />

        <div className="register-brand">
          <Link to="/" className="register-brand-link">
            Baloz
          </Link>
        </div>

        <div className="register-visual-content">
          <span className="register-eyebrow">
            BUILD WITH PURPOSE
          </span>

          <h1>Start your journey.</h1>

          <p>
            Create your Baloz account and get access to a
            modern financial platform built around clarity,
            control, and a better digital experience.
          </p>

          <div className="register-benefits">
            <div className="register-benefit">
              <span className="register-benefit-icon">
                <Check size={16} />
              </span>

              <span>Simple and secure account setup</span>
            </div>

            <div className="register-benefit">
              <span className="register-benefit-icon">
                <Check size={16} />
              </span>

              <span>Manage your financial activity in one place</span>
            </div>

            <div className="register-benefit">
              <span className="register-benefit-icon">
                <Check size={16} />
              </span>

              <span>Designed for modern digital finance</span>
            </div>
          </div>
        </div>

        <div className="register-visual-footer">
          <span>© {new Date().getFullYear()} Baloz</span>
          <span>Private &amp; Secure</span>
        </div>
      </section>

      <section className="register-form-section">
        <div className="register-form-wrapper">
          <div className="register-mobile-brand">
            <Link to="/" className="register-brand-link">
              Baloz
            </Link>
          </div>

          <div className="register-heading">
            <span className="register-form-eyebrow">
              CREATE ACCOUNT
            </span>

            <h2>Create your account</h2>

            <p>
              Enter your details below to get started with
              Baloz.
            </p>
          </div>

          {serverError && (
            <div className="register-server-error">
              {serverError}
            </div>
          )}

          <form
            className="register-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="register-name-grid">
              <div className="register-field">
                <label htmlFor="first_name">
                  First name
                </label>

                <div
                  className={`register-input ${
                    errors.first_name
                      ? "register-input-error"
                      : ""
                  }`}
                >
                  <User size={18} />

                  <input
                    id="first_name"
                    type="text"
                    name="first_name"
                    value={formData.first_name || ""}
                    onChange={handleChange}
                    placeholder="John"
                    autoComplete="given-name"
                  />
                </div>

                {errors.first_name && (
                  <span className="register-error">
                    {errors.first_name}
                  </span>
                )}
              </div>

              <div className="register-field">
                <label htmlFor="last_name">
                  Last name
                </label>

                <div
                  className={`register-input ${
                    errors.last_name
                      ? "register-input-error"
                      : ""
                  }`}
                >
                  <User size={18} />

                  <input
                    id="last_name"
                    type="text"
                    name="last_name"
                    value={formData.last_name || ""}
                    onChange={handleChange}
                    placeholder="Doe"
                    autoComplete="family-name"
                  />
                </div>

                {errors.last_name && (
                  <span className="register-error">
                    {errors.last_name}
                  </span>
                )}
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="email">
                Email address
              </label>

              <div
                className={`register-input ${
                  errors.email
                    ? "register-input-error"
                    : ""
                }`}
              >
                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              {errors.email && (
                <span className="register-error">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="register-field">
              <label htmlFor="phone_number">
                Phone number
              </label>

              <div
                className={`register-input ${
                  errors.phone_number
                    ? "register-input-error"
                    : ""
                }`}
              >
                <Phone size={18} />

                <input
                  id="phone_number"
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number || ""}
                  onChange={handleChange}
                  placeholder="Enter your phone numbeer"
                  autoComplete="tel"
                />
              </div>

              {errors.phone_number && (
                <span className="register-error">
                  {errors.phone_number}
                </span>
              )}
            </div>

            <div className="register-field">
              <label htmlFor="password">
                Password
              </label>

              <div
                className={`register-input ${
                  errors.password
                    ? "register-input-error"
                    : ""
                }`}
              >
                <LockKeyhole size={18} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
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

              {errors.password && (
                <span className="register-error">
                  {errors.password}
                </span>
              )}

              <span className="register-hint">
                Use at least 8 characters.
              </span>
            </div>

            <div className="register-field">
              <label htmlFor="password_confirmation">
                Confirm password
              </label>

              <div
                className={`register-input ${
                  errors.password_confirmation
                    ? "register-input-error"
                    : ""
                }`}
              >
                <LockKeyhole size={18} />

                <input
                  id="password_confirmation"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="password_confirmation"
                  value={
                    formData.password_confirmation || ""
                  }
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password_confirmation && (
                <span className="register-error">
                  {errors.password_confirmation}
                </span>
              )}
            </div>

            <label className="register-terms">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) =>
                  setAcceptedTerms(e.target.checked)
                }
              />

              <span className="register-checkmark">
                {acceptedTerms && <Check size={13} />}
              </span>

              <span className="register-terms-text">
                I agree to the{" "}
                <Link to="/terms">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {errors.terms && (
              <span className="register-error register-terms-error">
                {errors.terms}
              </span>
            )}

            <button
              type="submit"
              className="register-submit"
              disabled={isSubmitting}
            >
              <span>
                {isSubmitting
                  ? "Creating account..."
                  : "Create account"}
              </span>

              {!isSubmitting && (
                <ArrowRight size={18} />
              )}
            </button>
          </form>

          <p className="register-login-link">
            Already have an account?{" "}
            <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
