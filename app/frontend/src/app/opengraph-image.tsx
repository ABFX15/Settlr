import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Settlr - Non-Custodial Crypto Payment Processor";
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
          backgroundColor: "#0a0a0f",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(153, 69, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 212, 255, 0.3) 0%, transparent 50%)",
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
          {/* Logo/Brand - Italic skewed style */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {/* Stacked bars icon */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                transform: "skewX(-12deg)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 8,
                  background: "#00D4FF",
                  marginLeft: 8,
                  boxShadow: "0 0 20px rgba(0, 212, 255, 0.9)",
                }}
              />
              <div
                style={{
                  width: 40,
                  height: 8,
                  background: "#9945FF",
                  boxShadow: "0 0 20px rgba(153, 69, 255, 0.9)",
                }}
              />
              <div
                style={{
                  width: 40,
                  height: 8,
                  background: "#14F195",
                  marginLeft: 4,
                  boxShadow: "0 0 20px rgba(20, 241, 149, 0.9)",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 100,
                fontWeight: 800,
                fontStyle: "italic",
                transform: "skewX(-12deg)",
                display: "flex",
              }}
            >
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #00D4FF 0%, #9945FF 50%, #FF00E5 100%)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                SETTL
              </span>
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #FF00E5 0%, #14F195 100%)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                R
              </span>
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 44,
              color: "#ffffff",
              marginBottom: 16,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            Ship Payments in 5 Minutes
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 28,
              color: "#a3a3a3",
              marginBottom: 48,
              textAlign: "center",
            }}
          >
            Non-custodial • Instant settlement • From 1% fees
          </div>

          {/* Features */}
          <div
            style={{
              display: "flex",
              gap: 48,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#00D4FF",
                fontSize: 26,
              }}
            >
              <span>💳</span>
              <span>Accept USDC</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#9945FF",
                fontSize: 26,
              }}
            >
              <span>⚡</span>
              <span>Built on Solana</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#14F195",
                fontSize: 26,
              }}
            >
              <span>🔐</span>
              <span>Your Keys</span>
            </div>
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 24,
            color: "#737373",
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
