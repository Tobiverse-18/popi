import {
  Check,
  Eye,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import "./Security.css";

const securityPoints = [
  "Secure authentication",
  "Identity verification",
  "Controlled account access",
];

const securityFeatures = [
  {
    number: "01",
    title: "Transaction control",
    description:
      "Financial actions are processed through controlled server-side operations designed to keep account activity consistent.",
    icon: LockKeyhole,
  },
  {
    number: "02",
    title: "Activity visibility",
    description:
      "Keep a clear record of important account activity, including transactions and financial movements.",
    icon: Eye,
  },
];

export default function Security() {
  return (
    <section className="security" id="security">
      <div className="security-inner">

        {/* Section Header */}
        <div className="security-header">
          <div className="security-eyebrow">
            <span>04</span>
            <span>SECURITY</span>
          </div>

          <div className="security-heading-wrap">
            <h2>
              Built with security
              <span>at the foundation.</span>
            </h2>

            <p>
              Protecting your account is not an extra feature.
              It is part of how the Baloz experience is designed.
            </p>
          </div>
        </div>

        {/* Main Security Feature */}
        <article className="security-main">

          <div className="security-main-content">
            <div className="security-feature-meta">
              <span>ACCOUNT SECURITY</span>

              <div className="security-icon-large">
                <ShieldCheck
                  size={25}
                  strokeWidth={1.5}
                />
              </div>
            </div>

            <div className="security-main-copy">
              <span className="security-label">
                PROTECTION
              </span>

              <h3>
                Your account is
                <span>designed to stay protected.</span>
              </h3>

              <p>
                Baloz uses authentication, identity verification,
                and controlled access as part of the account
                experience.
              </p>
            </div>

            <div className="security-points">
              {securityPoints.map((point) => (
                <div
                  className="security-point"
                  key={point}
                >
                  <span className="security-check">
                    <Check
                      size={13}
                      strokeWidth={2}
                    />
                  </span>

                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Visual */}
          <div className="security-visual">

            <div className="security-visual-orbit orbit-one" />
            <div className="security-visual-orbit orbit-two" />

            <div className="security-shield">
              <ShieldCheck
                size={58}
                strokeWidth={1.2}
              />
            </div>

            <div className="security-status security-status-top">
              <Fingerprint
                size={16}
                strokeWidth={1.5}
              />

              <div>
                <span>IDENTITY</span>
                <strong>Verified</strong>
              </div>
            </div>

            <div className="security-status security-status-bottom">
              <LockKeyhole
                size={16}
                strokeWidth={1.5}
              />

              <div>
                <span>ACCOUNT</span>
                <strong>Protected</strong>
              </div>
            </div>

          </div>
        </article>

        {/* Supporting Security Features */}
        <div className="security-supporting">
          {securityFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                className="security-support-card"
                key={feature.number}
              >
                <div className="security-support-top">
                  <span>{feature.number}</span>

                  <div className="security-support-icon">
                    <Icon
                      size={19}
                      strokeWidth={1.6}
                    />
                  </div>
                </div>

                <div className="security-support-copy">
                  <h3>{feature.title}</h3>

                  <p>{feature.description}</p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Closing Statement */}
        <div className="security-statement">
          <Fingerprint
            size={23}
            strokeWidth={1.4}
          />

          <div>
            <span>THE BALOZ APPROACH</span>

            <h3>
              Clear systems.
              <span>Controlled access.</span>
            </h3>
          </div>
        </div>

      </div>
    </section>
  );
}