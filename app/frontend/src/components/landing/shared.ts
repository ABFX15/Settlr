"use client";

import { type Variants } from "framer-motion";

/* ── design tokens ─────────────────────────────────────── */
export const t = {
    green: "#34c759",
    greenLight: "#D8F3DC",
    greenPale: "#B7E4C7",
    dark: "#212121",
    navy: "#212121",
    bodyLight: "#5c5c5c",
    bodyDark: "#8a8a8a",
    muted: "#8a8a8a",
    border: "#d3d3d3",
    cardBg: "#f2f2f2",
    bgOff: "#f2f2f2",
    /** Inter clean sans-serif for all text */
    sans: "var(--font-inter), Inter, system-ui, -apple-system, sans-serif",
    /** @deprecated – kept for compat, maps to sans now */
    serif: "var(--font-inter), Inter, system-ui, -apple-system, sans-serif",
    /** alias for body text on light bg — matches bodyLight */
    slate: "#5c5c5c",
    /** max content width */
    maxW: "1200px",
    /** section vertical padding */
    sectionPy: "py-[120px]",
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

/* ── section-level scroll fade-in ──────────────────────── */
export const sectionFade: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { ...spring, duration: 0.8 },
    },
};

/* ── counter utility (for animated stats) ──────────────── */
export function easeOutQuart(x: number): number {
    return 1 - Math.pow(1 - x, 4);
}
