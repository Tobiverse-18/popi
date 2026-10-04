import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./ServerError.css";

export default function ServerError() {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <main className="server-error-page">
      <div className="server-error-content">

        <div className="server-error-brand">
          <span className="server-error-brand-mark">H</span>
          <span>HarvestCoin</span>
        </div>

        <div className="server-error-icon">
          <AlertTriangle size={28} />
        </div>

        <p className="server-error-code">500</p>

        <h1 className="server-error-title">
          Something went wrong
        </h1>

        <p className="server-error-description">
          We couldn't complete your request right now. This may be a
          temporary problem with the HarvestCoin service. Please try again
          in a moment.
        </p>

        <div className="server-error-actions">

          <button
            type="button"
            className="server-error-primary"
            onClick={handleRetry}
          >
            <RefreshCw size={17} />
            <span>Try Again</span>
          </button>

          <button
            type="button"
            className="server-error-secondary"
            onClick={() => navigate("/")}
          >
            <Home size={17} />
            <span>Back to Home</span>
          </button>

          <button
            type="button"
            className="server-error-back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={17} />
            <span>Go Back</span>
          </button>

        </div>

        <p className="server-error-footer">
          If the problem continues, please try again later.
        </p>

      </div>
    </main>
  );
}