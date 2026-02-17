import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Settlr — Pay Anyone, Anywhere, With Just Their Email";
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
            "radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "#3B82F6",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          {/* Logo wordmark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 48,
            }}
          >
            <span
              style={{
                fontSize: 72,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#ffffff",
              }}
            >
              settlr
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 48,
              color: "#ffffff",
              marginBottom: 20,
              textAlign: "center",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              maxWidth: 900,
            }}
          >
            Pay Anyone, Anywhere, With Just Their Email
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.45)",
              marginBottom: 52,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            Global payout infrastructure · 1% flat fee · Instant settlement ·
            180+ countries
          </div>

          {/* Feature pills */}
          <div
            style={{
              display: "flex",
              gap: 24,
            }}
          >
            {[
              { emoji: "⚡", label: "Instant" },
              { emoji: "🌍", label: "180+ Countries" },
              { emoji: "💸", label: "1% Flat" },
              { emoji: "📧", label: "Email Only" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  borderRadius: 40,
                  padding: "10px 22px",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#3B82F6",
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
            fontSize: 20,
            color: "rgba(255,255,255,0.25)",
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
