"use client";

export function SettlrLogo({
  size = "lg",
  variant = "default",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "light" | "dark";
}) {
  const sizeClasses = {
    sm: "text-5xl",
    md: "text-7xl",
    lg: "text-8xl",
    xl: "text-[10rem]",
  };

  const underlineHeight = {
    sm: "h-[4px]",
    md: "h-[6px]",
    lg: "h-[8px]",
    xl: "h-[12px]",
  };

  const variantClasses = {
    default: "text-foreground",
    light: "text-white",
    dark: "text-zinc-900",
  };

  return (
    <div
      className={`font-[family-name:var(--font-display)] font-black tracking-wider ${sizeClasses[size]} ${variantClasses[variant]} select-none uppercase`}
      style={{ fontStyle: "italic" }}
    >
      <span className="relative inline-block -skew-x-12">
        <span className="text-white">SETTL</span>
        <span className="relative inline-block">
          <span className="relative z-10 text-[#14F195]">R</span>
          <span
            className={`absolute bottom-[0.05em] -left-[0.1em] right-[-0.1em] ${underlineHeight[size]} bg-[#14F195]`}
            style={{ boxShadow: "0 0 20px rgba(20, 241, 149, 0.5)" }}
          />
        </span>
      </span>
    </div>
  );
}

export function SettlrLogoWithIcon({
  size = "lg",
  variant = "default",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "light" | "dark";
}) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  };

  const barHeights = {
    sm: "h-[2px]",
    md: "h-[3px]",
    lg: "h-[4px]",
    xl: "h-[5px]",
  };

  const underlineHeight = {
    sm: "h-[2px]",
    md: "h-[3px]",
    lg: "h-[4px]",
    xl: "h-[5px]",
  };

  const gapSizes = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
    xl: "gap-5",
  };

  return (
    <div
      className={`flex items-center ${gapSizes[size]} font-[family-name:var(--font-display)] font-black tracking-wider ${sizeClasses[size]} select-none uppercase`}
    >
      {/* Stacked bars icon */}
      <div
        className={`${iconSizes[size]} relative flex flex-col justify-center gap-[2px] -skew-x-12`}
      >
        <div
          className={`${barHeights[size]} bg-[#14F195] ml-1`}
          style={{ opacity: 0.4 }}
        />
        <div className={`${barHeights[size]} bg-[#14F195]`} />
        <div
          className={`${barHeights[size]} bg-[#14F195] ml-0.5`}
          style={{ opacity: 0.6 }}
        />
      </div>
      <span
        className="relative inline-block -skew-x-12"
        style={{ fontStyle: "italic" }}
      >
        <span className="text-white">SETTL</span>
        <span className="relative inline-block">
          <span className="relative z-10 text-[#14F195]">R</span>
          <span
            className={`absolute bottom-[0.05em] -left-[0.1em] right-[-0.1em] ${underlineHeight[size]} bg-[#14F195]`}
            style={{ boxShadow: "0 0 12px rgba(20, 241, 149, 0.4)" }}
          />
        </span>
      </span>
    </div>
  );
}

// Monochrome version with glow
export function SettlrLogoMono({
  size = "lg",
  variant = "light",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
}) {
  const sizeClasses = {
    sm: "text-5xl",
    md: "text-7xl",
    lg: "text-8xl",
    xl: "text-[10rem]",
  };

  const underlineHeight = {
    sm: "h-[4px]",
    md: "h-[6px]",
    lg: "h-[8px]",
    xl: "h-[12px]",
  };

  const variantStyles = {
    light: {
      text: "text-white",
      accent: "bg-[#14F195]",
      shadow: "0 0 30px rgba(20, 241, 149, 0.9)",
      textShadow: "0 0 40px rgba(255, 255, 255, 0.5)",
    },
    dark: {
      text: "text-zinc-900",
      accent: "bg-[#14F195]",
      shadow: "0 0 30px rgba(20, 241, 149, 0.9)",
      textShadow: "none",
    },
  };

  return (
    <div
      className={`font-[family-name:var(--font-display)] tracking-wide ${sizeClasses[size]} ${variantStyles[variant].text} select-none uppercase`}
      style={{
        fontStyle: "italic",
        filter: `drop-shadow(${variantStyles[variant].textShadow})`,
      }}
    >
      <span className="relative inline-block -skew-x-12">
        SETTL
        <span className="relative inline-block">
          <span className="relative z-10 text-[#14F195]">R</span>
          <span
            className={`absolute bottom-[0.05em] -left-[0.1em] right-[-0.1em] ${underlineHeight[size]} ${variantStyles[variant].accent}`}
            style={{ boxShadow: variantStyles[variant].shadow }}
          />
        </span>
      </span>
    </div>
  );
}
