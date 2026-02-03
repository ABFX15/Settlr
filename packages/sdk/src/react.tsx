import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Settlr, type SettlrConfig } from "./client";
import type { CreatePaymentOptions, Payment } from "./types";

/**
 * Checkout URL options
 */
interface CheckoutUrlOptions {
  amount: number;
  memo?: string;
  orderId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Settlr context value
 */
interface SettlrContextValue {
  /** Settlr client instance */
  settlr: Settlr | null;

  /** Whether user is authenticated */
  authenticated: boolean;

  /** Whether the SDK is ready (API key validated) */
  ready: boolean;

  /** Error if initialization failed */
  error: Error | null;

  /** Create a payment link (redirect flow) */
  createPayment: (options: CreatePaymentOptions) => Promise<Payment>;

  /** Generate checkout URL for redirect */
  getCheckoutUrl: (options: CheckoutUrlOptions) => string;

  /** Get merchant's USDC balance */
  getBalance: () => Promise<number>;
}

const SettlrContext = createContext<SettlrContextValue | null>(null);

/**
 * Settlr Provider Props
 */
interface SettlrProviderProps {
  children: ReactNode;
  config: SettlrConfig;
  /** Whether user is authenticated (from Privy or other auth) */
  authenticated?: boolean;
}

/**
 * Settlr Provider - Wraps your app to provide Settlr functionality
 *
 * Works with Privy authentication - just pass the authenticated state.
 *
 * @example
 * ```tsx
 * import { SettlrProvider } from '@settlr/sdk';
 * import { usePrivy } from '@privy-io/react-auth';
 *
 * function App() {
 *   const { authenticated } = usePrivy();
 *
 *   return (
 *     <SettlrProvider
 *       authenticated={authenticated}
 *       config={{
 *         apiKey: 'sk_live_xxxxxxxxxxxx',
 *         merchant: {
 *           name: 'My Game',
 *           walletAddress: 'YOUR_WALLET',
 *         },
 *       }}
 *     >
 *       <YourApp />
 *     </SettlrProvider>
 *   );
 * }
 * ```
 */
export function SettlrProvider({
  children,
  config,
  authenticated = false,
}: SettlrProviderProps) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const settlr = useMemo(() => {
    return new Settlr({
      ...config,
      rpcEndpoint: config.rpcEndpoint ?? "https://api.devnet.solana.com",
    });
  }, [config]);

  // Auto-validate API key on mount to fetch merchant wallet address
  useEffect(() => {
    let cancelled = false;

    // If wallet is already in config, we're ready immediately
    if (config.merchant.walletAddress) {
      console.log(
        "[Settlr] Wallet address provided in config, skipping API validation",
      );
      setReady(true);
      return;
    }

    settlr
      .validateApiKey()
      .then(() => {
        if (!cancelled) {
          setReady(true);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[Settlr] API key validation failed:", err);
          setError(err instanceof Error ? err : new Error(String(err)));
          // Still mark as ready for test keys (they work without validation)
          if (config.apiKey?.startsWith("sk_test_")) {
            setReady(true);
          }
        }
      });

    return () => {
      cancelled = true;
    };
  }, [settlr, config.apiKey, config.merchant.walletAddress]);

  const value = useMemo<SettlrContextValue>(
    () => ({
      settlr,
      authenticated,
      ready,
      error,

      createPayment: (options: CreatePaymentOptions) => {
        return settlr.createPayment(options);
      },

      getCheckoutUrl: (options: { amount: number; memo?: string }) => {
        if (!ready) {
          console.warn("[Settlr] SDK not ready yet. Ensure API key is valid.");
        }
        return settlr.getCheckoutUrl(options);
      },

      getBalance: () => {
        return settlr.getMerchantBalance();
      },
    }),
    [settlr, authenticated, ready, error],
  );

  return (
    <SettlrContext.Provider value={value}>{children}</SettlrContext.Provider>
  );
}

/**
 * useSettlr hook - Access Settlr functionality in your components
 *
 * @example
 * ```tsx
 * import { useSettlr } from '@settlr/sdk';
 *
 * function CheckoutButton() {
 *   const { getCheckoutUrl, authenticated } = useSettlr();
 *
 *   const handleCheckout = () => {
 *     // Redirect to Settlr checkout (handles Privy auth internally)
 *     const url = getCheckoutUrl({ amount: 29.99, memo: 'Premium Pack' });
 *     window.location.href = url;
 *   };
 *
 *   return (
 *     <button onClick={handleCheckout}>
 *       Buy Premium Pack - $29.99
 *     </button>
 *   );
 * }
 * ```
 */
export function useSettlr(): SettlrContextValue {
  const context = useContext(SettlrContext);

  if (!context) {
    throw new Error("useSettlr must be used within a SettlrProvider");
  }

  return context;
}
