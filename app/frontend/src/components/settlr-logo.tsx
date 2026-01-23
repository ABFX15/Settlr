"use client";

// Simple class name merger (replaces cn from utils)
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
  className?: string;
}

const sizeMap = {
  sm: { text: "text-xl", icon: 20 },
  md: { text: "text-2xl", icon: 24 },
  lg: { text: "text-3xl", icon: 32 },
  xl: { text: "text-4xl", icon: 40 },
};

// Main wordmark logo
export function SettlrLogo({
  size = "md",
  variant = "light",
  className,
}: LogoProps) {
  const { text } = sizeMap[size];
  const textColor = variant === "light" ? "text-white" : "text-gray-900";

  return (
    <span
      className={cn(
        "font-bold tracking-tight select-none",
        text,
        textColor,
        className,
      )}
    >
      <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
        Settlr
      </span>
    </span>
  );
}

// Icon mark (S with gradient)
export function SettlrIcon({
  size = "md",
  variant = "light",
  className,
}: LogoProps) {
  const { icon } = sizeMap[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-gradient-to-br from-[#9945FF] to-[#14F195]",
        className,
      )}
      style={{ width: icon + 8, height: icon + 8 }}
    >
      <span className="font-bold text-white" style={{ fontSize: icon * 0.6 }}>
        S
      </span>
    </div>
  );
}

// Logo with icon mark
export function SettlrLogoWithIcon({
  size = "md",
  variant = "light",
  className,
}: LogoProps) {
  const { text, icon } = sizeMap[size];
  const textColor = variant === "light" ? "text-white" : "text-gray-900";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <SettlrIcon size={size} variant={variant} />
      <span
        className={cn("font-bold tracking-tight select-none", text, textColor)}
      >
        <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
          Settlr
        </span>
      </span>
    </div>
  );
}

// Monochrome version with single accent color
export function SettlrLogoMono({
  size = "md",
  variant = "light",
  className,
}: LogoProps) {
  const { text } = sizeMap[size];
  // Light variant uses Solana green accent, dark uses Solana purple
  const accentColor = variant === "light" ? "text-[#14F195]" : "text-[#9945FF]";
  const textColor = variant === "light" ? "text-white" : "text-gray-900";

  return (
    <span
      className={cn("font-bold tracking-tight select-none", text, className)}
    >
      <span className={accentColor}>S</span>
      <span className={textColor}>ettlr</span>
    </span>
  );
}
