"use client";

import dynamic from "next/dynamic";
import { Component, ReactNode, ErrorInfo } from "react";

// Dynamic import PrivyProvider to avoid SSR issues with pino/thread-stream
const PrivyProvider = dynamic(
  () => import("@/providers/PrivyProvider").then((mod) => mod.PrivyProvider),
  { ssr: false }
);

const WalletProvider = dynamic(
  () => import("@/providers/WalletProvider").then((mod) => mod.WalletProvider),
  { ssr: false }
);

/* Error boundary to prevent provider crashes from breaking the entire UI */
class ProviderErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("[Settlr] Provider error caught:", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Fall through to just rendering children without providers
      return <main>{this.props.children}</main>;
    }
    return this.props.children;
  }
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ProviderErrorBoundary>
      <PrivyProvider>
        <WalletProvider>
          <main>{children}</main>
        </WalletProvider>
      </PrivyProvider>
    </ProviderErrorBoundary>
  );
}
