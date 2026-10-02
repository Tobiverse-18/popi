import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../../../api/api";

import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/users/login/", {
        email,
        password,
      });

      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      if (!accessToken || !refreshToken) {
        setError(
          "Authentication tokens were not received."
        );
        return;
      }

      localStorage.setItem(
        "access_token",
        accessToken
      );

      localStorage.setItem(
        "refresh_token",
        refreshToken
      );

      const meResponse = await api.get("/users/me/");

      if (meResponse.data?.is_staff !== true) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setError(
          "This account does not have administrator access."
        );

        return;
      }

      navigate("/admin", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      const responseData = error.response?.data;

      setError(
        responseData?.detail ||
          "Unable to sign in. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-background">
        <div className="admin-login-glow admin-login-glow-one" />
        <div className="admin-login-glow admin-login-glow-two" />
      </div>

      <div className="admin-login-container">
        <div className="admin-login-brand">
          <span className="admin-login-brand-mark">
            B
          </span>

          <span>Baloz</span>
        </div>

        <section className="admin-login-panel">
          <div className="admin-login-heading">
            <div className="admin-login-icon">
              <ShieldCheck
                size={22}
                strokeWidth={1.6}
              />
            </div>

            <span className="admin-login-eyebrow">
              ADMINISTRATION
            </span>

            <h1>Admin sign in</h1>

            <p>
              Sign in with an authorized Baloz
              administrator account.
            </p>
          </div>

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          <form
            className="admin-login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="admin-login-field">
              <label htmlFor="admin-email">
                Email address
              </label>

              <input
                id="admin-email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="username"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-password">
                Password
              </label>

              <div className="admin-login-password">
                <LockKeyhole
                  size={17}
                  strokeWidth={1.6}
                />

                <input
                  id="admin-password"
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
                      size={17}
                      strokeWidth={1.6}
                    />
                  ) : (
                    <Eye
                      size={17}
                      strokeWidth={1.6}
                    />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-login-submit"
              disabled={isSubmitting}
            >
              <span>
                {isSubmitting
                  ? "Authenticating..."
                  : "Sign in to admin"}
              </span>

              {!isSubmitting && (
                <ArrowRight
                  size={18}
                  strokeWidth={1.8}
                />
              )}
            </button>
          </form>

          <div className="admin-login-security">
            <ShieldCheck
              size={15}
              strokeWidth={1.6}
            />

            <span>
              Restricted administrative access
            </span>
          </div>
        </section>

        <p className="admin-login-footer">
          Baloz Administration ·{" "}
          {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}