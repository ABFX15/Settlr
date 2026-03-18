"use client";

import { motion } from "framer-motion";
import { t } from "./shared";

const logos = [
  { name: "Solana", src: "/solana-logo.png" },
  { name: "Circle USDC", src: "/usdc-logo.png" },
  { name: "Squads Protocol", src: "/squads-logo.png" },
];

/* double the set for seamless infinite scroll */
const marqueeLogos = [...logos, ...logos, ...logos, ...logos];

export function LogoBar() {
  return (
    <section className="bg-white py-14 overflow-hidden">
      <motion.div
        className="mx-auto max-w-[1200px] px-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Powered by
        </p>
      </motion.div>

      {/* marquee track */}
      <div className="relative">
        {/* left fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        {/* right fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

        <motion.div
          className="flex w-max items-center gap-16"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {marqueeLogos.map((l, i) => (
            <img
              key={`${l.name}-${i}`}
              src={l.src}
              alt={`${l.name} logo`}
              loading="lazy"
              className="h-8 w-auto shrink-0 object-contain opacity-40 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 sm:h-10"
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
