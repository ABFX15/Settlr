"use client";

/* ─── Design tokens ─── */
const ACCENT = "#1B6B4A";
const ACCENT_LIGHT = "#2A9D6A";
const OUTLINE = "#0C1829";
const HIGHLIGHT = "rgba(255,255,255,0.95)";
const SHADOW_COLOR = "rgba(0,0,0,0.45)";

/*
 * BubbleText — SVG-rendered bubble graffiti text.
 * Layers (bottom to top):
 *   1. Dark offset shadow
 *   2. Thick dark outline (stroke)
 *   3. White fill with subtle gradient
 *   4. Highlight shine on upper portion
 */
function BubbleText({
  text,
  height,
  strokeWidth = 6,
  shadowOffset = 4,
  className = "",
  fillColor = HIGHLIGHT,
  outlineColor = OUTLINE,
}: {
  text: string;
  height: number;
  strokeWidth?: number;
  shadowOffset?: number;
  className?: string;
  fillColor?: string;
  outlineColor?: string;
}) {
  const id = `bubble-${text}-${height}`;

  return (
    <svg
      height={height}
      viewBox={`0 0 ${height * 2.8} ${height * 1.2}`}
      className={className}
      role="img"
      aria-label={text}
    >
      <defs>
        {/* Shine gradient — white fill */}
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#f0f0f0" />
          <stop offset="100%" stopColor="#d4d4d8" />
        </linearGradient>

        {/* Green "r" gradient */}
        <linearGradient id={`${id}-green`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT_LIGHT} />
          <stop offset="100%" stopColor={ACCENT} />
        </linearGradient>

        {/* Green dot gradient */}
        <radialGradient id={`${id}-dot`} cx="0.35" cy="0.35" r="0.65">
          <stop offset="0%" stopColor={ACCENT_LIGHT} />
          <stop offset="100%" stopColor={ACCENT} />
        </radialGradient>

        {/* Inflate filter — dilate + soften edges for puffy look */}
        <filter id={`${id}-inflate`}>
          <feMorphology
            operator="dilate"
            radius="1.5"
            in="SourceGraphic"
            result="dilated"
          />
          <feGaussianBlur in="dilated" stdDeviation="0.5" result="soft" />
          <feComposite in="SourceGraphic" in2="soft" operator="over" />
        </filter>
      </defs>

      {/* Layer 1: Drop shadow */}
      <text
        x="50%"
        y="68%"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-fredoka), 'Fredoka', sans-serif"
        fontWeight="700"
        fontSize={height * 0.72}
        fill={SHADOW_COLOR}
        stroke={SHADOW_COLOR}
        strokeWidth={strokeWidth + 2}
        strokeLinejoin="round"
        strokeLinecap="round"
        paintOrder="stroke fill"
        dx={shadowOffset}
        dy={shadowOffset}
      >
        {text}
      </text>

      {/* Layer 2: Thick dark outline */}
      <text
        x="50%"
        y="68%"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-fredoka), 'Fredoka', sans-serif"
        fontWeight="700"
        fontSize={height * 0.72}
        fill="none"
        stroke={outlineColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {text}
      </text>

      {/* Layer 3: White fill with gradient — last 'r' in green */}
      <text
        x="50%"
        y="68%"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-fredoka), 'Fredoka', sans-serif"
        fontWeight="700"
        fontSize={height * 0.72}
        fill={`url(#${id}-shine)`}
        stroke={outlineColor}
        strokeWidth={strokeWidth * 0.4}
        strokeLinejoin="round"
        strokeLinecap="round"
        paintOrder="stroke fill"
      >
        <tspan>{text.slice(0, -1)}</tspan>
        <tspan fill={`url(#${id}-green)`}>{text.slice(-1)}</tspan>
      </text>

      {/* Green accent dot */}
      <circle
        cx={`${52 + text.length * 3.6}%`}
        cy="48%"
        r={height * 0.08}
        fill={`url(#${id}-dot)`}
        stroke={outlineColor}
        strokeWidth={strokeWidth * 0.35}
      />
    </svg>
  );
}

