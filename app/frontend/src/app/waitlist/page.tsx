"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { SettlrLogoWithIcon } from "@/components/settlr-logo";
import { Clock } from "lucide-react";
import { useWaitlistAccess } from "@/hooks/useWaitlistAccess";
import { useWallet } from "@solana/wallet-adapter-react";

export default function WaitlistPage() {
  const { access } = useWaitlistAccess();
  const { connected, disconnect } = useWallet();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [useCase, setUseCase] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show onboarding link if already approved
  const isApproved = access === "approved";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Send to Web3Forms for email notification
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "916743a4-5ef7-472a-a41b-f4b2f997c489",
          subject: `Settlr Inquiry: ${company || name}`,
          from_name: name,
          email: email,
          company: company || "Not provided",
          use_case: useCase || "Not provided",
          message: `New inquiry from ${name} (${email}).\n\nCompany: ${
            company || "Not provided"
          }\nUse Case: ${useCase || "Not provided"}`,
        }),
      });

      // 2. Also save to our internal waitlist DB (best-effort — email is primary)
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name,
            company: company || undefined,
            useCase: useCase || undefined,
          }),
        });

        if (!res.ok && res.status !== 409) {
          console.warn(
            "Waitlist DB save failed, but email was sent successfully",
          );
        }
      } catch (dbErr) {
        console.warn("Waitlist DB save failed:", dbErr);
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Form submission error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }

    setLoading(false);
  };

  return (
    <main
      className="min-h-screen relative text-white"
      style={{ color: "white" }}
    >
      {/* Blockchain background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/blockchain.png"
          alt="Abstract blockchain network visualization"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <SettlrLogoWithIcon size="sm" variant="light" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/docs"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/demo/store"
              className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
            >
              Try Demo
            </Link>
            {connected && (
              <button
                onClick={() => disconnect()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e74c3c]/20 text-[#e74c3c]/70 text-sm font-medium hover:bg-[#e74c3c]/30 transition-colors"
              >
                Disconnect
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <section className="relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 !text-white">
              {submitted ? "You\u2019re on the list" : "Request Early Access"}
            </h1>
            <p className="text-lg text-white/70">
              {submitted
                ? "We\u2019ll review your application and get back to you shortly."
                : "Settlr is currently invite-only. Tell us about your business and we\u2019ll get you set up."}
            </p>
          </motion.div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#34c759]/30 flex items-center justify-center">
                <Clock className="w-8 h-8 text-[#4ADE80]" />
              </div>
              <h2 className="text-2xl font-bold mb-2 !text-white">
                Application Received
              </h2>
              <p className="text-white/70 mb-3">
                Thanks for your interest in Settlr. Our team reviews every
                application and will reach out when your account is ready.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <Link
                  href="/demo/store"
                  className="inline-block px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
                  }}
                >
                  Try the Demo
                </Link>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 rounded-lg border border-white/20 text-sm font-medium text-white/80 hover:bg-white/10"
                >
                  Back to Home
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSubmit}
                className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-8 space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:border-[#34c759]/70 focus:ring-1 focus:ring-[#34c759]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:border-[#34c759]/70 focus:ring-1 focus:ring-[#34c759]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Your company name"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:border-[#34c759]/70 focus:ring-1 focus:ring-[#34c759]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tell us about your business
                  </label>
                  <textarea
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    placeholder="What do you distribute? How are you currently handling payments? What volume do you process monthly?"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:border-[#34c759]/70 focus:ring-1 focus:ring-[#34c759]/30 resize-none"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-[#e74c3c]/20 border border-[#e74c3c]/30 px-4 py-3 text-sm text-[#e74c3c]/70">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-lg text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #34c759 0%, #2ba048 100%)",
                  }}
                >
                  {loading ? "Submitting..." : "Request Access"}
                </button>

                <p className="text-center text-sm text-white/50">
                  Want to see it first?{" "}
                  <Link
                    href="/demo/store"
                    className="text-[#4ADE80] hover:underline font-medium"
                  >
                    Try the live demo
                  </Link>
                </p>
              </motion.form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
