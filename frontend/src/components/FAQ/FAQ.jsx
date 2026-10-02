import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";

import "./FAQ.css";

const faqs = [
  {
    question: "What is Baloz?",
    answer:
      "Baloz is a digital financial platform designed to bring investment management, digital assets, account funding, and financial activity into one organized experience.",
  },
  {
    question: "What can I do on Baloz?",
    answer:
      "Depending on the services available to your account, you can manage your wallet, fund your account, access investment opportunities, manage supported digital assets, and keep track of your financial activity.",
  },
  {
    question: "How do I create an account?",
    answer:
      "Select Create account and complete the registration process with your required account information. You may then be asked to complete identity verification before accessing certain platform features.",
  },
  {
    question: "Is identity verification required?",
    answer:
      "Identity verification may be required before you can access certain services or financial features. The specific requirements will be presented during the account setup or verification process.",
  },
  {
    question: "How can I fund my account?",
    answer:
      "Baloz provides available funding options within the platform. Once a funding method is available for your account, you can follow the instructions provided to complete the process.",
  },
  {
    question: "How do I track my transactions?",
    answer:
      "Your account activity and transaction history are organized within the platform, allowing you to review relevant financial movements and their current status.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex((currentIndex) =>
      currentIndex === index ? null : index
    );
  };

  return (
    <section className="faq" id="faq">
      <div className="faq-inner">

        {/* Section Header */}
        <div className="faq-header">
          <div className="faq-eyebrow">
            <span>05</span>
            <span>FAQ</span>
          </div>

          <div className="faq-heading-wrap">
            <h2>
              Frequently 
              Asked Questions.
            </h2>

          </div>
        </div>

        {/* FAQ List */}
        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                className={`faq-item ${
                  isOpen ? "faq-item-open" : ""
                }`}
                key={faq.question}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                >
                  <div className="faq-question-left">
                    <span className="faq-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="faq-question-text">
                      {faq.question}
                    </span>
                  </div>

                  <span className="faq-plus">
                    <Plus
                      size={19}
                      strokeWidth={1.7}
                    />
                  </span>
                </button>

                <div className="faq-answer">
                  <div className="faq-answer-inner">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="faq-contact">
          <div>
            <span>STILL HAVE QUESTIONS?</span>

            <h3>
              We're here to help.
            </h3>
          </div>

          <a href="mailto:baloz@gmail.com">
            <span>Get in touch</span>

            <ArrowUpRight
              size={18}
              strokeWidth={1.8}
            />
          </a>
        </div>

      </div>
    </section>
  );
}