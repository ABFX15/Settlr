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
    default: "Send USDC to Anyone by Email — Global Payout API | Settlr",
    template: "%s | Settlr — Global Payout API",
  },
  description:
    "Pay contractors and freelancers in 180+ countries — no bank details, no wire fees, no frozen accounts. 1% flat, instant settlement. The Stripe alternative for global payouts.",
  keywords: [
    "international payout API",
    "pay contractors internationally",
    "global payroll alternative",
    "cross-border payments",
    "marketplace payout software",
    "Stripe alternative payouts",
    "pay freelancers globally",
    "USDC payment API",
    "crypto payout platform",
    "send money without bank account",
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
    title: "Send USDC to Anyone by Email — Global Payout API | Settlr",
    description:
      "Tired of $25 wire fees, frozen PayPal accounts, and 5-day settlement? Pay anyone in 180+ countries with just an email. 1% flat, settles in seconds.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Settlr — Pay Anyone, Anywhere, With Just Their Email",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Send USDC to Anyone by Email — Global Payout API | Settlr",
    description:
      "Stop losing 5%+ to PayPal or $25/wire. Pay contractors in 180+ countries instantly. 1% flat. No bank details needed.",
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
