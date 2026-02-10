import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence workspace root warning
  turbopack: {
    root: ".",
    resolveAlias: {
      // Stub out Node-only modules for client bundles
      pino: { browser: "./empty-module.js" },
      "pino-pretty": { browser: "./empty-module.js" },
      "thread-stream": { browser: "./empty-module.js" },
    },
  },
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Exclude problematic packages from server-side bundling
  serverExternalPackages: [
    "pino",
    "pino-pretty",
    "thread-stream",
    "privacycash",
    "@lightprotocol/hasher.rs",
  ],
  // Transpile Privy packages
  transpilePackages: ["@privy-io/react-auth"],
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      perf_hooks: false,
      "why-is-node-running": false,
    };

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      "why-is-node-running": false,
    };

    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        pino: false,
        "pino-pretty": false,
        "thread-stream": false,
      };
    }

    return config;
  },
};

export default nextConfig;
