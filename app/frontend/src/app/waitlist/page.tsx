"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { SettlrLogoWithIcon } from "@/components/settlr-logo";
import { Clock } from "lucide-react";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [useCase, setUseCase] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // 2. Also save to our internal waitlist DB
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

      if (!res.ok) {
        const data = await res.json();
        // If already on waitlist, that's fine - show submitted state
        if (res.status === 409) {
          setSubmitted(true);
          setLoading(false);
          return;
        }
        throw new Error(data.error || "Failed to submit");
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
    <main className="min-h-screen bg-[#FFFFFF] text-[#0C1829]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF]/80 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <SettlrLogoWithIcon size="sm" variant="dark" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/docs"
              className="text-sm text-[#3B4963] hover:text-[#0C1829] transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/demo/store"
              className="px-4 py-2 rounded-lg bg-[#FFFFFF] text-[#0C1829] text-sm font-medium"
            >
              Try Demo
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <section className="pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {submitted ? "You\u2019re on the list" : "Request Early Access"}
            </h1>
            <p className="text-lg text-[#3B4963]">
              {submitted
                ? "We\u2019ll review your application and get back to you shortly."
                : "Settlr is currently invite-only. Tell us about your business and we\u2019ll get you set up."}
            </p>
          </motion.div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1B6B4A]/15 flex items-center justify-center">
                <Clock className="w-8 h-8 text-[#1B6B4A]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Application Received</h2>
              <p className="text-[#3B4963] mb-3">
                Thanks for your interest in Settlr. Our team reviews every
                application and will reach out when your account is ready.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <Link
                  href="/demo/store"
                  className="inline-block px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #1B6B4A 0%, #155939 100%)",
                  }}
                >
                  Try the Demo
                </Link>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#3B4963] hover:bg-[#F9FAFB]"
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
                className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl p-8 space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-[#0C1829] mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E5E7EB] text-[#0C1829] placeholder:text-[#7C8A9E] focus:outline-none focus:border-[#1B6B4A]/50 focus:ring-1 focus:ring-[#1B6B4A]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0C1829] mb-2">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E5E7EB] text-[#0C1829] placeholder:text-[#7C8A9E] focus:outline-none focus:border-[#1B6B4A]/50 focus:ring-1 focus:ring-[#1B6B4A]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0C1829] mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Your company name"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E5E7EB] text-[#0C1829] placeholder:text-[#7C8A9E] focus:outline-none focus:border-[#1B6B4A]/50 focus:ring-1 focus:ring-[#1B6B4A]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0C1829] mb-2">
                    Tell us about your business
                  </label>
                  <textarea
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    placeholder="What do you distribute? How are you currently handling payments? What volume do you process monthly?"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#E5E7EB] text-[#0C1829] placeholder:text-[#7C8A9E] focus:outline-none focus:border-[#1B6B4A]/50 focus:ring-1 focus:ring-[#1B6B4A]/20 resize-none"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-lg text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #1B6B4A 0%, #155939 100%)",
                  }}
                >
                  {loading ? "Submitting..." : "Request Access"}
                </button>

                <p className="text-center text-sm text-[#7C8A9E]">
                  Want to see it first?{" "}
                  <Link
                    href="/demo/store"
                    className="text-[#1B6B4A] hover:underline font-medium"
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
