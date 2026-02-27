import Link from "next/link";
import { Twitter, Github, Mail } from "lucide-react";
import { SettlrLogo } from "@/components/settlr-logo";

const footerLinks = {
  product: [
    { href: "/products/payment-links", label: "Payment Links" },
    { href: "/products/invoices", label: "Invoices" },
    { href: "/demo", label: "Demo" },
    { href: "/vs/stripe-connect", label: "Settlr vs Stripe" },
  ],
  developers: [
    { href: "/docs", label: "Docs" },
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
  industries: [
    { href: "/industries/cannabis", label: "Cannabis & Wholesalers" },
    { href: "/industries/adult-content", label: "Adult Content Platforms" },
  ],
  compliance: [
    { href: "/compliance", label: "2026 Whitepaper" },
    { href: "/compliance#genius-act", label: "GENIUS Act 2025" },
    { href: "/compliance#bsa-aml", label: "BSA/AML Framework" },
    { href: "/compliance#kyb", label: "KYB Process" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
  company: [
    { href: "/help", label: "Support" },
    { href: "/blog", label: "Blog" },
    { href: "/waitlist", label: "Request Access" },
    { href: "mailto:adam@settlr.dev", label: "Contact Us" },
  ],
};

const socialLinks = [
  { href: "https://x.com/settlrp", icon: Twitter, label: "Twitter" },
  {
    href: "https://github.com/ABFX15/x402-hack-payment",
    icon: Github,
    label: "GitHub",
  },
  { href: "mailto:adam@settlr.dev", icon: Mail, label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <SettlrLogo size="sm" variant="dark" />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-[#94A3B8]">
              The settlement layer for restricted commerce. Non-custodial B2B
              stablecoin rails for industries abandoned by traditional finance.
              Built on Solana.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 text-[#94A3B8] transition-colors hover:bg-[#FAFAFA] hover:text-[#0A0F1E]"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#0A0F1E]">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#94A3B8] transition-colors hover:text-[#0A0F1E]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#0A0F1E]">
              Industries
            </h4>
            <ul className="space-y-3">
              {footerLinks.industries.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#94A3B8] transition-colors hover:text-[#0A0F1E]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="mb-4 mt-8 text-sm font-semibold text-[#0A0F1E]">
              Compliance
            </h4>
            <ul className="space-y-3">
              {footerLinks.compliance.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#94A3B8] transition-colors hover:text-[#0A0F1E]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#0A0F1E]">
              Developers
            </h4>
            <ul className="space-y-3">
              {footerLinks.developers.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#94A3B8] transition-colors hover:text-[#0A0F1E]"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-[#94A3B8] transition-colors hover:text-[#0A0F1E]"
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
            <h4 className="mb-4 text-sm font-semibold text-[#0A0F1E]">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#94A3B8] transition-colors hover:text-[#0A0F1E]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E5E7EB] pt-8 md:flex-row">
          <p className="text-sm text-[#94A3B8]">
            © {new Date().getFullYear()} Settlr. Built on Solana.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2 py-1 text-xs text-[#059669]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
