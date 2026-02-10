"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  PrivacyComparison,
  ExplorerPreview,
} from "@/components/ui/PrivacyBadge";
import {
  Play,
  Zap,
  Link as LinkIcon,
  Code2,
  ArrowRight,
  Shield,
  Eye,
  Check,
} from "lucide-react";
import { useState } from "react";

const demoCards = [
  {
    title: "Gaming Tournament Store",
    description:
      "Full e-commerce experience with tournament entries, deposits, and instant USDC checkout.",
    href: "/demo/store",
    icon: Play,
    cta: "Try Demo",
  },
  {
    title: "Quick Checkout",
    description:
      "Skip straight to the checkout flow. See a $10 USDC payment in action.",
    href: "/checkout?amount=10.00&merchant=Arena%20GG&to=DjLFeMQ3E6i5CxERRVbQZbAHP1uF4XspLMYafjz3rSQV&memo=Tournament%20Deposit",
    icon: Zap,
    cta: "Try Checkout",
  },
  {
    title: "Create Payment Link",
    description:
      "Generate a shareable payment link with custom amount and description.",
    href: "/create",
    icon: LinkIcon,
    cta: "Create Link",
  },
  {
    title: "SDK Documentation",
    description:
      "Integrate Settlr into your app with our React, Next.js, or Vue SDK.",
    href: "/docs",
    icon: Code2,
    cta: "View Docs",
  },
];

const features = [
  "No wallet required",
  "Zero gas fees",
  "Instant settlement",
  "Privacy encryption",
];

export default function DemoPage() {
  const [showPrivateExplorer, setShowPrivateExplorer] = useState(true);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="px-4 pb-16 pt-32">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5"
            >
              <span className="text-sm font-medium text-accent">
                Interactive Demo
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-4 text-4xl font-bold text-foreground md:text-6xl text-balance"
            >
              Try Settlr Live
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground"
            >
              Experience gasless USDC payments in action. No wallet required, no
              gas fees.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2"
                >
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Demo Cards */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-4 md:grid-cols-2">
              {demoCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <Link
                      href={card.href}
                      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/30 hover:bg-muted"
                    >
                      <div className="mb-5 inline-flex rounded-xl bg-muted p-3 w-fit group-hover:bg-primary/10">
                        <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                      </div>

                      <h2 className="mb-2 text-lg font-semibold text-foreground">
                        {card.title}
                      </h2>
                      <p className="mb-6 flex-1 text-sm text-muted-foreground">
                        {card.description}
                      </p>

                      <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                        <span>{card.cta}</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="border-t border-border px-4 py-24">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Inco Lightning FHE Encryption
                </span>
              </div>
              <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
                See the Privacy Difference
              </h2>
              <p className="mx-auto max-w-xl text-muted-foreground">
                Compare how a regular payment vs. a private receipt appears on
                Solana Explorer. With FHE encryption, the amount is never
                visible on-chain.
              </p>
            </motion.div>

            {/* Privacy Comparison Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-2xl border border-border bg-card p-8"
            >
              <PrivacyComparison
                publicAmount="5,000,000 (5.00 USDC)"
                privateHandle="340282366920938463463374607431768211456"
                decryptedAmount="5.00 USDC"
              />
            </motion.div>

            {/* Explorer Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 overflow-hidden rounded-2xl border border-border bg-card p-8"
            >
              <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-lg font-semibold text-foreground">
                  {"What you'll see on Solscan"}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPrivateExplorer(false)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      !showPrivateExplorer
                        ? "bg-warning/10 text-warning ring-1 ring-warning/30"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    Public
                  </button>
                  <button
                    onClick={() => setShowPrivateExplorer(true)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      showPrivateExplorer
                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Private (FHE)
                  </button>
                </div>
              </div>

              <ExplorerPreview
                isPrivate={showPrivateExplorer}
                amount="5000000"
                encryptedHandle="0x7a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c"
              />

              {showPrivateExplorer && (
                <div className="mt-6 rounded-xl bg-primary/10 p-4">
                  <p className="text-sm text-primary">
                    <strong>Privacy protected:</strong> The actual amount is
                    encrypted using Inco Lightning&apos;s Fully Homomorphic
                    Encryption. Only the customer and merchant can decrypt it.
                  </p>
                </div>
              )}
              {!showPrivateExplorer && (
                <div className="mt-6 rounded-xl bg-warning/10 p-4">
                  <p className="text-sm text-warning">
                    <strong>Public visibility:</strong> Anyone viewing this
                    transaction on Solana Explorer can see the exact payment
                    amount.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Gasless Info Section */}
        <section className="px-4 pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col items-start gap-6 rounded-2xl border border-accent/20 bg-accent/5 p-8 md:flex-row md:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                <Zap className="h-7 w-7 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-xl font-semibold text-foreground">
                  Powered by Kora Gasless
                </h3>
                <p className="text-muted-foreground">
                  Your customers pay only USDC - no SOL needed for transaction
                  fees. We cover the gas so checkout is seamless.
                </p>
              </div>
              <Link
                href="/docs?tab=quickstart"
                className="group inline-flex items-center gap-2 rounded-xl bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent/90"
              >
                Learn More
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Ready to integrate?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Start accepting gasless USDC payments in minutes with our simple SDK.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/waitlist"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
