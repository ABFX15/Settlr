import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Settlr | Non-Custodial Crypto Payments for Web3 Apps",
    template: "%s | Settlr",
  },
  description:
    "Instant crypto payments, directly to your wallet. Non-custodial, no extensions needed. Embedded wallets let customers pay with email. Built on Solana.",
  keywords: [
    "crypto payment solution",
    "non-custodial payments",
    "embedded wallets",
    "crypto payments",
    "accept crypto payments",
    "crypto payment gateway",
    "crypto payment processor",
    "USDC payments",
    "Solana payments",
    "stablecoin payments",
    "USDC payment processor",
    "Solana payment gateway",
    "gasless transactions",
    "instant crypto payments",
    "merchant crypto payments",
    "blockchain payments",
    "web3 payments",
    "crypto checkout",
    "crypto payment SDK",
    "iGaming crypto payments",
    "accept USDC",
    "Stripe alternative crypto",
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
    title: "Settlr | Non-Custodial Crypto Payments",
    description:
      "Instant crypto payments, directly to your wallet. No custody, no delays. Embedded wallets for seamless checkout.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr - Non-Custodial Crypto Payments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr | Non-Custodial Crypto Payments",
    description:
      "Instant settlement, directly to your wallet. No custody risk. From 2% fees.",
    images: ["/opengraph-image"],
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
    <html lang="en" style={{ background: "#0a0a12" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: "#0a0a12" }}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
