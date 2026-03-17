"use client";

import { type Variants } from "framer-motion";

/* ── design tokens ─────────────────────────────────────── */
export const t = {
    green: "#1B6B4A",
    greenLight: "#E8F5EE",
    greenPale: "#D1FAE5",
    navy: "#0C1829",
    slate: "#475569",
    muted: "#94A3B8",
    border: "#E2E8F0",
    bgOff: "#F8FAFB",
    serif: "var(--font-fraunces), Georgia, serif",
} as const;

/* ── spring configs ────────────────────────────────────── */
export const spring = { type: "spring" as const, stiffness: 100, damping: 20 };
export const springFast = {
    type: "spring" as const,
    stiffness: 260,
    damping: 24,
};
export const springSnappy = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
};

/* ── stagger container ─────────────────────────────────── */
export const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

/* ── card entrance variants ────────────────────────────── */
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: spring },
};

export const fadeUpScale: Variants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: spring,
    },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: spring },
};

/* ── hover lift for cards ──────────────────────────────── */
export const cardHover = {
    y: -6,
    transition: springFast,
};

export const cardTap = {
    scale: 0.98,
    transition: springFast,
};

/* ── counter utility (for animated stats) ──────────────── */
export function easeOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4);
}
