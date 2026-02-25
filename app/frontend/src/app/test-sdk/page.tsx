"use client";

import { useState } from "react";

// Simple SDK test page
export default function TestSDKPage() {
  const [loading, setLoading] = useState(false);

  const testCheckout = () => {
    setLoading(true);

    // This is what the SDK does - just builds a URL and redirects
    const params = new URLSearchParams({
      amount: "0.01",
      merchant: "SDK Test",
      to: "11111111111111111111111111111111", // Replace with your wallet
      memo: "Testing SDK integration",
    });

    window.location.href = `/checkout?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="bg-[#F3F2ED] rounded-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[#0C1829] mb-4">SDK Test</h1>
        <p className="text-[#7C8A9E] mb-6">
          Click the button to test the checkout flow
        </p>

        <button
          onClick={testCheckout}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Redirecting..." : "Buy Test Item - $0.01"}
        </button>

        <p className="text-[#7C8A9E] text-sm mt-4">
          This simulates what the SDK BuyButton does
        </p>
      </div>
    </div>
  );
}
