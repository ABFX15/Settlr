import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Settlr - Accept Crypto Without Wallets";
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
            "radial-gradient(circle at 25% 25%, rgba(153, 69, 255, 0.35) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 212, 255, 0.35) 0%, transparent 50%)",
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
                fontSize: 90,
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
              fontSize: 42,
              color: "#ffffff",
              marginBottom: 16,
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            Accept Crypto Without Wallets
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 26,
              color: "#a3a3a3",
              marginBottom: 40,
              textAlign: "center",
            }}
          >
            Customers pay with email. You get USDC instantly.
          </div>

          {/* Features */}
          <div
            style={{
              display: "flex",
              gap: 40,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#00D4FF",
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              <span>✉️</span>
              <span>No Wallets</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#9945FF",
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              <span>⚡</span>
              <span>Zero Gas</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#14F195",
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              <span>🔐</span>
              <span>Private</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#FF00E5",
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              <span>💰</span>
              <span>2% Fee</span>
            </div>
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 22,
            color: "#666",
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
