import { ArrowLeft, Compass, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <main className="not-found-page">
      <div className="not-found-content">

        {/* Brand */}

        <div className="not-found-brand">
          <span className="not-found-brand-mark">
            H
          </span>

          <span className="not-found-brand-name">
            HarvestCoin
          </span>
        </div>


        {/* Icon */}

        <div
          className="not-found-icon"
          aria-hidden="true"
        >
          <Compass size={28} strokeWidth={1.8} />
        </div>


        {/* Error Code */}

        <p className="not-found-code">
          404
        </p>


        {/* Heading */}

        <h1 className="not-found-title">
          Page not found
        </h1>


        {/* Description */}

        <p className="not-found-description">
          The page you're looking for doesn't exist, may have been
          moved, or the address may be incorrect.
        </p>


        {/* Actions */}

        <div className="not-found-actions">

          <button
            type="button"
            className="not-found-primary"
            onClick={handleGoBack}
          >
            <ArrowLeft
              size={17}
              strokeWidth={2}
            />

            <span>
              Go Back
            </span>
          </button>


          <button
            type="button"
            className="not-found-secondary"
            onClick={handleGoHome}
          >
            <Home
              size={17}
              strokeWidth={2}
            />

            <span>
              Back to Home
            </span>
          </button>

        </div>


        {/* Footer */}

        <p className="not-found-footer">
          © {new Date().getFullYear()} HarvestCoin. All rights reserved.
        </p>

      </div>
    </main>
  );
}