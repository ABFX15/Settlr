import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Fredoka,
  Inter,
  Fraunces,
  JetBrains_Mono,
} from "next/font/google";
import Script from "next/script";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:
      "Settlr — Non-Custodial B2B Stablecoin Settlement for Cannabis & High-Risk Industries",
    template: "%s | Settlr",
  },
  description:
    "Settlr: Non-custodial stablecoin settlement for B2B cannabis and high-risk industries. 1% flat fee, instant finality, and no bank interference. Ever.",
  alternates: { canonical: "/" },
  authors: [{ name: "Settlr" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  creator: "Settlr",
  publisher: "Settlr",
  metadataBase: new URL("https://settlr.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev",
    siteName: "Settlr",
    title:
      "Settlr — Non-Custodial B2B Stablecoin Settlement for Cannabis & High-Risk Industries",
    description:
      "Enterprise payments for the debanked. Non-custodial USDC settlement for high-risk B2B supply chains at 1% flat. No bank interference, ever.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr — Enterprise Payments for the Debanked",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@settlrp",
    title: "Settlr — Non-Custodial Stablecoin Settlement for High-Risk B2B",
    description:
      "Move capital with 100% certainty. Non-custodial USDC settlement for cannabis and high-risk supply chains. 1% flat, no bank interference.",
    images: ["/twitter-image"],
    creator: "@settlrp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these when you have them:
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: "#FFFFFF" }}>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Favicons & app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />

        {/* Mobile viewport with safe area support */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Google Ads Tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17871897491"
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17871897491');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} ${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ background: "#FFFFFF" }}
      >
        <ClientLayout>{children}</ClientLayout>
        {/* SSR-rendered navigation for search engine crawlers (visually hidden) */}
        <nav aria-label="Site navigation" className="sr-only">
          <a href="/">Home</a>
          <a href="/products/payment-links">Payment Links</a>
          <a href="/products/invoices">Invoices</a>
          <a href="/pricing">Pricing</a>
          <a href="/compare">Compare</a>
          <a href="/compare/settlr-vs-cash-armored-cars">
            Settlr vs Cash &amp; Armored Cars
          </a>
          <a href="/compare/settlr-vs-high-risk-merchant-accounts">
            Settlr vs High-Risk Merchant Accounts
          </a>
          <a href="/demo">Demo</a>
          <a href="/learn">Knowledge Hub</a>
          <a href="/docs">Documentation</a>
          <a href="/integrations">Integrations</a>
          <a href="/integrations/shopify">Shopify</a>
          <a href="/integrations/woocommerce">WooCommerce</a>
          <a href="/integrations/zapier">Zapier</a>
          <a href="/integrations/slack">Slack</a>
          <a href="/integrations/bubble">Bubble</a>
          <a href="/industries/cannabis">Cannabis B2B Payments</a>
          <a href="/industries/cannabis-b2b-payments">
            Cannabis B2B Supply Chain Payments
          </a>
          <a href="/industries/adult-content">Adult Content</a>
          <a href="/industries/igaming">iGaming</a>
          <a href="/industries/b2b">B2B Payments</a>
          <a href="/industries/creators">Creator Payouts</a>
          <a href="/industries/ecommerce">E-Commerce</a>
          <a href="/blog">Blog</a>
          <a href="/help">Help Center</a>
          <a href="/waitlist">Apply for the Private Rail</a>
          <a href="/onboarding">Get Started</a>
          <a href="/privacy">Privacy Policy</a>
        </nav>
      </body>
    </html>
  );
}
