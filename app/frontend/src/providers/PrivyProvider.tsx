"use client";

import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";

interface PrivyProviderProps {
  children: React.ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.warn(
      "[Settlr] Privy not configured. Set NEXT_PUBLIC_PRIVY_APP_ID to enable embedded wallets."
    );
    return <>{children}</>;
  }

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#f472b6",
          logo: "/logo-new.png",
          showWalletLoginFirst: false,
        },
        loginMethods: ["email"],
        embeddedWallets: {
          solana: {
            createOnLogin: "all-users",
          },
        },
      }}
    >
      {children}
    </BasePrivyProvider>
  );
}
