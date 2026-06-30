/**
 * GET  /api/payees?wallet=<pubkey> — List a merchant's saved suppliers.
 * POST /api/payees                 — Save a new supplier.
 *
 * Dashboard auth via wallet param.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { listPayees, createPayee } from "@/lib/payees";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function GET(request: NextRequest) {
    try {
        const session = await requireMerchantSession(request);
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        return NextResponse.json({ payees: await listPayees(session.merchantId) });
    } catch (err) {
        logger.error("[payees] GET error:", err);
        return NextResponse.json({ error: "Failed to load payees" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireMerchantSession(request);
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        const body = await request.json();
        const { name, walletAddress, licenseNumber, note } = body as {
            name?: string;
            walletAddress?: string;
            licenseNumber?: string;
            note?: string;
        };

        if (!name || typeof name !== "string") {
            return NextResponse.json({ error: "Supplier name is required" }, { status: 400 });
        }
        if (!walletAddress) {
            return NextResponse.json({ error: "Supplier wallet address is required" }, { status: 400 });
        }
        try {
            new PublicKey(walletAddress);
        } catch {
            return NextResponse.json({ error: "Invalid supplier wallet address" }, { status: 400 });
        }

        const payee = await createPayee({
            merchantId: session.merchantId,
            name: name.trim(),
            walletAddress,
            licenseNumber: licenseNumber?.trim() || undefined,
            note: note?.trim() || undefined,
        });
        return NextResponse.json({ payee });
    } catch (err) {
        logger.error("[payees] POST error:", err);
        return NextResponse.json({ error: "Failed to save payee" }, { status: 500 });
    }
}
