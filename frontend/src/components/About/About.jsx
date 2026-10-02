import {
  ArrowUpRight,
  BarChart3,
  Bitcoin,
  Wallet,
} from "lucide-react";

import "./About.css";

export default function About() {
  return (
    <section className="about" id="about">
      <div className="about-inner">

        {/* Section Header */}
        <div className="about-header">
          <div className="about-eyebrow">
            <span>01</span>
            <span>ABOUT BALOZ</span>
          </div>

          <div className="about-heading-wrap">
            <h2>
              Financial tools should feel
              <span>clear, not complicated.</span>
            </h2>

          </div>
        </div>

        {/* Core Areas */}
        <div className="about-areas">

          <article className="about-area">
            <div className="about-area-top">
              <span className="about-area-number">01</span>

              <div className="about-area-icon">
                <BarChart3 size={21} strokeWidth={1.6} />
              </div>
            </div>

            <div className="about-area-content">
              <h3>Investing</h3>

              <p>
                Access investment opportunities through a
                structured digital experience designed to keep
                your activity clear and organized.
              </p>
            </div>

            <ArrowUpRight
              className="about-area-arrow"
              size={19}
              strokeWidth={1.7}
            />
          </article>

          <article className="about-area">
            <div className="about-area-top">
              <span className="about-area-number">02</span>

              <div className="about-area-icon">
                <Bitcoin size={21} strokeWidth={1.6} />
              </div>
            </div>

            <div className="about-area-content">
              <h3>Digital assets</h3>

              <p>
                Manage digital assets through a modern platform
                that brings important activity and information
                together.
              </p>
            </div>

            <ArrowUpRight
              className="about-area-arrow"
              size={19}
              strokeWidth={1.7}
            />
          </article>

          <article className="about-area">
            <div className="about-area-top">
              <span className="about-area-number">03</span>

              <div className="about-area-icon">
                <Wallet size={21} strokeWidth={1.6} />
              </div>
            </div>

            <div className="about-area-content">
              <h3>Financial control</h3>

              <p>
                Keep track of your financial activity and
                understand where your money is going with
                greater visibility.
              </p>
            </div>

            <ArrowUpRight
              className="about-area-arrow"
              size={19}
              strokeWidth={1.7}
            />
          </article>

        </div>

        {/* Closing Statement */}
        <div className="about-statement">
          <div className="about-statement-line" />

          <div className="about-statement-content">
            <span>THE BALOZ APPROACH</span>

            <h3>
              Your money should feel
              <span>understandable.</span>
            </h3>

            <p>
              We believe financial technology should give you
              clarity without overwhelming you. Baloz brings
              essential financial tools into one thoughtful
              experience.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}