"use client";

/**
 * Professional Settlr logo components.
 *
 * Uses the Geist Sans font-family through the `font-sans` utility,
 * with a single accent color (#14F195) used sparingly for brand recognition.
 */

/* ── Sizes ────────────────────────────────── */
const SIZE_MAP = {
  sm: { text: "text-lg", icon: "h-4 w-4", gap: "gap-2", dot: "h-1 w-1" },
  md: { text: "text-xl", icon: "h-5 w-5", gap: "gap-2.5", dot: "h-1.5 w-1.5" },
  lg: { text: "text-2xl", icon: "h-6 w-6", gap: "gap-3", dot: "h-2 w-2" },
  xl: { text: "text-3xl", icon: "h-7 w-7", gap: "gap-3", dot: "h-2.5 w-2.5" },
} as const;

const HERO_SIZE_MAP = {
  sm: { text: "text-5xl", underline: "h-[3px]" },
  md: { text: "text-6xl", underline: "h-[4px]" },
  lg: { text: "text-7xl", underline: "h-[5px]" },
  xl: { text: "text-8xl", underline: "h-[6px]" },
} as const;

type Size = "sm" | "md" | "lg" | "xl";
type Variant = "default" | "light" | "dark";

const VARIANT_TEXT: Record<Variant, string> = {
  default: "text-foreground",
  light: "text-white",
  dark: "text-zinc-900",
};

/* ── Mark icon (small "S" mark) ───────────── */
function SettlrMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#14F195" />
      <path
        d="M10 12.5C10 10.567 11.567 9 13.5 9H18.5C20.433 9 22 10.567 22 12.5C22 14.433 20.433 16 18.5 16H13.5C11.567 16 10 17.567 10 19.5C10 21.433 11.567 23 13.5 23H18.5C20.433 23 22 21.433 22 19.5"
        stroke="#09090b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Inline logo (icon + wordmark, for nav/footer) ── */
export function SettlrLogoWithIcon({
  size = "sm",
  variant = "default",
}: {
  size?: Size;
  variant?: Variant;
}) {
  const s = SIZE_MAP[size];

  return (
    <span className={`inline-flex items-center ${s.gap}`}>
      <SettlrMark className={s.icon} />
      <span
        className={`${s.text} font-sans font-bold tracking-tight ${VARIANT_TEXT[variant]}`}
      >
        Settlr
      </span>
    </span>
  );
}

/* ── Hero-sized wordmark (for landing page) ── */
export function SettlrLogo({
  size = "lg",
  variant = "default",
}: {
  size?: Size;
  variant?: Variant;
}) {
  const s = HERO_SIZE_MAP[size];

  return (
    <span
      className={`relative inline-block font-sans font-extrabold tracking-tight ${s.text} ${VARIANT_TEXT[variant]}`}
    >
      Settlr
      <span
        className={`absolute bottom-[0.08em] left-0 right-0 ${s.underline} rounded-full bg-primary`}
      />
    </span>
  );
}

/* ── Mono logo (single-color, for dark overlays) ── */
export function SettlrLogoMono({
  size = "lg",
  variant = "light",
}: {
  size?: Size;
  variant?: "light" | "dark";
}) {
  const s = HERO_SIZE_MAP[size];
  const textColor = variant === "light" ? "text-white" : "text-zinc-900";

  return (
    <span
      className={`relative inline-block font-sans font-extrabold tracking-tight ${s.text} ${textColor}`}
    >
      Settlr
      <span
        className={`absolute bottom-[0.08em] left-0 right-0 ${s.underline} rounded-full bg-primary`}
      />
    </span>
  );
}

export { SettlrMark };
