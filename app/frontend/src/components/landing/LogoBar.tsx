"use client";

import { motion } from "framer-motion";
import { t, staggerContainer, fadeUp } from "./shared";

export function LogoBar() {
  return (
    <div className="border-b py-8" style={{ borderColor: t.border }}>
      <motion.div
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-10 px-6 sm:gap-16"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {[
          { name: "Solana", src: "/solana-logo.png" },
          { name: "Circle USDC", src: "/usdc-logo.png" },
          { name: "Squads Protocol", src: "/squads-logo.png" },
        ].map((l) => (
          <motion.img
            key={l.name}
            variants={fadeUp}
            src={l.src}
            alt={l.name}
            className="h-6 w-auto object-contain opacity-50 grayscale transition-all duration-300 hover:opacity-80 hover:grayscale-0 sm:h-8"
          />
        ))}
      </motion.div>
    </div>
  );
}
