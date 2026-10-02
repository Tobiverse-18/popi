import { Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
} from "lucide-react";

import "./Terms.css";

export default function Terms() {
  return (
    <main className="baloz-terms-page">
      <div className="baloz-terms-container">

        {/* Header */}

        <header className="baloz-terms-header">
          <Link
            to="/"
            className="baloz-terms-back"
          >
            <ArrowLeft size={16} />
            <span>Back to Baloz</span>
          </Link>

          <Link
            to="/"
            className="baloz-terms-brand"
          >
            <span className="baloz-terms-brand-mark">
              B
            </span>

            <span>
              Baloz
            </span>
          </Link>
        </header>


        {/* Hero */}

        <section className="baloz-terms-hero">

          <div className="baloz-terms-icon">
            <FileText size={24} />
          </div>

          <span className="baloz-terms-eyebrow">
            LEGAL
          </span>

          <h1>
            Terms of Service
          </h1>

          <p>
            These Terms of Service govern your access to and
            use of the Baloz platform and the services made
            available through it.
          </p>

          <div className="baloz-terms-updated">
            Last updated: October 2, 2026
          </div>

        </section>


        {/* Content */}

        <article className="baloz-terms-content">

          <section>
            <h2>1. Acceptance of These Terms</h2>

            <p>
              By creating an account, accessing, or using Baloz,
              you agree to be bound by these Terms of Service
              and any applicable policies referenced by them.
            </p>

            <p>
              If you do not agree with these Terms, you should
              not access or use the Baloz platform.
            </p>
          </section>


          <section>
            <h2>2. About Baloz</h2>

            <p>
              Baloz is a digital platform that provides
              technology and financial-service-related
              functionality through its website and applications.
            </p>

            <p>
              The specific services and features available to
              you may depend on your location, account status,
              verification status, applicable requirements,
              and the services currently offered by Baloz.
            </p>
          </section>


          <section>
            <h2>3. Eligibility</h2>

            <p>
              You may only use Baloz if you are legally permitted
              to enter into an agreement and use the services
              available in your jurisdiction.
            </p>

            <p>
              Certain products or features may have additional
              eligibility requirements. Baloz may restrict or
              refuse access to services where required by
              applicable law, regulation, or internal
              compliance requirements.
            </p>
          </section>


          <section>
            <h2>4. Account Registration</h2>

            <p>
              You must provide accurate and complete information
              when creating your Baloz account and keep that
              information reasonably up to date.
            </p>

            <p>
              You are responsible for maintaining the security
              of your account credentials and for activity that
              occurs through your account, except where the
              applicable activity results from circumstances
              outside your reasonable control.
            </p>
          </section>


          <section>
            <h2>5. Identity Verification</h2>

            <p>
              Baloz may require identity verification before
              allowing access to certain services or features.
            </p>

            <p>
              You agree to provide information and documentation
              that is reasonably required for verification,
              security, fraud prevention, or compliance purposes.
            </p>

            <p>
              We may restrict, suspend, or refuse certain
              services where required verification has not been
              completed or where submitted information cannot
              reasonably be verified.
            </p>
          </section>


          <section>
            <h2>6. Wallets and Account Balances</h2>

            <p>
              Where wallet functionality is provided, balances
              displayed within your account represent records
              maintained by Baloz based on transactions processed
              through the platform.
            </p>

            <p>
              You must not attempt to manipulate, falsify, or
              interfere with wallet balances, transaction
              records, payment processes, or other technical
              systems used by Baloz.
            </p>
          </section>


          <section>
            <h2>7. Deposits</h2>

            <p>
              Deposits may be subject to verification and
              processing requirements before funds are credited
              to your account.
            </p>

            <p>
              Baloz may request additional information or
              supporting documentation relating to a deposit
              where reasonably necessary for security,
              verification, fraud prevention, or compliance.
            </p>

            <p>
              A deposit is not considered successfully credited
              until it has been confirmed and recorded in your
              Baloz account.
            </p>
          </section>


          <section>
            <h2>8. Withdrawals</h2>

            <p>
              Withdrawal requests are subject to applicable
              account, balance, security, verification, and
              processing requirements.
            </p>

            <p>
              You are responsible for providing accurate
              withdrawal information, including any destination
              address or account details required for the
              applicable withdrawal method.
            </p>

            <p>
              Once a transaction has been processed or submitted
              to an external network or service, reversal may
              not be possible.
            </p>
          </section>


          <section>
            <h2>9. Investments</h2>

            <p>
              Baloz may make certain investment-related products
              or plans available through the platform.
            </p>

            <p>
              The terms, duration, minimum amount, applicable
              return structure, and other conditions of an
              investment may vary by product and will be
              presented through the platform where applicable.
            </p>

            <p>
              Past performance, displayed rates, projections,
              examples, or expected returns do not constitute a
              guarantee of future results unless expressly stated
              otherwise in a legally binding product document.
            </p>
          </section>


          <section>
            <h2>10. Investment Risk</h2>

            <p>
              Financial and investment activities may involve
              risk. The value or outcome of an investment may
              depend on the applicable product terms and other
              factors.
            </p>

            <p>
              You should carefully review the information
              associated with an investment before committing
              funds and consider obtaining independent financial
              or professional advice where appropriate.
            </p>
          </section>


          <section>
            <h2>11. Cryptocurrency and Digital Assets</h2>

            <p>
              Where Baloz supports cryptocurrency or digital
              asset functionality, such services may involve
              additional risks, including network delays,
              incorrect destination addresses, asset volatility,
              network fees, and irreversible transactions.
            </p>

            <p>
              You are responsible for verifying transaction
              details before submitting a digital-asset
              transaction.
            </p>
          </section>


          <section>
            <h2>12. Prohibited Activities</h2>

            <p>
              You must not use Baloz to engage in unlawful,
              fraudulent, abusive, deceptive, or unauthorized
              activity.
            </p>

            <p>
              Prohibited activity includes, but is not limited
              to:
            </p>

            <ul>
              <li>
                Attempting to gain unauthorized access to the
                platform or another user's account.
              </li>

              <li>
                Manipulating balances, transaction records, or
                platform functionality.
              </li>

              <li>
                Using stolen, fraudulent, or unauthorized
                payment information.
              </li>

              <li>
                Attempting to bypass identity, security, or
                compliance controls.
              </li>

              <li>
                Using the platform for unlawful financial
                activity.
              </li>

              <li>
                Introducing malicious software, code, or other
                harmful activity.
              </li>

              <li>
                Interfering with the availability, integrity, or
                security of Baloz systems.
              </li>
            </ul>
          </section>


          <section>
            <h2>13. Fees</h2>

            <p>
              Certain Baloz services may involve fees. Where
              applicable, relevant fees will be communicated
              through the platform or applicable service terms
              before they become applicable to a transaction.
            </p>
          </section>


          <section>
            <h2>14. Third-Party Services</h2>

            <p>
              Baloz may rely on third-party providers for
              services such as payments, communications, hosting,
              identity verification, security, blockchain
              infrastructure, or other technology.
            </p>

            <p>
              Third-party services may be governed by their own
              terms and policies. Baloz is not responsible for
              matters outside its reasonable control relating to
              independent third-party services.
            </p>
          </section>


          <section>
            <h2>15. Platform Availability</h2>

            <p>
              We aim to maintain reliable access to Baloz but
              do not guarantee that the platform will always be
              available, uninterrupted, or error-free.
            </p>

            <p>
              Services may occasionally be unavailable because
              of maintenance, upgrades, security measures,
              technical failures, network issues, or circumstances
              outside our reasonable control.
            </p>
          </section>


          <section>
            <h2>16. Suspension and Termination</h2>

            <p>
              Baloz may restrict, suspend, or terminate access
              to an account or particular services where
              reasonably necessary to protect users, the
              platform, or comply with applicable obligations.
            </p>

            <p>
              This may include situations involving suspected
              fraud, unauthorized activity, security concerns,
              violations of these Terms, or legal or regulatory
              requirements.
            </p>
          </section>


          <section>
            <h2>17. Intellectual Property</h2>

            <p>
              Unless otherwise stated, the Baloz platform,
              branding, software, designs, text, graphics, and
              other content are owned by or licensed to Baloz
              and are protected by applicable intellectual
              property laws.
            </p>

            <p>
              You may not reproduce, modify, distribute,
              reverse engineer, or commercially exploit Baloz
              materials without appropriate authorization.
            </p>
          </section>


          <section>
            <h2>18. Privacy</h2>

            <p>
              Your use of Baloz is also subject to our Privacy
              Policy, which explains how information may be
              collected, used, stored, and protected.
            </p>

            <p>
              You can read the Privacy Policy here:
            </p>

            <Link
              to="/privacy-policy"
              className="baloz-terms-inline-link"
            >
              View Privacy Policy
            </Link>
          </section>


          <section>
            <h2>19. Disclaimer</h2>

            <p>
              Baloz provides its platform and services subject
              to the applicable terms and conditions of those
              services. Information displayed on the platform
              may change and should not be treated as a
              substitute for independent professional advice.
            </p>

            <p>
              Nothing in these Terms should be interpreted as a
              guarantee of investment performance, financial
              outcome, or future return unless expressly provided
              under applicable product documentation.
            </p>
          </section>


          <section>
            <h2>20. Limitation of Liability</h2>

            <p>
              To the extent permitted by applicable law, Baloz
              will not be responsible for losses resulting from
              circumstances outside its reasonable control,
              including certain network failures, third-party
              service interruptions, unauthorized access caused
              by compromised user credentials, or events beyond
              the reasonable control of Baloz.
            </p>
          </section>


          <section>
            <h2>21. Changes to These Terms</h2>

            <p>
              We may update these Terms from time to time to
              reflect changes to our services, technology,
              business practices, or applicable requirements.
            </p>

            <p>
              Updated Terms will be published on this page and
              will include a revised "Last updated" date.
            </p>
          </section>


          <section>
            <h2>22. Governing Law</h2>

            <p>
              These Terms will be interpreted and applied in
              accordance with the laws applicable to the Baloz
              services and the jurisdiction governing the
              relationship between you and Baloz, subject to any
              mandatory legal requirements that may apply.
            </p>
          </section>


          <section>
            <h2>23. Contact</h2>

            <p>
              If you have questions regarding these Terms or
              your use of Baloz, please contact Baloz through
              the official contact channels provided on the
              platform.
            </p>
          </section>

        </article>


        {/* Footer */}

        <footer className="baloz-terms-footer">

          <div>
            © {new Date().getFullYear()} Baloz.
            All rights reserved.
          </div>

          <div className="baloz-terms-footer-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/privacy-policy">
              Privacy Policy
            </Link>

            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Create account
            </Link>

          </div>

        </footer>

      </div>
    </main>
  );
}