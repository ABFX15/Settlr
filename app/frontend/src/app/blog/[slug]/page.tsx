"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, User, Tag } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { posts } from "../posts";

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

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <main className="relative min-h-screen bg-[#050507] text-white antialiased">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Post not found</h1>
            <p className="mt-2 text-white/40">
              The blog post you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#3B82F6]"
            >
              <ArrowLeft className="h-4 w-4" /> Back to blog
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen bg-[#050507] text-white antialiased"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      {/* JSON-LD for blog post */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: {
              "@type": "Person",
              name: post.author,
            },
            publisher: {
              "@type": "Organization",
              name: "Settlr",
              url: "https://settlr.dev",
            },
            url: `https://settlr.dev/blog/${post.slug}`,
            keywords: post.tags.join(", "),
          }),
        }}
      />

      <Navbar />

      <article className="relative pt-32 pb-24 md:pt-40">
        <div className="absolute left-1/2 top-32 -z-10 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-[#3B82F6]/[0.03] blur-[120px]" />

        <div className="mx-auto max-w-3xl px-6">
          {/* Back link */}
          <Reveal>
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/60"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All posts
            </Link>
          </Reveal>

          {/* Header */}
          <Reveal delay={0.05}>
            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-white/40">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {post.author}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              {post.title}
            </h1>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-4 text-lg leading-relaxed text-white/50">
              {post.excerpt}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/35"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Divider */}
          <div className="mt-10 mb-10 h-px bg-white/[0.06]" />

          {/* Content */}
          <Reveal delay={0.25}>
            <div
              className="prose-settlr"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </Reveal>

          {/* Bottom CTA */}
          <Reveal delay={0.1}>
            <div className="mt-16 rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
              <h3 className="text-xl font-semibold">
                Ready to start accepting crypto payments?
              </h3>
              <p className="mt-2 text-sm text-white/40">
                Non-custodial, 1% flat fees, instant settlement. Integrate in
                under 30 minutes.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/25 transition-transform hover:scale-[1.02]"
                >
                  Get started free
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-6 py-3 text-sm font-medium text-white/60 transition-colors hover:text-white"
                >
                  Read the docs
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </article>

      <Footer />
    </main>
  );
}
