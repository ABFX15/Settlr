import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Point turbopack to monorepo root for module resolution
  turbopack: {
    root: "../..",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
