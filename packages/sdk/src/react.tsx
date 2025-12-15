import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Settlr, type SettlrConfig } from "./client";
import type { CreatePaymentOptions, Payment, PaymentResult } from "./types";

/**
 * Settlr context value
 */
interface SettlrContextValue {
  /** Settlr client instance */
  settlr: Settlr | null;

  /** Whether wallet is connected */
  connected: boolean;

  /** Create a payment link */
  createPayment: (options: CreatePaymentOptions) => Promise<Payment>;

  /** Execute a direct payment */
  pay: (options: { amount: number; memo?: string }) => Promise<PaymentResult>;

  /** Get merchant's USDC balance */
  getBalance: () => Promise<number>;
}

const SettlrContext = createContext<SettlrContextValue | null>(null);

/**
 * Settlr Provider Props
 */
interface SettlrProviderProps {
  children: ReactNode;
  config: Omit<SettlrConfig, "rpcEndpoint">;
}

/**
 * Settlr Provider - Wraps your app to provide Settlr functionality
 *
 * @example
 * ```tsx
 * import { SettlrProvider } from '@settlr/sdk';
 *
 * function App() {
 *   return (
 *     <WalletProvider wallets={wallets}>
 *       <SettlrProvider config={{
 *         merchant: {
 *           name: 'My Store',
 *           walletAddress: 'YOUR_WALLET',
 *         },
 *       }}>
 *         <YourApp />
 *       </SettlrProvider>
 *     </WalletProvider>
 *   );
 * }
 * ```
 */
export function SettlrProvider({ children, config }: SettlrProviderProps) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const settlr = useMemo(() => {
    return new Settlr({
      ...config,
      rpcEndpoint: connection.rpcEndpoint,
    });
  }, [config, connection.rpcEndpoint]);

  const value = useMemo<SettlrContextValue>(
    () => ({
      settlr,
      connected: wallet.connected,

      createPayment: (options: CreatePaymentOptions) => {
        return settlr.createPayment(options);
      },

      pay: async (options: { amount: number; memo?: string }) => {
        if (!wallet.publicKey || !wallet.signTransaction) {
          return {
            success: false,
            signature: "",
            amount: options.amount,
            merchantAddress: settlr.getMerchantAddress().toBase58(),
            error: "Wallet not connected",
          };
        }

        return settlr.pay({
          wallet: {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction,
          },
          amount: options.amount,
          memo: options.memo,
        });
      },

      getBalance: () => {
        return settlr.getMerchantBalance();
      },
    }),
    [settlr, wallet]
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
 *   const { createPayment, pay, connected } = useSettlr();
 *
 *   const handlePay = async () => {
 *     // Option 1: Create payment link
 *     const payment = await createPayment({ amount: 29.99 });
 *     window.location.href = payment.checkoutUrl;
 *
 *     // Option 2: Direct payment
 *     const result = await pay({ amount: 29.99 });
 *     if (result.success) {
 *       console.log('Paid!');
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handlePay} disabled={!connected}>
 *       Pay $29.99
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
