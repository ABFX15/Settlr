"use client";

/**
 * PrivyProvider — managed-wallet onboarding for non-crypto users.
 *
 * Wraps the existing Solana wallet-adapter providers. After a user signs
 * in with email/SMS/Google, Privy auto-creates an embedded Solana wallet
 * for them. Their `useSolanaWallets()` hook gives back that wallet's
 * address/signer, which we bridge into our existing
 * /api/auth/privy/verify → offbank_session cookie machinery.
 *
 * Crypto-native users can still connect Phantom/Solflare/etc via the
 * external-wallets login method, which falls through to wallet-adapter.
 */

import { FC, ReactNode } from "react";
import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

interface Props {
  children: ReactNode;
}

const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export const PrivyProvider: FC<Props> = ({ children }) => {
  // If Privy isn't configured (e.g. forks, CI, local dev without keys)
  // pass children through untouched so the legacy wallet-adapter flow
  // continues to work.
  if (!APP_ID) {
    return <>{children}</>;
  }

  return (
    <PrivyAuthProvider
      appId={APP_ID}
      config={{
        // Default to Solana — we don't want users provisioned with EVM
        // wallets they'll never use.
        defaultChain: undefined,
        appearance: {
          theme: "light",
          accentColor: "#34c759",
          logo: "/new-logo-no-bg.png",
          walletChainType: "solana-only",
          showWalletLoginFirst: false,
        },
        loginMethods: ["email", "google", "wallet"],
        embeddedWallets: {
          // Provision a Solana embedded wallet automatically for any
          // user who signs in with email/google and doesn't already
          // have one. This is the whole point of the integration.
          solana: { createOnLogin: "users-without-wallets" },
          ethereum: { createOnLogin: "off" },
        },
        externalWallets: {
          solana: { connectors: toSolanaWalletConnectors() },
        },
      }}
    >
      {children}
    </PrivyAuthProvider>
  );
};
