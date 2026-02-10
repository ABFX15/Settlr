import Link from "next/link";
import { Twitter, Github, Mail } from "lucide-react";
import { SettlrLogoWithIcon } from "@/components/settlr-logo";

interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

const footerLinks: Record<string, FooterLink[]> = {
  product: [
    { href: "/industries/ai-saas", label: "AI/SaaS" },
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
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <SettlrLogoWithIcon size="sm" variant="light" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Non-custodial crypto payment processor. Accept any token, receive
              USDC instantly. Built on Solana.
            </p>
            <div className="mt-6 flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Product</h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Developers
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {footerLinks.developers.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Settlr. Built on Solana.
          </p>
          <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
