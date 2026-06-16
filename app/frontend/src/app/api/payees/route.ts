/**
 * GET  /api/payees?wallet=<pubkey> — List a merchant's saved suppliers.
 * POST /api/payees                 — Save a new supplier.
 *
 * Dashboard auth via wallet param.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getOrCreateMerchantByWallet } from "@/lib/db";
import { listPayees, createPayee } from "@/lib/payees";

export async function GET(request: NextRequest) {
    try {
        const wallet = new URL(request.url).searchParams.get("wallet");
        if (!wallet || wallet.length < 32) {
            return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
        }
        const merchant = await getOrCreateMerchantByWallet(wallet);
        return NextResponse.json({ payees: await listPayees(merchant.id) });
    } catch (err) {
        logger.error("[payees] GET error:", err);
        return NextResponse.json({ error: "Failed to load payees" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { wallet, name, walletAddress, licenseNumber, note } = body as {
            wallet?: string;
            name?: string;
            walletAddress?: string;
            licenseNumber?: string;
            note?: string;
        };

        if (!wallet || wallet.length < 32) {
            return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
        }
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

        const merchant = await getOrCreateMerchantByWallet(wallet);
        const payee = await createPayee({
            merchantId: merchant.id,
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
