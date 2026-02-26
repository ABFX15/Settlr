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
    default: "Settlr — Send USDC to Anyone by Email | Global Payout API",
    template: "%s | Settlr",
  },
  description:
    "Pay contractors and freelancers in 180+ countries — no bank details, no wire fees, no frozen accounts. 1% flat, instant settlement on Solana.",
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
    title: "Settlr — Send USDC to Anyone by Email | Global Payout API",
    description:
      "Pay anyone in 180+ countries with just an email. 1% flat fee, settles in seconds. No wire fees, no frozen accounts.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr — Pay Anyone, Anywhere, With Just Their Email",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr — Send USDC to Anyone by Email | Global Payout API",
    description:
      "Pay contractors in 180+ countries instantly. 1% flat, no bank details needed. The Stripe alternative for payouts.",
    images: ["/twitter-image"],
    creator: "@SettlrPay",
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
    <html lang="en" style={{ background: "#FDFBF7" }}>
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
        <meta name="theme-color" content="#FDFBF7" />
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
        style={{ background: "#FDFBF7" }}
      >
        <ClientLayout>{children}</ClientLayout>
        {/* SSR-rendered navigation for search engine crawlers (visually hidden) */}
        <nav aria-label="Site navigation" className="sr-only">
          <a href="/">Home</a>
          <a href="/send-payments">Send Payments</a>
          <a href="/accept-payments">Accept Payments</a>
          <a href="/pricing">Pricing</a>
          <a href="/compare">Compare</a>
          <a href="/demo">Demo</a>
          <a href="/offramp">Cash Out</a>
          <a href="/vs/stripe-connect">Settlr vs Stripe</a>
          <a href="/docs">Documentation</a>
          <a href="/integrations">Integrations</a>
          <a href="/integrations/shopify">Shopify</a>
          <a href="/integrations/woocommerce">WooCommerce</a>
          <a href="/integrations/zapier">Zapier</a>
          <a href="/integrations/slack">Slack</a>
          <a href="/integrations/bubble">Bubble</a>
          <a href="/industries/freelance">Freelance</a>
          <a href="/industries/creators">Creator Payouts</a>
          <a href="/industries/ecommerce">E-Commerce</a>
          <a href="/industries/b2b">B2B Payments</a>
          <a href="/industries/ai-saas">AI &amp; SaaS</a>
          <a href="/industries/data-labeling">Data Labeling</a>
          <a href="/industries/igaming">iGaming</a>
          <a href="/industries/cannabis">Cannabis</a>
          <a href="/blog">Blog</a>
          <a href="/help">Help Center</a>
          <a href="/waitlist">Contact Sales</a>
          <a href="/onboarding">Get Started</a>
          <a href="/privacy">Privacy Policy</a>
        </nav>
      </body>
    </html>
  );
}
