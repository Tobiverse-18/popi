import {
  ArrowUpRight,
  BarChart3,
  Bitcoin,
  CircleDollarSign,
  History,
  Wallet,
} from "lucide-react";

import "./Features.css";

const supportingFeatures = [
  {
    icon: Bitcoin,
    title: "Digital assets",
    description:
      "Manage supported digital assets through a focused and organized experience.",
  },
  {
    icon: Wallet,
    title: "Wallet & funding",
    description:
      "Keep your account balance and funding activity organized in one place.",
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="features-inner">

        {/* Section Header */}
        <div className="features-header">
          <div className="features-eyebrow">
            <span>03</span>
            <span>FEATURES</span>
          </div>

          <div className="features-heading-wrap">
            <h2>
              Everything you need.
              <span>Nothing you don't.</span>
            </h2>

            <p>
              Baloz brings the important parts of your financial
              activity into one focused experience.
            </p>
          </div>
        </div>

        {/* Main Feature */}
        <article className="features-main">

          <div className="features-main-content">
            <div className="features-feature-meta">
              <span>01</span>
              <div className="features-feature-icon">
                <BarChart3 size={20} strokeWidth={1.6} />
              </div>
            </div>

            <div className="features-main-text">
              <span className="features-label">
                INVESTMENTS
              </span>

              <h3>
                A clearer way to
                <span>manage investments.</span>
              </h3>

              <p>
                Explore and manage investment opportunities through
                a structured digital experience designed to keep
                your financial activity easy to understand.
              </p>
            </div>

            <a href="/register" className="features-main-link">
              <span>Get started</span>
              <ArrowUpRight size={18} strokeWidth={1.8} />
            </a>
          </div>

          {/* Portfolio Visual */}
          <div className="features-portfolio">

            <div className="portfolio-header">
              <div>
                <span>PORTFOLIO</span>
                <strong>Overview</strong>
              </div>

              <CircleDollarSign
                size={19}
                strokeWidth={1.5}
              />
            </div>

            <div className="portfolio-balance">
              <span>Total balance</span>
              <strong>$24,860.00</strong>
            </div>

            <div className="portfolio-chart">
              <div className="portfolio-grid-line line-one" />
              <div className="portfolio-grid-line line-two" />
              <div className="portfolio-grid-line line-three" />

              <svg
                viewBox="0 0 600 220"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="portfolioFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="currentColor"
                      stopOpacity="0.13"
                    />

                    <stop
                      offset="100%"
                      stopColor="currentColor"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  className="portfolio-area"
                  d="M0,180 C45,168 65,175 100,150 C135,125 150,142 185,132 C220,122 240,138 275,105 C310,72 325,100 355,83 C385,66 405,78 440,55 C475,32 500,48 530,35 C560,22 575,29 600,12 L600,220 L0,220 Z"
                />

                <path
                  className="portfolio-path"
                  d="M0,180 C45,168 65,175 100,150 C135,125 150,142 185,132 C220,122 240,138 275,105 C310,72 325,100 355,83 C385,66 405,78 440,55 C475,32 500,48 530,35 C560,22 575,29 600,12"
                />

                <circle
                  className="portfolio-point"
                  cx="600"
                  cy="12"
                  r="4"
                />
              </svg>
            </div>

            <div className="portfolio-footer">
              <span>Current allocation</span>

              <div className="portfolio-allocation">
                <span />
                <span />
                <span />
              </div>
            </div>

          </div>
        </article>

        {/* Supporting Features */}
        <div className="features-supporting">

          {supportingFeatures.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                className="features-support-card"
                key={feature.title}
              >
                <div className="features-support-top">
                  <span>
                    0{index + 2}
                  </span>

                  <div className="features-support-icon">
                    <Icon size={20} strokeWidth={1.6} />
                  </div>

                  <ArrowUpRight
                    className="features-support-arrow"
                    size={18}
                    strokeWidth={1.7}
                  />
                </div>

                <div>
                  <span className="features-label">
                    {feature.title.toUpperCase()}
                  </span>

                  <h3>{feature.title}</h3>

                  <p>{feature.description}</p>
                </div>
              </article>
            );
          })}

        </div>

        {/* Activity Feature */}
        <article className="features-activity">

          <div className="features-activity-content">
            <div className="features-feature-meta">
              <span>04</span>

              <div className="features-feature-icon">
                <History size={20} strokeWidth={1.6} />
              </div>
            </div>

            <div>
              <span className="features-label">
                ACTIVITY &amp; TRANSACTIONS
              </span>

              <h3>
                Know what is happening
                <span>with your account.</span>
              </h3>

              <p>
                Keep a clear record of deposits, withdrawals,
                investments, and other financial activity.
              </p>
            </div>
          </div>

          <div className="features-activity-list">

            <div className="activity-row">
              <div>
                <span className="activity-dot" />
                <div>
                  <strong>Investment</strong>
                  <span>Account activity</span>
                </div>
              </div>

              <strong>Completed</strong>
            </div>

            <div className="activity-row">
              <div>
                <span className="activity-dot" />
                <div>
                  <strong>Account funding</strong>
                  <span>Wallet activity</span>
                </div>
              </div>

              <strong>Completed</strong>
            </div>

            <div className="activity-row">
              <div>
                <span className="activity-dot" />
                <div>
                  <strong>Transaction</strong>
                  <span>Recent activity</span>
                </div>
              </div>

              <strong>Recorded</strong>
            </div>

          </div>
        </article>

      </div>
    </section>
  );
}