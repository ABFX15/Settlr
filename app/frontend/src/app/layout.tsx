import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Settlr | The Payment Stack for AI and SaaS",
    template: "%s | Settlr",
  },
  description:
    "The payment stack for global-first AI and SaaS companies. Accept USDC with no wallets, zero gas fees, and private payments. One React component. Built on Solana.",
  keywords: [
    "crypto payment processor",
    "crypto payment gateway",
    "accept crypto payments",
    "non-custodial payments",
    "USDC payment processor",
    "Solana payments",
    "stablecoin payments",
    "crypto checkout",
    "embedded wallets",
    "gasless transactions",
    "instant crypto payments",
    "BitPay alternative",
    "Coinbase Commerce alternative",
    "merchant crypto payments",
    "web3 payments",
    "crypto payment SDK",
    "accept USDC",
    "crypto payment API",
    "blockchain payment gateway",
    "no-code crypto payments",
    "freelancer payments",
    "international payments",
    "get paid internationally",
    "remote worker payments",
    "cross-border payments",
    "digital dollar payments",
    "alternative to PayPal",
    "receive USDC",
    "LATAM payments",
    "Africa payments",
    "payment links",
    "invoice in crypto",
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
    title: "Settlr | Accept Crypto Without Wallets",
    description:
      "Customers pay with email. You get USDC instantly. Zero gas fees. Private payments. One React component.",
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
    title: "Settlr | Accept Crypto Without Wallets",
    description:
      "Customers pay with email. You get USDC instantly. Zero gas fees. Private payments.",
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
        className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} antialiased`}
        style={{ background: "#050507" }}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
