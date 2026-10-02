import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import ThemeToggle from "../ThemeToggle/ThemeToggle";

import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen((current) => !current);
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={`navbar ${menuOpen ? "menu-is-open" : ""}`}>
      <div className="navbar-inner">

        {/* Brand */}
        <a
          href="#top"
          className="brand"
          onClick={closeMenu}
          aria-label="Baloz home"
        >
          <span className="brand-mark">B</span>
          <span className="brand-name">Baloz</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <a href="#about">About</a>
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#security">Security</a>
          <a href="#faq">FAQ</a>
        </nav>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          <ThemeToggle />

          <a
            href="/login"
            className="nav-login"
          >
            Log in
          </a>

          <a
            href="/register"
            className="nav-register"
          >
            Create account
            <ArrowRight
              size={16}
              strokeWidth={2}
            />
          </a>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-menu-button"
            onClick={toggleMenu}
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
          >
            <span className="menu-icon">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`mobile-menu ${
          menuOpen ? "mobile-menu-open" : ""
        }`}
      >
        <div className="mobile-menu-inner">

          <div className="mobile-nav-links">
            <a href="#about" onClick={closeMenu}>
              <span>01</span>
              <strong>About</strong>
            </a>

            <a
              href="#how-it-works"
              onClick={closeMenu}
            >
              <span>02</span>
              <strong>How it works</strong>
            </a>

            <a
              href="#features"
              onClick={closeMenu}
            >
              <span>03</span>
              <strong>Features</strong>
            </a>

            <a
              href="#security"
              onClick={closeMenu}
            >
              <span>04</span>
              <strong>Security</strong>
            </a>

            <a href="#faq" onClick={closeMenu}>
              <span>05</span>
              <strong>FAQ</strong>
            </a>
          </div>

          <div className="mobile-menu-divider" />

          <div className="mobile-menu-actions">
            <a
              href="/login"
              className="mobile-login"
              onClick={closeMenu}
            >
              Log in
            </a>

            <a
              href="/register"
              className="mobile-register"
              onClick={closeMenu}
            >
              <span>Create account</span>

              <ArrowRight
                size={17}
                strokeWidth={2}
              />
            </a>
          </div>

          <div className="mobile-menu-footer">
            <span>Digital finance, thoughtfully built.</span>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}