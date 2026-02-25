import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Settlr — Stablecoin Payout Infrastructure for Platforms";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const logoData = await fetch(
    new URL("../../public/settlr-logo-nobg.png", import.meta.url),
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
          backgroundColor: "#FDFBF7",
        }}
      >
        {/* Subtle topo-style background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(27,107,74,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(27,107,74,0.04) 0%, transparent 50%)",
          }}
        />

        {/* Top accent bar — green */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            background: "linear-gradient(90deg, #1B6B4A, #2A9D6A)",
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
              maxWidth: 700,
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", marginBottom: 32 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                // @ts-expect-error Satori accepts ArrayBuffer for img src
                src={logoData}
                width="80"
                height="80"
                style={{ objectFit: "contain" }}
              />
            </div>

            {/* Pill badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 40,
                border: "1px solid rgba(27,107,74,0.3)",
                background: "rgba(27,107,74,0.08)",
                padding: "8px 18px",
                fontSize: 15,
                color: "#1B6B4A",
                fontWeight: 500,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#1B6B4A",
                }}
              />
              Stablecoin payout infrastructure
            </div>

            {/* Headline */}
            <div
              style={{
                fontSize: 54,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                marginBottom: 24,
                display: "flex",
                flexDirection: "column",
                fontFamily: "serif",
              }}
            >
              <span style={{ color: "#0C1829" }}>Pay anyone, anywhere,</span>
              <span style={{ color: "#1B6B4A" }}>with just their email</span>
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 21,
                color: "#3B4963",
                lineHeight: 1.5,
                marginBottom: 40,
                maxWidth: 480,
              }}
            >
              Send stablecoins to 180+ countries. 1% flat fee, settled in under
              a second. No bank details needed.
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
                      color: "#1B6B4A",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {stat.value}
                  </span>
                  <span style={{ fontSize: 14, color: "#7C8A9E" }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side — code snippet card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 340,
              borderRadius: 16,
              border: "1px solid #E2DFD5",
              background: "#0C1829",
              padding: "24px 28px",
              boxShadow: "0 24px 48px rgba(12,24,41,0.15)",
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
              <span style={{ fontSize: 14, color: "#2A9D6A" }}>
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
              <span style={{ fontSize: 13, color: "#2A9D6A" }}>
                {"  amount: 250_000,"}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                {'  currency: "USDC"'}
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
            height: 48,
            background: "#0C1829",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 80px",
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.5)",
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
                  color: "rgba(255,255,255,0.3)",
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
