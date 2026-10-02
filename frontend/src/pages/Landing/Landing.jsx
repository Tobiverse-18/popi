import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import About from "../../components/About/About";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import Features from "../../components/Features/Features";
import Security from "../../components/Security/Security";
import FAQ from "../../components/FAQ/FAQ";
import Footer from "../../components/Footer/Footer";

export default function Landing() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <About />
        <HowItWorks />
        <Features />
        <Security />
        <FAQ />

        {/* Privacy link */}
        <section className="landing-legal">
          <Link to="/privacy-policy">
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}