"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import {
  useWallets,
  useSignAndSendTransaction,
  useCreateWallet,
} from "@privy-io/react-auth/solana";
import {
  Check,
  Loader2,
  Mail,
  CreditCard,
  Shield,
  Zap,
  ExternalLink,
  AlertCircle,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import {
  pipe,
  createSolanaRpc,
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  compileTransaction,
  address,
  getTransactionEncoder,
} from "@solana/kit";
import { getTransferInstruction } from "@solana-program/token";

// USDC Mint on Devnet
const USDC_MINT_ADDRESS = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_MINT = new PublicKey(USDC_MINT_ADDRESS);
const USDC_DECIMALS = 6;

// RPC endpoint
const RPC_ENDPOINT = "https://api.devnet.solana.com";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { ready, authenticated, login, user, logout } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { createWallet } = useCreateWallet();

  // Payment params from URL
  const amount = parseFloat(searchParams.get("amount") || "0");
  const merchantName = searchParams.get("merchant") || "Merchant";
  const merchantWallet = searchParams.get("to") || "";
  const memo = searchParams.get("memo") || "";
  const successUrl = searchParams.get("success") || "/";

  // State
  const [step, setStep] = useState<
    "auth" | "wallet" | "confirm" | "processing" | "success" | "error"
  >("auth");
  const [error, setError] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);

  // Get the embedded Privy wallet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const embeddedWallet = wallets?.find(
    (w: any) => w.walletClientType === "privy"
  );

  // Fetch USDC balance
  const fetchBalance = useCallback(async () => {
    if (!embeddedWallet) return;

    setLoadingBalance(true);
    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const walletPubkey = new PublicKey(embeddedWallet.address);
      const ata = await getAssociatedTokenAddress(USDC_MINT, walletPubkey);

      try {
        const account = await getAccount(connection, ata);
        const bal = Number(account.amount) / Math.pow(10, USDC_DECIMALS);
        setBalance(bal);
      } catch {
        // No token account = 0 balance
        setBalance(0);
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      setBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  }, [embeddedWallet]);

  // Check auth and wallet status
  useEffect(() => {
    if (authenticated && user && walletsReady) {
      if (embeddedWallet) {
        setStep("confirm");
        fetchBalance();
      } else {
        // Need to create wallet
        setStep("wallet");
      }
    }
  }, [authenticated, user, walletsReady, embeddedWallet, fetchBalance]);

  // Create embedded wallet
  const handleCreateWallet = async () => {
    setCreatingWallet(true);
    try {
      await createWallet();
      // Wallet will be detected by the useEffect above
    } catch (err) {
      console.error("Error creating wallet:", err);
      setError("Failed to create wallet");
    } finally {
      setCreatingWallet(false);
    }
  };

  // Process payment with embedded wallet using @solana/kit
  const processPayment = async () => {
    if (!embeddedWallet || !merchantWallet) {
      setError("Missing wallet or merchant address");
      setStep("error");
      return;
    }

    setStep("processing");
    setError("");

    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const fromPubkey = new PublicKey(embeddedWallet.address);
      const toPubkey = new PublicKey(merchantWallet);

      // Get token accounts
      const fromAta = await getAssociatedTokenAddress(USDC_MINT, fromPubkey);
      const toAta = await getAssociatedTokenAddress(USDC_MINT, toPubkey);

      // Convert amount to smallest unit (USDC has 6 decimals)
      const amountInSmallestUnit = BigInt(
        Math.round(amount * Math.pow(10, USDC_DECIMALS))
      );

      // Create transfer instruction using @solana-program/token
      const transferIx = getTransferInstruction({
        source: address(fromAta.toBase58()),
        destination: address(toAta.toBase58()),
        authority: address(embeddedWallet.address),
        amount: amountInSmallestUnit,
      });

      // Get latest blockhash using @solana/kit
      const rpc = createSolanaRpc(RPC_ENDPOINT);
      const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

      // Build transaction using @solana/kit pipe
      const transaction = pipe(
        createTransactionMessage({ version: 0 }),
        (tx) =>
          setTransactionMessageFeePayer(address(embeddedWallet.address), tx),
        (tx) =>
          setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
        (tx) => appendTransactionMessageInstructions([transferIx], tx),
        (tx) => compileTransaction(tx),
        (tx) => new Uint8Array(getTransactionEncoder().encode(tx))
      );

      // Sign and send using Privy
      const result = await signAndSendTransaction({
        transaction,
        wallet: embeddedWallet,
      });

      // Get signature from result
      const signature =
        typeof result.signature === "string"
          ? result.signature
          : Buffer.from(result.signature).toString("base64");

      setTxSignature(signature);
      setStep("success");
    } catch (err: unknown) {
      console.error("Payment error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
      setStep("error");
    }
  };

  // Auth step - login with email/social
  if (step === "auth") {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Payment Summary Card */}
          <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-6 mb-6">
            <div className="text-center mb-6">
              <p className="text-zinc-400 text-sm mb-1">Pay {merchantName}</p>
              <p className="text-4xl font-bold text-white">
                ${amount.toFixed(2)}
                <span className="text-lg text-zinc-500 ml-2">USDC</span>
              </p>
              {memo && <p className="text-zinc-500 text-sm mt-2">{memo}</p>}
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <p className="text-center text-zinc-300 mb-4">
                Sign in to continue
              </p>

              {!ready ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                </div>
              ) : (
                <button
                  onClick={login}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-semibold rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
                >
                  <Mail className="w-5 h-5" />
                  Continue with Email
                </button>
              )}

              <p className="text-center text-zinc-500 text-xs mt-4">
                No wallet needed • Sign in with email or social
              </p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex justify-center gap-6 text-zinc-500 text-xs">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>Instant</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              <span>USDC</span>
            </div>
          </div>

          <p className="text-center text-zinc-600 text-xs mt-6">
            Powered by{" "}
            <Link href="/" className="text-pink-400 hover:text-pink-300">
              Settlr
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }

  // Wallet creation step
  if (step === "wallet") {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Create Your Wallet
              </h2>
              <p className="text-zinc-400">
                We&apos;ll create a secure wallet for you automatically
              </p>
            </div>

            <button
              onClick={handleCreateWallet}
              disabled={creatingWallet}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-semibold rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creatingWallet ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Wallet...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  Create Wallet
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Confirm step
  if (step === "confirm") {
    const hasEnoughBalance = balance !== null && balance >= amount;

    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-6">
            {/* User info */}
            <div className="flex items-center justify-between mb-6 p-3 bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {user?.email?.address || user?.google?.email || "User"}
                  </p>
                  <p className="text-zinc-500 text-xs">Signed in</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-zinc-500 text-xs hover:text-zinc-300"
              >
                Sign out
              </button>
            </div>

            {/* Wallet info */}
            {embeddedWallet && (
              <div className="flex items-center gap-3 mb-6 p-3 bg-zinc-800/50 rounded-xl">
                <Wallet className="w-5 h-5 text-pink-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-400 text-xs">Your Wallet</p>
                  <p className="text-white text-sm font-mono truncate">
                    {embeddedWallet.address.slice(0, 8)}...
                    {embeddedWallet.address.slice(-6)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 text-xs">Balance</p>
                  {loadingBalance ? (
                    <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                  ) : (
                    <p
                      className={`text-sm font-medium ${
                        hasEnoughBalance ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      ${balance?.toFixed(2) || "0.00"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment details */}
            <div className="bg-zinc-800/50 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-zinc-400">To</span>
                <span className="text-white">{merchantName}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-zinc-400">Amount</span>
                <span className="text-white font-bold">
                  ${amount.toFixed(2)} USDC
                </span>
              </div>
              {memo && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">For</span>
                  <span className="text-white text-sm">{memo}</span>
                </div>
              )}
            </div>

            {/* Low balance warning */}
            {!hasEnoughBalance && balance !== null && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">
                    Insufficient balance. You need $
                    {(amount - balance).toFixed(2)} more USDC.
                  </p>
                </div>
                <p className="text-red-400/70 text-xs mt-2 break-all">
                  Fund your wallet: {embeddedWallet?.address}
                </p>
              </div>
            )}

            <button
              onClick={processPayment}
              disabled={!hasEnoughBalance || loadingBalance}
              className={`w-full py-4 font-semibold rounded-xl flex items-center justify-center gap-2 transition-opacity ${
                hasEnoughBalance && !loadingBalance
                  ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-white hover:opacity-90"
                  : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
              }`}
            >
              <Check className="w-5 h-5" />
              Pay ${amount.toFixed(2)} USDC
            </button>

            <button
              onClick={() => fetchBalance()}
              className="w-full mt-3 py-2 text-zinc-400 text-sm hover:text-zinc-300"
            >
              Refresh Balance
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Processing step
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Processing Payment
          </h2>
          <p className="text-zinc-400">
            Please wait while we confirm your transaction...
          </p>
        </motion.div>
      </div>
    );
  }

  // Success step
  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Payment Successful!
          </h2>
          <p className="text-zinc-400 mb-6">
            You paid ${amount.toFixed(2)} USDC to {merchantName}
          </p>

          {txSignature && (
            <a
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 mb-6"
            >
              View on Solana Explorer
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <div className="space-y-3">
            {successUrl && successUrl !== "/" && (
              <a
                href={successUrl}
                className="block w-full py-3 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Continue
              </a>
            )}
            <Link
              href="/"
              className="block w-full py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error step
  if (step === "error") {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
          <p className="text-zinc-400 mb-2">Something went wrong</p>
          {error && (
            <p className="text-red-400 text-sm mb-6 p-3 bg-red-500/10 rounded-xl">
              {error}
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => setStep("confirm")}
              className="block w-full py-3 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="block w-full py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
