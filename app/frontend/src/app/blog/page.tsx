"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { posts } from "./posts";

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

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const featured = sorted[0];
  const rest = sorted.slice(1);

  return (
    <main
      className="relative min-h-screen bg-[#FDFBF7] text-[#0C1829] antialiased"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1B6B4A]/[0.04] blur-[150px]" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#1B6B4A]">
              Blog
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Guides, insights &amp; updates
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[#7C8A9E]">
              Crypto payments, Solana development, stablecoin infrastructure,
              and building global-first products.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured post */}
      {featured && (
        <section className="mx-auto max-w-5xl px-6 pb-12">
          <Reveal>
            <Link
              href={`/blog/${featured.slug}`}
              className="group block overflow-hidden rounded-2xl border border-[#E2DFD5] bg-white/[0.02] transition-colors hover:bg-[#F3F2ED]"
            >
              <div className="p-8 md:p-10">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#1B6B4A]/10 px-3 py-1 text-xs font-semibold text-[#1B6B4A]">
                    Latest
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[#7C8A9E]">
                    <Clock className="h-3 w-3" />
                    {featured.readTime}
                  </span>
                  <span className="text-xs text-[#7C8A9E]">
                    {formatDate(featured.date)}
                  </span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight transition-colors group-hover:text-[#1B6B4A] md:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#7C8A9E]">
                  {featured.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B6B4A] transition-colors group-hover:text-[#60a5fa]">
                    Read article
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {featured.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-[#F3F2ED] px-2 py-0.5 text-[10px] font-medium text-[#7C8A9E]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {/* Post grid */}
      {rest.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-6 md:grid-cols-2">
            {rest.map((post, i) => (
              <Reveal key={post.slug} delay={i * 0.06}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-[#E2DFD5] bg-white/[0.02] p-6 transition-colors hover:bg-[#F3F2ED]"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-[#7C8A9E]">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                    <span className="text-xs text-[#7C8A9E]/70">
                      {formatDate(post.date)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-[#1B6B4A]">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#7C8A9E]">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-[#1B6B4A]">
                      Read more
                      <ArrowRight className="h-3 w-3" />
                    </span>
                    <div className="flex gap-1.5">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-[#F3F2ED] px-1.5 py-0.5 text-[10px] text-[#7C8A9E]/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
