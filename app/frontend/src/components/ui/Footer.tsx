import Link from "next/link";
import { Twitter, Github, Mail } from "lucide-react";
import { SettlrLogoWithIcon } from "@/components/settlr-logo";

const footerLinks = {
  product: [
    { href: "/demo", label: "Demo" },
    { href: "/docs", label: "Documentation" },
    { href: "/pricing", label: "Pricing" },
    { href: "/onboarding", label: "Get Started" },
  ],
  developers: [
    { href: "/docs", label: "Quick Start" },
    { href: "/docs?tab=api", label: "API Reference" },
    {
      href: "https://www.npmjs.com/package/@settlr/sdk",
      label: "npm Package",
      external: true,
    },
    {
      href: "https://github.com/ABFX15/x402-hack-payment",
      label: "GitHub",
      external: true,
    },
  ],
  company: [
    { href: "/help", label: "Support" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "mailto:support@settlr.dev", label: "Contact Us" },
  ],
};

const socialLinks = [
  { href: "https://x.com/SettlrPay", icon: Twitter, label: "Twitter" },
  {
    href: "https://github.com/ABFX15/x402-hack-payment",
    icon: Github,
    label: "GitHub",
  },
  { href: "mailto:support@settlr.dev", icon: Mail, label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-14">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <SettlrLogoWithIcon size="sm" variant="light" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
              Non-custodial crypto payment processor. Accept any token, receive
              USDC instantly. Built on Solana.
            </p>
            <div className="mt-5 flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--card)] hover:text-[var(--text-secondary)]"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Product
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Links */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Developers
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.developers.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] pt-6 md:flex-row">
          <p className="text-xs text-[var(--text-muted)]">
            {new Date().getFullYear()} Settlr. Built on Solana.
          </p>
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/[0.05] px-2.5 py-1 text-xs text-[var(--accent)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
