"use client";

import Image from "next/image";

const LOGO_SRC = "/settlr-logo-nobg.png";

/* ─── SettlrLogo — standalone wordmark ─── */
export function SettlrLogo({
  size = "lg",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "light" | "dark";
}) {
  const heights = { sm: 120, md: 180, lg: 240, xl: 300 };
  const h = heights[size];

  return (
    <div className="select-none">
      <Image
        src={LOGO_SRC}
        alt="Settlr"
        height={h}
        width={h}
        className="object-contain"
        priority
      />
    </div>
  );
}

/* ─── SettlrLogoWithIcon — used in navbar / footer / pages ─── */
export function SettlrLogoWithIcon({
  size = "lg",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "light" | "dark";
}) {
  const heights = { sm: 120, md: 150, lg: 180, xl: 210 };
  const h = heights[size];

  return (
    <div className="flex items-center select-none">
      <Image
        src={LOGO_SRC}
        alt="Settlr"
        height={h}
        width={h}
        className="object-contain"
        priority
      />
    </div>
  );
}

/* ─── SettlrLogoMono — monochrome variant ─── */
export function SettlrLogoMono({
  size = "lg",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
}) {
  const heights = { sm: 120, md: 180, lg: 240, xl: 300 };
  const h = heights[size];

  return (
    <div className="select-none">
      <Image
        src={LOGO_SRC}
        alt="Settlr"
        height={h}
        width={h}
        className="object-contain"
        priority
      />
    </div>
  );
}
