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
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://settlr.dev/#organization",
                name: "Settlr",
                url: "https://settlr.dev",
                logo: {
                  "@type": "ImageObject",
                  url: "https://settlr.dev/icon.svg",
                  width: 512,
                  height: 512,
                },
                description:
                  "Non-custodial stablecoin settlement infrastructure for B2B cannabis distributors. Instant USDC payments on Solana at a 1% flat fee.",
                foundingDate: "2025",
                sameAs: ["https://x.com/settlrp"],
                contactPoint: {
                  "@type": "ContactPoint",
                  email: "adam@settlr.dev",
                  contactType: "sales",
                },
                areaServed: "US",
                knowsAbout: [
                  "stablecoin settlement",
                  "cannabis B2B payments",
                  "USDC",
                  "Solana blockchain",
                  "non-custodial payments",
                  "high-risk merchant processing",
                ],
              },
              {
                "@type": "WebSite",
                "@id": "https://settlr.dev/#website",
                url: "https://settlr.dev",
                name: "Settlr",
                publisher: { "@id": "https://settlr.dev/#organization" },
                potentialAction: {
                  "@type": "SearchAction",
                  target: "https://settlr.dev/help?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "SoftwareApplication",
                name: "Settlr",
                applicationCategory: "FinanceApplication",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  description:
                    "1% flat fee per settlement — no monthly minimums",
                },
                featureList: [
                  "Non-custodial USDC settlement",
                  "Instant on-chain finality on Solana",
                  "Purchase order to invoice workflow",
                  "Automated collection reminders",
                  "LeafLink integration",
                  "BSA/AML compliance receipts",
                ],
              },
            ],
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