/* ─── Small bubble text for navbar ─── */
function BubbleTextSmall({
  text,
  height,
  className = "",
}: {
  text: string;
  height: number;
  className?: string;
}) {
  const id = `bubble-sm-${height}`;

  return (
    <svg
      height={height}
      viewBox={`0 0 ${height * 2.85} ${height * 1.15}`}
      className={className}
      role="img"
      aria-label={text}
    >
      <defs>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#f0f0f0" />
          <stop offset="100%" stopColor="#d4d4d8" />
        </linearGradient>
        <linearGradient id={`${id}-green`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT_LIGHT} />
          <stop offset="100%" stopColor={ACCENT} />
        </linearGradient>
        <radialGradient id={`${id}-dot`} cx="0.35" cy="0.35" r="0.65">
          <stop offset="0%" stopColor={ACCENT_LIGHT} />
          <stop offset="100%" stopColor={ACCENT} />
        </radialGradient>
      </defs>

      {/* Shadow */}
      <text
        x="50%"
        y="66%"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-fredoka), 'Fredoka', sans-serif"
        fontWeight="700"
        fontSize={height * 0.72}
        fill={SHADOW_COLOR}
        stroke={SHADOW_COLOR}
        strokeWidth={4}
        strokeLinejoin="round"
        paintOrder="stroke fill"
        dx={2}
        dy={2}
      >
        {text}
      </text>

      {/* Outline */}
      <text
        x="50%"
        y="66%"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-fredoka), 'Fredoka', sans-serif"
        fontWeight="700"
        fontSize={height * 0.72}
        fill="none"
        stroke={OUTLINE}
        strokeWidth={3.5}
        strokeLinejoin="round"
      >
        {text}
      </text>

      {/* Fill — last 'r' in green */}
      <text
        x="50%"
        y="66%"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-fredoka), 'Fredoka', sans-serif"
        fontWeight="700"
        fontSize={height * 0.72}
        fill={`url(#${id}-shine)`}
        stroke={OUTLINE}
        strokeWidth={1.2}
        strokeLinejoin="round"
        paintOrder="stroke fill"
      >
        <tspan>{text.slice(0, -1)}</tspan>
        <tspan fill={`url(#${id}-green)`}>{text.slice(-1)}</tspan>
      </text>

      {/* Dot */}
      <circle
        cx="84%"
        cy="46%"
        r={height * 0.065}
        fill={`url(#${id}-dot)`}
        stroke={OUTLINE}
        strokeWidth={1.2}
      />
    </svg>
  );
}

/* ─── SettlrLogo — standalone wordmark (bubble graffiti) ─── */
export function SettlrLogo({
  size = "lg",
  variant = "default",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "light" | "dark";
}) {
  const heights = { sm: 48, md: 72, lg: 88, xl: 120 };
  const strokes = { sm: 4, md: 5, lg: 6, xl: 8 };
  const shadows = { sm: 2, md: 3, lg: 4, xl: 5 };

  const outlineColor = variant === "dark" ? "#d4d4d8" : OUTLINE;

  return (
    <div className="select-none">
      <BubbleText
        text="settlr"
        height={heights[size]}
        strokeWidth={strokes[size]}
        shadowOffset={shadows[size]}
        outlineColor={outlineColor}
      />
    </div>
  );
}

/* ─── SettlrLogoWithIcon — mark + wordmark (navbar / footer) ─── */
export function SettlrLogoWithIcon({
  size = "lg",
  variant = "default",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "light" | "dark";
}) {
  const heights = { sm: 28, md: 32, lg: 36, xl: 44 };
  const iconSizes = { sm: 28, md: 32, lg: 36, xl: 40 };

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Bubble S mark */}
      <svg
        width={iconSizes[size]}
        height={iconSizes[size]}
        viewBox="0 0 40 40"
        role="img"
        aria-label="S"
      >
        <defs>
          <radialGradient id={`s-mark-grad-${size}`} cx="0.35" cy="0.3" r="0.7">
            <stop offset="0%" stopColor={ACCENT_LIGHT} />
            <stop offset="100%" stopColor={ACCENT} />
          </radialGradient>
          <linearGradient id={`s-letter-${size}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#E6F2EC" />
          </linearGradient>
        </defs>
        {/* BG */}
        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="10"
          fill={`url(#s-mark-grad-${size})`}
          stroke="#145A3D"
          strokeWidth="1.5"
        />
        {/* Shadow */}
        <text
          x="21"
          y="23"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-fredoka), 'Fredoka', sans-serif"
          fontWeight="700"
          fontSize="24"
          fill="rgba(0,0,0,0.3)"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth="3"
          strokeLinejoin="round"
          paintOrder="stroke fill"
        >
          S
        </text>
        {/* Letter */}
        <text
          x="20"
          y="22"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-fredoka), 'Fredoka', sans-serif"
          fontWeight="700"
          fontSize="24"
          fill={`url(#s-letter-${size})`}
          stroke="#145A3D"
          strokeWidth="1.5"
          strokeLinejoin="round"
          paintOrder="stroke fill"
        >
          S
        </text>
      </svg>

      <BubbleTextSmall text="settlr" height={heights[size]} />
    </div>
  );
}

/* ─── SettlrLogoMono — monochrome bubble ─── */
export function SettlrLogoMono({
  size = "lg",
  variant = "light",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
}) {
  const heights = { sm: 48, md: 72, lg: 88, xl: 120 };
  const strokes = { sm: 4, md: 5, lg: 6, xl: 8 };
  const shadows = { sm: 2, md: 3, lg: 4, xl: 5 };

  const outlineColor = variant === "dark" ? "#d4d4d8" : OUTLINE;

  return (
    <div className="select-none">
      <BubbleText
        text="settlr"
        height={heights[size]}
        strokeWidth={strokes[size]}
        shadowOffset={shadows[size]}
        outlineColor={outlineColor}
      />
    </div>
  );
}
