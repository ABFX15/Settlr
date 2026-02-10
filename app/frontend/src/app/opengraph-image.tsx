import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "Settlr – The payment stack for global-first AI and SaaS companies";
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
          backgroundColor: "#050507",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(167, 139, 250, 0.25) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(56, 189, 248, 0.2) 0%, transparent 50%)",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #a78bfa, #38bdf8)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Logo — bubble graffiti "settlr." */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: 16,
                background: "linear-gradient(135deg, #c4b5fd, #a78bfa)",
                border: "2px solid #7c3aed",
                boxShadow: "4px 4px 0 rgba(0,0,0,0.4)",
              }}
            >
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 700,
                  color: "#ffffff",
                  textShadow: "1px 1px 0 rgba(0,0,0,0.2)",
                }}
              >
                S
              </span>
            </div>
            {/* Wordmark — layered outline for bubble effect */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                fontSize: 88,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: "#ffffff",
                textShadow:
                  "3px 3px 0 rgba(0,0,0,0.45), -2px -2px 0 #1a1a2e, 2px -2px 0 #1a1a2e, -2px 2px 0 #1a1a2e, 2px 2px 0 #1a1a2e, 0 -2px 0 #1a1a2e, 0 2px 0 #1a1a2e, -2px 0 0 #1a1a2e, 2px 0 0 #1a1a2e",
              }}
            >
              settlr
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #c4b5fd, #a78bfa)",
                  border: "2px solid #1a1a2e",
                  marginLeft: 4,
                  marginBottom: 10,
                  boxShadow: "2px 2px 0 rgba(0,0,0,0.4)",
                }}
              />
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 44,
              color: "#ffffff",
              marginBottom: 16,
              textAlign: "center",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            The payment stack for AI &amp; SaaS
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 48,
              textAlign: "center",
            }}
          >
            Accept USDC globally. No wallets. No gas. 1% flat fee.
          </div>

          {/* Feature pills */}
          <div
            style={{
              display: "flex",
              gap: 32,
            }}
          >
            {[
              { emoji: "🔒", label: "Private by Default", color: "#a78bfa" },
              { emoji: "⚡", label: "Zero Gas Fees", color: "#38bdf8" },
              { emoji: "💸", label: "Instant Payouts", color: "#a78bfa" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 24,
                  fontWeight: 600,
                  color: item.color,
                }}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 22,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.05em",
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
