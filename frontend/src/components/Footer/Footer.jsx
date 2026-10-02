import { Link } from "react-router-dom";

import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* =====================================================
            BRAND
            ===================================================== */}

        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-mark">
              B
            </span>

            <span>
              Baloz
            </span>
          </Link>

          <p className="footer-description">
            A modern platform designed to make digital investing
            and wealth management more accessible.
          </p>
        </div>


        {/* =====================================================
            FOOTER LINKS
            ===================================================== */}

        <div className="footer-links">

          {/* Platform */}

          <div className="footer-column">
            <h3>
              Platform
            </h3>

            <a href="/#how-it-works">
              How it works
            </a>

            <a href="/#features">
              Features
            </a>

            <a href="/#security">
              Security
            </a>

            <a href="/#faq">
              FAQ
            </a>
          </div>


          {/* Account */}

          <div className="footer-column">
            <h3>
              Account
            </h3>

            <Link to="/login">
              Log in
            </Link>

            <Link to="/register">
              Create account
            </Link>
          </div>


          {/* Legal */}

          <div className="footer-column">
            <h3>
              Legal
            </h3>

            <Link to="/privacy-policy">
              Privacy Policy
            </Link>

            <Link to="/terms">
              Terms
            </Link>
          </div>

        </div>
      </div>


      {/* =====================================================
          FOOTER BOTTOM
          ===================================================== */}

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Baloz. All rights reserved.
        </p>
      </div>
    </footer>
  );
}