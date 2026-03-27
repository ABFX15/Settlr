import dynamic from "next/dynamic";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Hero, LogoBar, BentoCards } from "@/components/landing";

/* Below-fold sections — lazy loaded to reduce initial JS bundle */
const SocialProof = dynamic(() =>
  import("@/components/landing/SocialProof").then((m) => ({
    default: m.SocialProof,
  })),
);
const Features = dynamic(() =>
  import("@/components/landing/Features").then((m) => ({
    default: m.Features,
  })),
);
const TabSection = dynamic(() =>
  import("@/components/landing/TabSection").then((m) => ({
    default: m.TabSection,
  })),
);
const Pricing = dynamic(() =>
  import("@/components/landing/Pricing").then((m) => ({
    default: m.Pricing,
  })),
);
const Testimonials = dynamic(() =>
  import("@/components/landing/Testimonials").then((m) => ({
    default: m.Testimonials,
  })),
);
const Steps = dynamic(() =>
  import("@/components/landing/Steps").then((m) => ({
    default: m.Steps,
  })),
);
const FAQ = dynamic(() =>
  import("@/components/landing/FAQ").then((m) => ({ default: m.FAQ })),
);
const CTA = dynamic(() =>
  import("@/components/landing/CTA").then((m) => ({ default: m.CTA })),
);

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Settlr",
            url: "https://settlr.dev",
            logo: "https://settlr.dev/icon.svg",
            description:
              "Non-custodial stablecoin settlement for B2B cannabis distributors at 1% flat fee.",
          }),
        }}
      />

      <div
        className="min-h-screen bg-white text-[#6B7280]"
        style={{
          fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        }}
      >
        <Navbar />
        <Hero />
        <LogoBar />
        <BentoCards />
        <SocialProof />
        <Features />
        <TabSection />
        <Pricing />
        <Testimonials />
        <Steps />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
