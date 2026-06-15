/**
 * Off-ramp provider adapters + multi-provider fallback.
 *
 * An off-ramp partner converts USDC→USD and settles to a cannabis-compliant
 * bank. We keep this behind a small adapter so we can swap or fail over
 * partners (their explicit recommendation: don't depend on one). Settlement
 * is always confirmed by the signed webhook — providers only *initiate*.
 *
 * Configure the chain with OFFBANK_OFFRAMP_PROVIDER as a comma-separated
 * priority list, e.g. "cybrid,manual". "manual" is always appended as the
 * ultimate fallback so a payout request is never lost.
 */

import { logger } from "@/lib/logger";

export interface OfframpInitiation {
    /** Provider that accepted the payout. */
    provider: string;
    /** "processing" once a real API partner has accepted it; "pending" for manual. */
    status: "pending" | "processing";
    /** Provider-side reference, when available. */
    providerRef?: string;
}

export interface OfframpPayoutInput {
    requestId: string;
    amount: number;
    currency: string;
    method: string;
    /** Destination bank details (opaque string the partner interprets). */
    accountInfo: string;
    /** Compliance metadata partners require. */
    licenseNumber?: string | null;
    merchantWallet: string;
}

export interface OfframpProvider {
    name: string;
    /** True when env credentials for this provider are present. */
    isConfigured(): boolean;
    /** Initiate a payout. Throws to trigger fallback to the next provider. */
    initiatePayout(input: OfframpPayoutInput): Promise<OfframpInitiation>;
}

/* ── Manual provider (always available) ───────────────────────
   A cannabis-compliant settlement partner processes the payout off our
   on-chain audit trail + KYB and confirms via the webhook. Nothing to call
   programmatically, so the request simply stays "pending". */
const manualProvider: OfframpProvider = {
    name: "manual",
    isConfigured: () => true,
    initiatePayout: async () => ({ provider: "manual", status: "pending" }),
};

/* ── Cybrid provider ──────────────────────────────────────────
   Self-serve B2B stablecoin off-ramp (docs.cybrid.xyz). OAuth2
   client-credentials auth is implemented below. The payout itself
   (quote → trade → transfer to the customer's external bank) requires a
   Cybrid customer + bank account provisioned via their KYB onboarding, so
   it's gated behind sandbox credentials and verified setup.

   NOTE: the quote/trade/transfer call sequence must be confirmed against the
   current Cybrid API + a sandbox account before enabling in production. Until
   CYBRID_BANK_GUID + a customer mapping exist, this throws so the chain falls
   back to "manual" — we never fake a settlement. */
function cybridConfigured(): boolean {
    return (
        !!process.env.CYBRID_CLIENT_ID &&
        !!process.env.CYBRID_CLIENT_SECRET &&
        !!process.env.CYBRID_BANK_GUID
    );
}

function cybridHosts() {
    const env = (process.env.CYBRID_ENVIRONMENT || "sandbox").toLowerCase();
    return {
        idp: `https://id.${env}.cybrid.app`,
        bank: `https://bank.${env}.cybrid.app`,
    };
}

/** OAuth2 client-credentials token for Cybrid (banks scope). */
export async function getCybridAccessToken(): Promise<string> {
    const { idp } = cybridHosts();
    const res = await fetch(`${idp}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            grant_type: "client_credentials",
            client_id: process.env.CYBRID_CLIENT_ID,
            client_secret: process.env.CYBRID_CLIENT_SECRET,
            scope:
                "banks:read banks:write accounts:read accounts:execute " +
                "quotes:execute trades:execute transfers:execute customers:read",
        }),
    });
    if (!res.ok) {
        throw new Error(`Cybrid auth failed: ${res.status}`);
    }
    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) throw new Error("Cybrid auth: no access_token");
    return data.access_token;
}

const cybridProvider: OfframpProvider = {
    name: "cybrid",
    isConfigured: cybridConfigured,
    initiatePayout: async () => {
        // Verify auth works (cheap, real) so misconfig surfaces immediately…
        await getCybridAccessToken();
        // …then hand off to the documented quote→trade→transfer sequence,
        // which needs a provisioned Cybrid customer/account. Until that
        // onboarding exists, fall back to manual rather than fake a payout.
        throw new Error("cybrid_payout_not_yet_provisioned");
    },
};

const REGISTRY: Record<string, OfframpProvider> = {
    manual: manualProvider,
    cybrid: cybridProvider,
};

/** Resolve the configured provider chain, always ending with manual. */
export function resolveProviderChain(): OfframpProvider[] {
    const names = (process.env.OFFBANK_OFFRAMP_PROVIDER || "manual")
        .split(",")
        .map((n) => n.trim().toLowerCase())
        .filter(Boolean);
    const chain: OfframpProvider[] = [];
    for (const name of names) {
        const p = REGISTRY[name];
        if (p && p.isConfigured() && !chain.includes(p)) chain.push(p);
    }
    if (!chain.includes(manualProvider)) chain.push(manualProvider);
    return chain;
}

/**
 * Initiate a payout, walking the provider chain until one accepts it.
 * `manual` always accepts, so this never throws.
 */
export async function initiateOfframpPayout(
    input: OfframpPayoutInput,
): Promise<OfframpInitiation> {
    for (const provider of resolveProviderChain()) {
        try {
            return await provider.initiatePayout(input);
        } catch (err) {
            logger.warn(
                `[offramp] provider "${provider.name}" declined ${input.requestId}: ${
                    err instanceof Error ? err.message : "error"
                }; trying next`,
            );
        }
    }
    // Unreachable — manual always succeeds — but keep the type honest.
    return { provider: "manual", status: "pending" };
}
