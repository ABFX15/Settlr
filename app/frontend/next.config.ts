import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence workspace root warning
  turbopack: {
    root: ".",
  },
  // Exclude problematic packages from transpilation
  transpilePackages: ["@privy-io/react-auth"],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    // Ignore problematic test files
    config.module.rules.push({
      test: /\.test\.ts$/,
      loader: "ignore-loader",
    });
    return config;
  },
};

export default nextConfig;
