import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  Hero,
  LogoBar,
  BentoCards,
  SocialProof,
  Features,
  TabSection,
  Pricing,
  Testimonials,
  Steps,
  FAQ,
  CTA,
} from "@/components/landing";

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

      <div className="min-h-screen bg-white text-[#475569]">
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
