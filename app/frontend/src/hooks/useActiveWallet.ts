"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { usePrivy } from "@privy-io/react-auth";
import {
    useWallets as useSolanaPrivyWallets,
    useSignTransaction as usePrivySignTransaction,
} from "@privy-io/react-auth/solana";
import { Transaction } from "@solana/web3.js";

/**
 * Hook to get the currently active wallet — either via Solana
 * wallet-adapter (Phantom/Solflare/etc.) OR via a Privy embedded
 * wallet provisioned during email login. Wallet-adapter takes
 * precedence when both are present.
 *
 * Crucially, `signTransaction` is unified: it routes to the adapter for
 * extension wallets and to Privy's signer for embedded (email) wallets — so
 * email users can actually sign transactions (vault creation, supplier
 * payments), which previously silently failed.
 */
export function useActiveWallet() {
    const {
        publicKey,
        connected,
        wallet,
        wallets,
        signTransaction: adapterSignTransaction,
        signAllTransactions,
        disconnect,
        connecting,
    } = useWallet();

    // Hooks must be called unconditionally. PrivyProvider is mounted
    // app-wide (or these hooks return safe defaults when disabled).
    const { authenticated: privyAuthenticated, ready: privyReady } = usePrivy();
    const { wallets: privyWalletsRaw } = useSolanaPrivyWallets();
    const { signTransaction: privySignTransaction } = usePrivySignTransaction();
    const privyWallets =
        (privyWalletsRaw ?? []) as { address: string; walletClientType?: string }[];

    const adapterAddress = publicKey?.toBase58();
    const privyEmbedded = privyWallets.find((w) => w.walletClientType === "privy");
    const privyAddress = privyAuthenticated
        ? (privyEmbedded?.address ?? privyWallets[0]?.address)
        : undefined;

    const address = adapterAddress ?? privyAddress;
    const isConnected = connected || (!!privyAddress && privyAuthenticated);

    // ── Unified transaction signer ──────────────────────────────
    let signTransaction:
        | ((tx: Transaction) => Promise<Transaction>)
        | undefined;
    if (adapterAddress && adapterSignTransaction) {
        signTransaction = (tx: Transaction) => adapterSignTransaction(tx);
    } else if (privyAddress) {
        // The full Privy wallet object (has the signing capability).
        const privyWalletObj = (privyWalletsRaw ?? []).find(
            (w: { address: string }) => w.address === privyAddress,
        );
        if (privyWalletObj) {
            signTransaction = async (tx: Transaction) => {
                const serialized = tx.serialize({
                    requireAllSignatures: false,
                    verifySignatures: false,
                });
                const { signedTransaction } = await privySignTransaction({
                    transaction: new Uint8Array(serialized),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wallet: privyWalletObj as any,
                });
                return Transaction.from(signedTransaction);
            };
        }
    }

    return {
        wallet,
        solanaWallet: wallet,
        address,
        publicKey: address,
        connected: isConnected,
        ready: !connecting && privyReady,
        wallets,
        signTransaction,
        signAllTransactions,
        disconnect,
    };
}
