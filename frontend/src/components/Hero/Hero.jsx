import { ArrowRight, BarChart3, ShieldCheck, TrendingUp } from "lucide-react";

import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-background">
        <div className="hero-grid" />
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
      </div>

      <div className="hero-inner">
        {/* Left Content */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            <span>INVEST· BUILD · GROW</span>
          </div>

          <h1 className="hero-title">
            Build your
            <span> financial future</span>
            with Baloz
          </h1>

          <p className="hero-description">
            A modern platform for investing and managing digital
            assets, designed around clarity, control, and long term
            thinking.
          </p>

          <div className="hero-actions">
            <a href="/register" className="hero-primary-button">
              <span>Create account</span>
              <ArrowRight size={17} strokeWidth={2} />
            </a>

            <a href="#how-it-works" className="hero-secondary-button">
              Explore Baloz
            </a>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <ShieldCheck size={15} strokeWidth={1.7} />
              <span>Security-focused</span>
            </div>

            <div className="hero-trust-divider" />

            <div className="hero-trust-item">
              <BarChart3 size={15} strokeWidth={1.7} />
              <span>Built for investors</span>
            </div>

            <div className="hero-trust-divider" />

            <div className="hero-trust-item">
              <TrendingUp size={15} strokeWidth={1.7} />
              <span>Digital assets</span>
            </div>
          </div>
        </div>

        {/* Market Visual */}
        <div className="hero-market">
          <div className="market-window">
            <div className="market-header">
              <div className="market-title-group">
                <div className="market-icon">₿</div>

                <div>
                  <span className="market-label">MARKET OVERVIEW</span>
                  <strong>BTC / USD</strong>
                </div>
              </div>

              <span className="market-status">
                <span />
                LIVE
              </span>
            </div>

            <div className="market-price">
              <strong>$104,821.42</strong>
              <span>+2.84%</span>
            </div>

            <div className="market-chart">
              <div className="chart-grid chart-grid-horizontal" />
              <div className="chart-grid chart-grid-horizontal chart-grid-two" />
              <div className="chart-grid chart-grid-horizontal chart-grid-three" />

              <div className="chart-line">
                <svg
                  viewBox="0 0 700 260"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="chartFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="0.16"
                      />

                      <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    className="chart-area"
                    d="M0,205 C45,190 50,205 85,178 C120,150 135,175 170,158 C205,140 220,152 250,128 C280,105 300,140 330,116 C360,92 375,105 410,82 C445,60 460,92 495,66 C530,40 545,67 580,48 C615,29 650,42 700,16 L700,260 L0,260 Z"
                  />

                  <path
                    className="chart-path"
                    d="M0,205 C45,190 50,205 85,178 C120,150 135,175 170,158 C205,140 220,152 250,128 C280,105 300,140 330,116 C360,92 375,105 410,82 C445,60 460,92 495,66 C530,40 545,67 580,48 C615,29 650,42 700,16"
                  />

                  <circle
                    className="chart-point"
                    cx="700"
                    cy="16"
                    r="5"
                  />

                  <circle
                    className="chart-point-glow"
                    cx="700"
                    cy="16"
                    r="12"
                  />
                </svg>
              </div>

              <div className="chart-axis">
                <span>09:00</span>
                <span>12:00</span>
                <span>15:00</span>
                <span>18:00</span>
                <span>21:00</span>
              </div>
            </div>

            <div className="market-assets">
              <div className="market-asset">
                <div className="asset-left">
                  <span className="asset-symbol bitcoin">₿</span>

                  <div>
                    <strong>Bitcoin</strong>
                    <span>BTC</span>
                  </div>
                </div>

                <div className="asset-right">
                  <strong>$104,821.42</strong>
                  <span>+2.84%</span>
                </div>
              </div>

              <div className="market-asset">
                <div className="asset-left">
                  <span className="asset-symbol ethereum">Ξ</span>

                  <div>
                    <strong>Ethereum</strong>
                    <span>ETH</span>
                  </div>
                </div>

                <div className="asset-right">
                  <strong>$3,842.18</strong>
                  <span>+1.67%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="market-floating-card market-floating-top">
            <span>PORTFOLIO</span>
            <strong>Digital assets</strong>
          </div>

          <div className="market-floating-card market-floating-bottom">
            <span className="floating-dot" />
            <span>Market data</span>
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <span>SCROLL TO EXPLORE</span>
        <span className="hero-scroll-line" />
      </div>
    </section>
  );
}