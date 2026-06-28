/**
 * Helius webhook integration — server-side payment confirmation.
 *
 * Client-side reference polling depends on the buyer's browser staying open.
 * To confirm payments robustly we register each checkout's Solana Pay
 * `reference` key with a Helius webhook; Helius then POSTs the transaction to
 * /api/checkout/helius-webhook the moment it lands, independent of the browser.
 *
 * All functions no-op gracefully when Helius isn't configured, so the
 * client-polling path keeps working until keys are set.
 */

import { logger } from "@/lib/logger";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_WEBHOOK_ID = process.env.HELIUS_WEBHOOK_ID;
const HELIUS_WEBHOOK_AUTH = process.env.HELIUS_WEBHOOK_AUTH;

export function isHeliusConfigured(): boolean {
  return Boolean(HELIUS_API_KEY && HELIUS_WEBHOOK_ID);
}

/** Validate the Authorization header Helius is configured to send. */
export function heliusWebhookAuthOk(authHeader: string | null): boolean {
  if (!HELIUS_WEBHOOK_AUTH) return true; // no secret set (dev) — accept
  return authHeader === HELIUS_WEBHOOK_AUTH;
}

const base = () =>
  `https://api.helius.xyz/v0/webhooks/${HELIUS_WEBHOOK_ID}?api-key=${HELIUS_API_KEY}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getWebhook(): Promise<any> {
  const res = await fetch(base());
  if (!res.ok) throw new Error(`helius getWebhook ${res.status}`);
  return res.json();
}

async function putAddresses(
  addresses: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wh: any,
): Promise<void> {
  const res = await fetch(base(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      webhookURL: wh.webhookURL,
      transactionTypes: wh.transactionTypes,
      accountAddresses: addresses,
      webhookType: wh.webhookType,
      authHeader: wh.authHeader,
    }),
  });
  if (!res.ok) throw new Error(`helius putAddresses ${res.status}`);
}

/** Start watching an address (the checkout's reference key). */
export async function watchAddress(address: string): Promise<void> {
  if (!isHeliusConfigured()) return;
  try {
    const wh = await getWebhook();
    const addrs: string[] = wh.accountAddresses || [];
    if (addrs.includes(address)) return;
    addrs.push(address);
    await putAddresses(addrs, wh);
  } catch (e) {
    logger.warn("[helius] watchAddress failed:", e);
  }
}

/** Stop watching an address (after the checkout completes or expires). */
export async function unwatchAddress(address: string): Promise<void> {
  if (!isHeliusConfigured()) return;
  try {
    const wh = await getWebhook();
    const addrs: string[] = (wh.accountAddresses || []).filter(
      (a: string) => a !== address,
    );
    await putAddresses(addrs, wh);
  } catch (e) {
    logger.warn("[helius] unwatchAddress failed:", e);
  }
}

/** Every account address touched by a Helius enhanced-webhook transaction. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function accountsInTx(tx: any): string[] {
  const accts = new Set<string>();
  if (Array.isArray(tx?.accountData)) {
    for (const a of tx.accountData) if (a?.account) accts.add(a.account);
  }
  if (Array.isArray(tx?.tokenTransfers)) {
    for (const t of tx.tokenTransfers) {
      if (t?.fromUserAccount) accts.add(t.fromUserAccount);
      if (t?.toUserAccount) accts.add(t.toUserAccount);
    }
  }
  // Raw webhook fallback.
  const keys = tx?.transaction?.message?.accountKeys;
  if (Array.isArray(keys)) for (const k of keys) accts.add(typeof k === "string" ? k : k?.pubkey);
  return [...accts].filter(Boolean);
}
