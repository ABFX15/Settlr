/**
 * POST /api/checkout/helius-webhook
 *
 * Receives Helius transaction webhooks for checkout reference keys we're
 * watching. For each transaction, finds the pending session by its reference
 * and completes it server-side (which verifies on-chain + fires the merchant
 * webhook) — so a payment is confirmed even if the buyer's browser is gone.
 *
 * Idempotent: completing an already-completed session is a no-op.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getCheckoutSessionByReference } from "@/lib/db";
import {
    heliusWebhookAuthOk,
    accountsInTx,
    unwatchAddress,
} from "@/lib/helius";

export async function POST(request: NextRequest) {
    if (!heliusWebhookAuthOk(request.headers.get("authorization"))) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid body" }, { status: 400 });
    }

    // Helius sends an array of (enhanced) transactions.
    const txs = Array.isArray(body) ? body : [body];
    const origin = new URL(request.url).origin;
    let completed = 0;

    for (const tx of txs) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t = tx as any;
        const signature: string | undefined = t?.signature;
        if (!signature) continue;
        const customerWallet: string = t?.feePayer || "unknown";

        // Match the payment to a checkout by any reference key it touched.
        for (const account of accountsInTx(t)) {
            try {
                const session = await getCheckoutSessionByReference(account);
                if (!session) continue;

                const res = await fetch(`${origin}/api/checkout/complete`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: session.id,
                        signature,
                        customerWallet,
                    }),
                });
                if (res.ok) completed++;
                unwatchAddress(account).catch(() => {});
                break; // one session per tx
            } catch (err) {
                logger.warn("[helius-webhook] match/complete failed:", err);
            }
        }
    }

    return NextResponse.json({ ok: true, completed });
}
