import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background:
            "linear-gradient(135deg, #c4b5fd 0%, #a78bfa 60%, #7c3aed 100%)",
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 700,
            color: "white",
            textShadow: "3px 3px 0px rgba(0,0,0,0.2)",
            fontFamily: "system-ui",
            lineHeight: 1,
            marginTop: -4,
          }}
        >
          S
        </span>
      </div>
    ),
    { ...size },
  );
}
