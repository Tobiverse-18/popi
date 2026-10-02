import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Create your Baloz account and set up your profile in a few straightforward steps.",
    icon: ArrowRight,
  },
  {
    number: "02",
    title: "Verify your identity",
    description:
      "Complete the required verification process so your account can be used securely.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Fund your account",
    description:
      "Add funds to your account using the available funding options on the platform.",
    icon: WalletCards,
  },
  {
    number: "04",
    title: "Manage & track",
    description:
      "Keep an eye on your investments, digital assets, transactions, and account activity.",
    icon: CheckCircle2,
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works-inner">

        {/* Section Header */}
        <div className="how-header">
          <div className="how-eyebrow">
            <span>02</span>
            <span>HOW IT WORKS</span>
          </div>

          <div className="how-heading-wrap">
            <h2>
              From getting started
              <span>to managing your activity.</span>
            </h2>

            <p>
              A straightforward experience designed to keep your
              financial journey clear from the beginning.
            </p>
          </div>
        </div>

        {/* Journey */}
        <div className="how-journey">
          <div className="how-journey-line" />

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                className="how-step"
                key={step.number}
              >
                <div className="how-step-top">
                  <span className="how-step-number">
                    {step.number}
                  </span>

                  <div className="how-step-icon">
                    <Icon size={19} strokeWidth={1.7} />
                  </div>
                </div>

                <div className="how-step-content">
                  <h3>{step.title}</h3>

                  <p>{step.description}</p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="how-bottom">
          <span className="how-bottom-line" />

          <p>
            Your account stays at the center of the experience,
            giving you a clear view of your financial activity
            as you move through the platform.
          </p>
        </div>

      </div>
    </section>
  );
}