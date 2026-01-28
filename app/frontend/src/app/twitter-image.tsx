import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Settlr - Private Crypto Payments";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a12",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(153, 69, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(20, 241, 149, 0.15) 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              background: "linear-gradient(135deg, #9945FF 0%, #14F195 100%)",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 20,
            }}
          >
            Settlr
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 36,
              color: "#e5e5e5",
              marginBottom: 40,
              textAlign: "center",
            }}
          >
            Private Crypto Payments for Merchants
          </div>

          {/* Features */}
          <div
            style={{
              display: "flex",
              gap: 40,
              marginTop: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#9945FF",
                fontSize: 24,
              }}
            >
              <span>🔒</span>
              <span>Shielded</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#14F195",
                fontSize: 24,
              }}
            >
              <span>⛽</span>
              <span>Gasless</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#9945FF",
                fontSize: 24,
              }}
            >
              <span>💳</span>
              <span>Any Wallet</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#14F195",
                fontSize: 24,
              }}
            >
              <span>💰</span>
              <span>1% Fees</span>
            </div>
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 24,
            color: "#a3a3a3",
          }}
        >
          settlr.dev
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
