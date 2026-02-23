import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Settlr — Stablecoin Payout Infrastructure for Platforms";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // Fetch the hero background image (bundled at build time)
  const bgData = await fetch(
    new URL("../../public/8917.jpg", import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#050507",
        }}
      >
        {/* Background photo — same as landing page hero */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          // @ts-expect-error Satori accepts ArrayBuffer for img src
          src={bgData}
          width="1200"
          height="630"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Dark overlay — matches hero's overlay style */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(5, 5, 7, 0.65)",
          }}
        />

        {/* Blue glow — matches hero's blur glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            width: 800,
            height: 500,
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.12)",
            filter: "blur(80px)",
            transform: "translateX(-50%)",
          }}
        />

        {/* Bottom fade — matches hero's gradient-to-dark */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background:
              "linear-gradient(to top, rgba(5,5,7,0.95), rgba(5,5,7,0.5), transparent)",
          }}
        />

        {/* Top accent bar */}
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

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "60px 80px",
            position: "relative",
          }}
        >
          {/* Left side — text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              maxWidth: 720,
            }}
          >
            {/* Pill badge — same as hero */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 40,
                border: "1px solid rgba(59, 130, 246, 0.3)",
                background: "rgba(59, 130, 246, 0.1)",
                padding: "8px 18px",
                fontSize: 15,
                color: "#3B82F6",
                fontWeight: 500,
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#3B82F6",
                }}
              />
              Stablecoin payment infrastructure
            </div>

            {/* Headline — matches hero */}
            <div
              style={{
                fontSize: 58,
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                marginBottom: 24,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span style={{ color: "white" }}>Stablecoin payments</span>
              <span style={{ color: "#3B82F6" }}>for every platform</span>
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.5,
                marginBottom: 44,
                maxWidth: 500,
              }}
            >
              Pay anyone with just their email — 180+ countries, 1% flat,
              settled in under a second.
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 48 }}>
              {[
                { value: "<1s", label: "Settlement" },
                { value: "1%", label: "Flat Fee" },
                { value: "180+", label: "Countries" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <span
                    style={{
                      fontSize: 34,
                      fontWeight: 700,
                      color: "#3B82F6",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    style={{ fontSize: 15, color: "rgba(255,255,255,0.35)" }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side — code snippet placeholder */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 340,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(12, 12, 20, 0.85)",
              padding: "24px 28px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
            }}
          >
            {/* Editor dots */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#ff5f57",
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#febc2e",
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#28c840",
                }}
              />
            </div>
            {/* Code lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 14, color: "#3B82F6" }}>
                npm install @settlr/sdk
              </span>
              <div style={{ height: 8 }} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                {"import { SettlrClient }"}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                {'  from "@settlr/sdk"'}
              </span>
              <div style={{ height: 6 }} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                {"client.pay({"}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                {'  email: "user@co.com",'}
              </span>
              <span style={{ fontSize: 13, color: "#3B82F6" }}>
                {"  amount: 250_000,"}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                {'  currency: "USDC"'}{" "}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                {"})"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 52,
            background: "rgba(0,0,0,0.5)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 80px",
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.35)",
              fontWeight: 600,
            }}
          >
            settlr.dev
          </span>
          <div style={{ display: "flex", gap: 28 }}>
            {["Non-custodial", "OFAC Compliant", "Solana"].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.25)",
                  letterSpacing: "0.03em",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
