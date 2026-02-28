"use client";

import { motion } from "framer-motion";

/**
 * 3D holographic compliance seal — sits in the hero corner.
 * Represents "Verified / Compliant" with institutional gravitas.
 *
 * Renders as an animated SVG with layered gradients for depth,
 * a rotating shimmer ring, and micro-text around the perimeter.
 */
export function ComplianceSeal({
  size = 120,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18, delay: 1 }}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(27,107,74,0.15) 0%, transparent 70%)",
          transform: "scale(1.5)",
          filter: "blur(12px)",
        }}
      />

      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative"
        style={{ width: size, height: size }}
      >
        <defs>
          {/* Main seal gradient — dark to money-green */}
          <radialGradient id="sealBg" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#1B6B4A" />
            <stop offset="60%" stopColor="#155939" />
            <stop offset="100%" stopColor="#0C3D2A" />
          </radialGradient>

          {/* Ring gradient — holographic shimmer */}
          <linearGradient id="ringShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="25%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="75%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
          </linearGradient>

          {/* Inner highlight */}
          <radialGradient id="innerHighlight" cx="40%" cy="35%" r="40%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Text path */}
          <path id="sealTextPath" d="M 60 18 A 42 42 0 1 1 59.99 18" />
        </defs>

        {/* Outer ring (border) */}
        <circle
          cx="60"
          cy="60"
          r="56"
          stroke="#1B6B4A"
          strokeWidth="1"
          fill="none"
          opacity="0.3"
        />

        {/* Main body */}
        <circle cx="60" cy="60" r="52" fill="url(#sealBg)" />

        {/* Holographic ring */}
        <motion.circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="url(#ringShimmer)"
          strokeWidth="3"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "60px 60px" }}
        />

        {/* Inner highlight for 3D depth */}
        <circle cx="60" cy="60" r="48" fill="url(#innerHighlight)" />

        {/* Inner ring */}
        <circle
          cx="60"
          cy="60"
          r="44"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.5"
        />

        {/* Rotating perimeter text */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "60px 60px" }}
        >
          <text
            fill="rgba(255,255,255,0.5)"
            fontSize="6.5"
            fontWeight="600"
            letterSpacing="3"
            fontFamily="var(--font-inter), system-ui, sans-serif"
          >
            <textPath href="#sealTextPath" startOffset="0%">
              VERIFIED · COMPLIANT · GENIUS ACT 2025 · BSA/AML ·
            </textPath>
          </text>
        </motion.g>

        {/* Center shield icon */}
        <g transform="translate(44, 38)">
          {/* Shield body */}
          <path
            d="M16 2 L28 7 V18 C28 27 22 33 16 36 C10 33 4 27 4 18 V7 L16 2Z"
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />
          {/* Checkmark */}
          <path
            d="M10 19 L14 23 L22 14"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Subtle emboss ring */}
        <circle
          cx="60"
          cy="60"
          r="37"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
          strokeDasharray="2 4"
        />
      </svg>
    </motion.div>
  );
}
