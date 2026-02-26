import Link from "next/link";
import { Twitter, Github, Mail } from "lucide-react";
import { SettlrLogo } from "@/components/settlr-logo";

const footerLinks = {
  product: [
    { href: "/send-payments", label: "Send Payments" },
    { href: "/accept-payments", label: "Accept Payments" },
    { href: "/pricing", label: "Pricing" },
    { href: "/compare", label: "Compare" },
    { href: "/demo", label: "Demo" },
  ],
  developers: [
    { href: "/docs", label: "Documentation" },
    { href: "/docs?tab=api", label: "API Reference" },
    { href: "/integrations", label: "Integrations" },
    { href: "/integrations/shopify", label: "Shopify" },
    { href: "/integrations/woocommerce", label: "WooCommerce" },
    { href: "/integrations/zapier", label: "Zapier" },
    { href: "/integrations/slack", label: "Slack" },
    { href: "/integrations/bubble", label: "Bubble" },
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
    { href: "/industries/cannabis", label: "Cannabis Payments" },
    { href: "/industries/creators", label: "Creator Payouts" },
    { href: "/industries/freelance", label: "Freelance" },
  ],
  company: [
    { href: "/help", label: "Support" },
    { href: "/blog", label: "Blog" },
    { href: "/waitlist", label: "Contact Sales" },
    { href: "/onboarding", label: "Get Started" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "mailto:adam@settlr.dev", label: "Contact Us" },
  ],
};

const socialLinks = [
  { href: "https://x.com/SettlrPay", icon: Twitter, label: "Twitter" },
  {
    href: "https://github.com/ABFX15/x402-hack-payment",
    icon: Github,
    label: "GitHub",
  },
  { href: "mailto:adam@settlr.dev", icon: Mail, label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#E2DFD5] bg-[#FDFBF7]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <SettlrLogo size="sm" variant="dark" />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-[#7C8A9E]">
              Non-custodial payout infrastructure. Pay anyone, anywhere — just
              an email. Built on Solana.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 text-[#7C8A9E] transition-colors hover:bg-[#F3F2ED] hover:text-[#0C1829]"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#0C1829]">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#7C8A9E] transition-colors hover:text-[#0C1829]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#0C1829]">
              Industries
            </h4>
            <ul className="space-y-3">
              {footerLinks.industries.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#7C8A9E] transition-colors hover:text-[#0C1829]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#0C1829]">
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
                      className="text-sm text-[#7C8A9E] transition-colors hover:text-[#0C1829]"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-[#7C8A9E] transition-colors hover:text-[#0C1829]"
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
            <h4 className="mb-4 text-sm font-semibold text-[#0C1829]">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#7C8A9E] transition-colors hover:text-[#0C1829]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E2DFD5] pt-8 md:flex-row">
          <p className="text-sm text-[#7C8A9E]">
            © {new Date().getFullYear()} Settlr. Built on Solana.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#7C8A9E]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1B6B4A]/30 bg-[#1B6B4A]/10 px-2 py-1 text-xs text-[#1B6B4A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1B6B4A]" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
