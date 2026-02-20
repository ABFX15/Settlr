"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  ShoppingCart,
  Store,
  Blocks,
  MessageSquare,
  Globe,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const integrations = [
  {
    slug: "zapier",
    icon: Zap,
    name: "Zapier Connector",
    tagline: "Connect stablecoin payments to 8,000+ apps",
    description:
      "Trigger USDC payouts from any Zapier workflow. Connect Settlr to your CRM, project management, invoicing, or any of 8,000+ apps — no code required. No payout connectors like this exist yet.",
    color: "#FF4A00",
    highlights: [
      "Trigger payouts from any Zapier event",
      "8,000+ app integrations out of the box",
      "No-code payout automation",
      "First stablecoin payout connector on Zapier",
    ],
  },
  {
    slug: "woocommerce",
    icon: ShoppingCart,
    name: "WooCommerce Plugin",
    tagline: "Stablecoin checkout for 36% of e-commerce",
    description:
      "Add USDC checkout to any WooCommerce store. Customers pay with stablecoins, you receive instant settlement — no chargebacks, no 2.9% card fees. Free via the WordPress plugin directory.",
    color: "#7F54B3",
    highlights: [
      "One-click install from WordPress directory",
      "USDC checkout on any WooCommerce store",
      "No chargebacks, instant settlement",
      "36% of all e-commerce stores supported",
    ],
  },
  {
    slug: "shopify",
    icon: Store,
    name: "Shopify App",
    tagline: "Stablecoin payments where Shopify's native crypto falls short",
    description:
      "Accept USDC payments on Shopify with a native app. Fills the gap that Shopify's built-in Solana integration doesn't cover — subscription billing, gasless checkout, and instant merchant settlement.",
    color: "#95BF47",
    highlights: [
      "Native Shopify app — no custom code",
      "Subscription billing support",
      "Gasless checkout for customers",
      "Instant settlement to your wallet",
    ],
  },
  {
    slug: "bubble",
    icon: Blocks,
    name: "Bubble.io Plugin",
    tagline: "Stablecoin payments for the no-code ecosystem",
    description:
      "Add USDC payments to any Bubble.io app with drag-and-drop. The no-code market has 3M+ apps and zero stablecoin payment plugins. Be the first to offer your users crypto checkout.",
    color: "#3B82F6",
    highlights: [
      "Drag-and-drop integration",
      "No stablecoin competitors in Bubble marketplace",
      "3M+ Bubble apps can use it instantly",
      "Full checkout + payout support",
    ],
  },
  {
    slug: "slack",
    icon: MessageSquare,
    name: "Slack Bot",
    tagline: "Send stablecoin payments from a Slack message",
    description:
      "Type /pay worker@email.com $50 in any Slack channel. Instant USDC payout, no context switching. Perfect for ops teams, finance approvals, and quick contractor payments.",
    color: "#4A154B",
    highlights: [
      "Slash command: /pay email amount",
      "Approval workflows in-channel",
      "Payment receipts as thread replies",
      "Great for distributed teams",
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <main
      className="relative min-h-screen bg-[#050507] text-white antialiased"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Settlr Integrations",
            description:
              "Connect stablecoin payments to your existing tools. Zapier, WooCommerce, Shopify, Bubble.io, and Slack integrations.",
            url: "https://settlr.dev/integrations",
            isPartOf: { "@id": "https://settlr.dev/#organization" },
          }),
        }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative isolate pt-28 pb-20 md:pt-40 md:pb-28">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#3B82F6]/[0.06] blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/[0.1] px-4 py-1.5 text-[13px] text-[#3B82F6] font-medium">
              <Globe className="h-3.5 w-3.5" />
              Integrations
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mx-auto max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight">
              Stablecoin payments,{" "}
              <span className="text-[#3B82F6]">everywhere you work</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/55">
              Connect Settlr to your existing stack. Send and receive USDC from
              the tools you already use — no custom code required for most
              integrations.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Integration cards */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration, i) => {
            const Icon = integration.icon;
            return (
              <Reveal key={integration.slug} delay={i * 0.06}>
                <Link
                  href={`/integrations/${integration.slug}`}
                  className="group relative flex h-full flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div
                      className="inline-flex rounded-xl p-3"
                      style={{ background: `${integration.color}15` }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{ color: integration.color }}
                      />
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-white">
                    {integration.name}
                  </h2>
                  <p
                    className="mt-1 text-sm font-medium"
                    style={{ color: integration.color }}
                  >
                    {integration.tagline}
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-white/40 flex-1">
                    {integration.description}
                  </p>

                  <ul className="mt-6 space-y-2">
                    {integration.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 text-xs text-white/50"
                      >
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                          style={{ color: integration.color }}
                        />
                        {h}
                      </li>
                    ))}
                  </ul>

                  <div
                    className="mt-6 inline-flex items-center gap-1 text-sm font-medium transition-colors group-hover:text-white"
                    style={{ color: integration.color }}
                  >
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Don&apos;t see your platform?
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-5 max-w-md text-base text-white/45">
              Settlr&apos;s TypeScript SDK and REST API work with any stack.
              Build a custom integration in under 30 minutes.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-8 py-4 text-[15px] font-semibold text-white shadow-lg shadow-[#3B82F6]/25 hover:scale-[1.02]"
              >
                View the API docs
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-8 py-4 text-[15px] font-medium text-white/70 hover:bg-white/[0.04]"
              >
                Get started
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
