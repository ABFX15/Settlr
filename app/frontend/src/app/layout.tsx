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
    default: "Settlr | Crypto Payment Solution for Merchants & iGaming",
    template: "%s | Settlr",
  },
  description:
    "The easiest crypto payment solution for merchants. Accept payments in any token, receive USDC instantly. No wallet required, gasless transactions, 5-minute integration. Built on Solana.",
  keywords: [
    "crypto payment solution",
    "crypto payment solutions",
    "cryptocurrency payment solution",
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
    "Stripe for crypto",
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
    title: "Settlr | Seamless iGaming Payments on Solana",
    description:
      "No wallet required. Gasless on Solana. Accept USDC from any chain in minutes.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Settlr - Seamless iGaming Payments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settlr | Seamless iGaming Payments on Solana",
    description: "No wallet required. Gasless on Solana. Fees from 2%.",
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
