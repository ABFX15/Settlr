/**
 * Centralized Solana network constants.
 *
 * All RPC URLs, USDC mint addresses, explorer URLs, and network flags
 * are derived from environment variables here. No other file should
 * hardcode these values.
 */
import { PublicKey } from "@solana/web3.js";

// ── Network configuration ────────────────────────────────────────────────────

const MAINNET_RPC_DEFAULT = "https://api.mainnet-beta.solana.com";
const DEVNET_RPC_DEFAULT = "https://api.devnet.solana.com";

function normalizeNetwork(value?: string): "devnet" | "mainnet-beta" | undefined {
    if (!value) return undefined;
    const v = value.trim().toLowerCase();
    if (v === "devnet") return "devnet";
    if (v === "mainnet" || v === "mainnet-beta") return "mainnet-beta";
    return undefined;
}

const EXPLICIT_NETWORK =
    normalizeNetwork(process.env.NEXT_PUBLIC_SOLANA_NETWORK) ||
    normalizeNetwork(process.env.SOLANA_NETWORK);

const FORCE_DEVNET =
    process.env.NEXT_PUBLIC_FORCE_DEVNET === "true" ||
    process.env.FORCE_DEVNET === "true" ||
    EXPLICIT_NETWORK === "devnet";

/**
 * Canonical RPC URL. Reads from the env vars used across the codebase,
 * falling back in order. Defaults to **devnet** only when SOLANA_NETWORK
 * is not explicitly set to "mainnet-beta".
 */
export const SOLANA_RPC_URL: string =
    FORCE_DEVNET
        ? DEVNET_RPC_DEFAULT
        : process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
        process.env.NEXT_PUBLIC_SOLANA_RPC ||
        process.env.SOLANA_RPC_URL ||
        (EXPLICIT_NETWORK === "mainnet-beta"
            ? MAINNET_RPC_DEFAULT
            : DEVNET_RPC_DEFAULT);

/** True when the RPC url points at devnet. */
export const IS_DEVNET: boolean = SOLANA_RPC_URL.includes("devnet");

/** True when explicitly configured for mainnet. */
export const IS_MAINNET: boolean = !IS_DEVNET;

// ── USDC mint ────────────────────────────────────────────────────────────────

const USDC_MINT_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_MINT_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

/** String address of the USDC mint for the current network. */
export const USDC_MINT_ADDRESS: string =
    process.env.USDC_MINT ||
    (IS_DEVNET ? USDC_MINT_DEVNET : USDC_MINT_MAINNET);

/** PublicKey of the USDC mint. */
export const USDC_MINT = new PublicKey(USDC_MINT_ADDRESS);

// ── Explorer helpers ─────────────────────────────────────────────────────────

const CLUSTER_PARAM = IS_DEVNET ? "?cluster=devnet" : "";

/** Return a Solana Explorer URL for the given tx signature. */
export function explorerUrl(txSignature: string): string {
    return `https://explorer.solana.com/tx/${txSignature}${CLUSTER_PARAM}`;
}

/** Return a Solscan URL for the given tx signature. */
export function solscanUrl(txSignature: string): string {
    return `https://solscan.io/tx/${txSignature}${CLUSTER_PARAM}`;
}

/** Human-readable network label for UI display. */
export const NETWORK_LABEL: string = IS_DEVNET ? "Solana Devnet" : "Solana";
