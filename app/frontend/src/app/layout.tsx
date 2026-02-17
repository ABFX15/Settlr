import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default:
      "The Payment Stack for Creator Platforms | Settlr — USDC Checkout & Payouts",
    template: "%s | Settlr — Creator Platform Payments",
  },
  description:
    "The payment stack for creator platforms. Stablecoin checkout and payouts — no card network content restrictions, 1% flat, instant settlement. Integrate in 30 minutes.",
  keywords: [
    "creator platform payments",
    "creator payouts",
    "fan subscription payments",
    "adult content payments",
    "high risk merchant account",
    "crypto payment processor",
    "crypto payment gateway",
    "accept crypto payments",
    "non-custodial payments",
    "USDC payment processor",
    "Solana payments",
    "stablecoin payments",
    "stablecoin payouts",
    "crypto checkout",
    "embedded wallets",
    "gasless transactions",
    "instant crypto payments",
    "no content restrictions payments",
    "Stripe alternative for creators",
    "deplatforming proof payments",
    "crypto payment SDK",
    "accept USDC",
    "crypto payment API",
    "creator economy payments",
    "international creator payouts",
    "pay creators by email",
    "fan tipping crypto",
    "subscription billing stablecoin",
    "payment links",
  ],
  authors: [{ name: "Settlr" }],
  creator: "Settlr",
  publisher: "Settlr",
  metadataBase: new URL("https://settlr.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://settlr.dev",
    siteName: "Settlr",
    title: "The Payment Stack for Creator Platforms | Settlr",
    description:
      "Stablecoin checkout and payouts for creator platforms. 1% flat fees, zero gas, instant settlement. No card network content restrictions.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Settlr - Crypto Payments Made Private",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Payment Stack for Creator Platforms | Settlr",
    description:
      "Stablecoin checkout and payouts for creator platforms. 1% flat, zero gas, instant settlement. No content restrictions.",
    images: ["/og-image.png"],
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
    <html lang="en" style={{ background: "#050507" }}>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Mobile viewport with safe area support */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#050507" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

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
        className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} ${inter.variable} antialiased`}
        style={{ background: "#050507" }}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
