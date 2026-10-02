import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import "./PrivacyPolicy.css";

export default function PrivacyPolicy() {
  return (
    <main className="baloz-privacy-page">
      <div className="baloz-privacy-container">

        {/* Header */}
        <header className="baloz-privacy-header">
          <Link
            to="/"
            className="baloz-privacy-back"
          >
            <ArrowLeft size={16} />
            <span>Back to Baloz</span>
          </Link>

          <div className="baloz-privacy-brand">
            <div className="baloz-privacy-brand-mark">
              B
            </div>

            <span>Baloz</span>
          </div>
        </header>


        {/* Hero */}
        <section className="baloz-privacy-hero">

          <div className="baloz-privacy-icon">
            <ShieldCheck size={24} />
          </div>

          <span className="baloz-privacy-eyebrow">
            LEGAL
          </span>

          <h1>
            Privacy Policy
          </h1>

          <p>
            Your privacy matters to us. This Privacy Policy
            explains how Baloz collects, uses, stores, and
            protects information when you use our platform
            and services.
          </p>

          <div className="baloz-privacy-updated">
            Last updated: October 2, 2026
          </div>

        </section>


        {/* Content */}
        <article className="baloz-privacy-content">

          <section>
            <h2>1. Introduction</h2>

            <p>
              Baloz ("Baloz", "we", "us", or "our") respects
              your privacy and is committed to protecting the
              personal information you provide when using our
              website, applications, and related services.
            </p>

            <p>
              This Privacy Policy describes the types of
              information we may collect, how we use that
              information, how we protect it, and the choices
              available to you.
            </p>
          </section>


          <section>
            <h2>2. Information We Collect</h2>

            <p>
              Depending on how you use Baloz, we may collect
              information including:
            </p>

            <ul>
              <li>
                Name, username, email address, and phone
                number.
              </li>

              <li>
                Account credentials and authentication
                information.
              </li>

              <li>
                Identity and verification information where
                required for account or compliance purposes.
              </li>

              <li>
                Wallet, transaction, deposit, withdrawal,
                and investment information.
              </li>

              <li>
                Cryptocurrency wallet addresses and related
                transaction information where applicable.
              </li>

              <li>
                Device, browser, IP address, and technical
                information.
              </li>

              <li>
                Communications and information you provide
                when contacting us.
              </li>
            </ul>
          </section>


          <section>
            <h2>3. How We Use Your Information</h2>

            <p>
              We may use collected information to:
            </p>

            <ul>
              <li>
                Create and manage your Baloz account.
              </li>

              <li>
                Provide and maintain our services.
              </li>

              <li>
                Process transactions, deposits,
                withdrawals, and investments.
              </li>

              <li>
                Verify account information and identity where
                applicable.
              </li>

              <li>
                Protect accounts and detect suspicious,
                fraudulent, or unauthorized activity.
              </li>

              <li>
                Communicate with you about your account,
                transactions, and services.
              </li>

              <li>
                Improve the security, functionality, and
                performance of our platform.
              </li>

              <li>
                Meet applicable legal, regulatory, and
                compliance obligations.
              </li>
            </ul>
          </section>


          <section>
            <h2>4. Transaction and Financial Information</h2>

            <p>
              When you use financial features on Baloz, we
              may collect and maintain information relating to
              deposits, withdrawals, investments, wallet
              activity, transaction references, transaction
              status, and related records.
            </p>

            <p>
              This information may be required to provide our
              services, maintain accurate account records,
              protect users, and satisfy applicable legal or
              compliance requirements.
            </p>
          </section>


          <section>
            <h2>5. Identity Verification</h2>

            <p>
              Certain services may require additional
              information to verify your identity or determine
              eligibility to use particular features.
            </p>

            <p>
              Where identity verification is required, we may
              collect information and documents necessary for
              that process. Such information will be handled
              for verification, security, fraud prevention,
              compliance, and related legitimate purposes.
            </p>
          </section>


          <section>
            <h2>6. How We Share Information</h2>

            <p>
              We do not sell your personal information simply
              for the purpose of selling personal data.
            </p>

            <p>
              We may share information when reasonably
              necessary to operate Baloz or comply with
              applicable obligations, including with:
            </p>

            <ul>
              <li>
                Service providers that support our platform.
              </li>

              <li>
                Payment, financial, identity-verification,
                security, or technology providers where
                applicable.
              </li>

              <li>
                Professional advisers where reasonably
                necessary.
              </li>

              <li>
                Government authorities, regulators, courts,
                or law-enforcement bodies when required or
                permitted by applicable law.
              </li>

              <li>
                Other parties where you have provided
                appropriate authorization.
              </li>
            </ul>
          </section>


          <section>
            <h2>7. Data Security</h2>

            <p>
              We use reasonable technical and organizational
              measures designed to protect information from
              unauthorized access, alteration, disclosure,
              misuse, or destruction.
            </p>

            <p>
              However, no internet transmission, electronic
              storage system, or online service can be
              guaranteed to be completely secure. You should
              also take reasonable steps to protect your
              account credentials and devices.
            </p>
          </section>


          <section>
            <h2>8. Data Retention</h2>

            <p>
              We retain information for as long as reasonably
              necessary for the purposes described in this
              Privacy Policy, including providing services,
              maintaining business and transaction records,
              resolving disputes, preventing fraud, and
              complying with applicable legal or regulatory
              requirements.
            </p>
          </section>


          <section>
            <h2>9. Cookies and Technical Information</h2>

            <p>
              Baloz may use cookies, local storage, logs, and
              similar technologies to support authentication,
              security, functionality, preferences, and
              performance.
            </p>

            <p>
              Your browser or device may provide controls for
              managing certain cookies and similar
              technologies. Disabling some technologies may
              affect the functionality of parts of the
              platform.
            </p>
          </section>


          <section>
            <h2>10. Your Responsibilities</h2>

            <p>
              You are responsible for maintaining the
              confidentiality of your login credentials and for
              taking reasonable precautions to protect access
              to your account.
            </p>

            <p>
              If you believe that your account has been
              accessed without authorization, you should
              contact Baloz as soon as possible.
            </p>
          </section>


          <section>
            <h2>11. Your Privacy Choices</h2>

            <p>
              Depending on applicable law, you may have rights
              relating to your personal information, including
              rights to request access, correction, or other
              appropriate action concerning your information.
            </p>

            <p>
              Requests may be subject to identity verification
              and legal or regulatory limitations.
            </p>
          </section>


          <section>
            <h2>12. Children's Privacy</h2>

            <p>
              Baloz services are not intended for individuals
              who are not legally permitted to use the
              applicable services.
            </p>

            <p>
              We do not knowingly collect personal information
              from children where collection is prohibited by
              applicable law.
            </p>
          </section>


          <section>
            <h2>13. Third-Party Services</h2>

            <p>
              Baloz may rely on third-party services to provide
              certain functionality, including hosting,
              communications, payments, security, identity
              verification, analytics, or other infrastructure.
            </p>

            <p>
              Those providers may process information according
              to their own privacy policies and applicable
              agreements.
            </p>
          </section>


          <section>
            <h2>14. Changes to This Privacy Policy</h2>

            <p>
              We may update this Privacy Policy from time to
              time to reflect changes to our services,
              technology, legal requirements, or business
              practices.
            </p>

            <p>
              When changes are made, the updated version will
              be published on this page with a revised "Last
              updated" date.
            </p>
          </section>


          <section>
            <h2>15. Contact Us</h2>

            <p>
              If you have questions, concerns, or requests
              regarding this Privacy Policy or the handling of
              your information, please contact Baloz through
              the official contact channels provided on our
              platform.
            </p>
          </section>

        </article>


        {/* Footer */}
        <footer className="baloz-privacy-footer">
          <div>
            © 2026 Baloz. All rights reserved.
          </div>

          <div className="baloz-privacy-footer-links">
            <Link to="/">
              Home
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