import { useEffect, useState } from "react";
import { useReveal } from "./hooks/useReveal";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SocialProof from "./components/SocialProof";
import Calculator from "./components/Calculator";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import Examples from "./components/Examples";
import FAQ from "./components/FAQ";
import StorePromo from "./components/StorePromo";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import ActivationModal from "./components/ActivationModal";
import { CircuitLines, DotGrid } from "./components/Decor";

function ScrollProgress() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setW(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-1">
      <div
        className="h-full bg-gradient-to-l from-teal-600 via-sky-500 to-orange-400 transition-[width] duration-150"
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

export default function App() {
  useReveal();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Fixed decorative background */}
      <div className="pointer-events-none fixed inset-0 -z-50">
        <DotGrid className="opacity-30" />
        <CircuitLines className="opacity-60" />
      </div>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Calculator />
        <Examples />
        <Pricing />
        <Features />
        <Testimonials />
        <FAQ />
        <StorePromo />
        <CTA />
      </main>
      <Footer />
      <ActivationModal />
    </div>
  );
}
