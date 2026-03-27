import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence workspace root warning
  turbopack: {
    root: ".",
    resolveAlias: {
      // Prevent Turbopack from bundling Node-only logging packages.
      // @walletconnect/logger → pino → thread-stream (has test files with intentional syntax errors).
      // Turbopack doesn't support `false` as a value, so we alias to stub files.
      pino: "./src/lib/stubs/pino.js",
      "pino-pretty": "./src/lib/stubs/empty.js",
      "thread-stream": "./src/lib/stubs/empty.js",
      "why-is-node-running": "./src/lib/stubs/empty.js",
    },
  },
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
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
  // Solana Actions / Blinks CORS headers
  async headers() {
    return [
      {
        source: "/api/actions/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Accept-Action-Version, X-Accept-Blockchain-Ids",
          },
        ],
      },
      {
        source: "/.well-known/actions.json",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
        ],
      },
    ];
  },
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

    // Handle WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Handle pino and thread-stream which have Node.js-only dependencies
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

    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        pino: require.resolve("./src/lib/stubs/pino.js"),
        "pino-pretty": require.resolve("./src/lib/stubs/empty.js"),
        "thread-stream": require.resolve("./src/lib/stubs/empty.js"),
      };
    }

    // Ignore problematic test files from node_modules
    config.module.rules.push({
      test: /node_modules[/\\](thread-stream|pino)[/\\].*\.(js|ts)$/,
      loader: "ignore-loader",
    });

    return config;
  },
};

export default nextConfig;
