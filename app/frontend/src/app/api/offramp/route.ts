/**
 * GET /api/offramp  — List off-ramp requests for a merchant
 * POST /api/offramp — Submit a new off-ramp request
 *
 * Auth: wallet query param (GET) or wallet in body (POST)
 */

import { NextRequest, NextResponse } from "next/server";
import {
    getOrCreateMerchantByWallet,
} from "@/lib/db";

// ---------------------------------------------------------------------------
// In-memory store (replace with DB in production)
// ---------------------------------------------------------------------------

interface OfframpRequest {
    id: string;
    merchantId: string;
    wallet: string;
    method: string;
    region: string;
    currency: string;
    amount: number;
    localAmount: number;
    accountInfo: string;
    status: "pending" | "processing" | "completed" | "failed";
    createdAt: string;
    updatedAt: string;
}

const offrampRequests: Map<string, OfframpRequest[]> = new Map();

function getRequests(merchantId: string): OfframpRequest[] {
    return offrampRequests.get(merchantId) || [];
}

function addRequest(merchantId: string, req: OfframpRequest): void {
    const existing = offrampRequests.get(merchantId) || [];
    existing.unshift(req);
    offrampRequests.set(merchantId, existing);

    // Simulate processing → completed after a delay
    setTimeout(() => {
        req.status = "processing";
        req.updatedAt = new Date().toISOString();
    }, 3000);

    setTimeout(() => {
        req.status = "completed";
        req.updatedAt = new Date().toISOString();
    }, 10000);
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
    try {
        const wallet = request.nextUrl.searchParams.get("wallet");
        if (!wallet || wallet.length < 32) {
            return NextResponse.json(
                { error: "Missing wallet parameter" },
                { status: 400 },
            );
        }

        const merchant = await getOrCreateMerchantByWallet(wallet);
        const requests = getRequests(merchant.id);

        return NextResponse.json({
            requests,
            total: requests.length,
        });
    } catch (err) {
        console.error("[offramp] GET error:", err);
        return NextResponse.json(
            { error: "Failed to fetch off-ramp requests" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { wallet, amount, method, region, currency, localAmount, accountInfo } = body;

        // Validate
        if (!wallet || typeof wallet !== "string" || wallet.length < 32) {
            return NextResponse.json(
                { error: "Valid wallet address required" },
                { status: 400 },
            );
        }

        if (!amount || typeof amount !== "number" || amount <= 0) {
            return NextResponse.json(
                { error: "Amount must be a positive number" },
                { status: 400 },
            );
        }

        if (!method || typeof method !== "string") {
            return NextResponse.json(
                { error: "Withdrawal method required" },
                { status: 400 },
            );
        }

        if (!accountInfo || typeof accountInfo !== "string") {
            return NextResponse.json(
                { error: "Account information required" },
                { status: 400 },
            );
        }

        const merchant = await getOrCreateMerchantByWallet(wallet);

        const id = `ofr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const offrampReq: OfframpRequest = {
            id,
            merchantId: merchant.id,
            wallet,
            method,
            region: region || "US",
            currency: currency || "USD",
            amount,
            localAmount: localAmount || amount,
            accountInfo,
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        addRequest(merchant.id, offrampReq);

        return NextResponse.json({
            request: offrampReq,
            message: `Off-ramp request submitted: ${amount} USDC → ${method}`,
        });
    } catch (err) {
        console.error("[offramp] POST error:", err);
        return NextResponse.json(
            { error: "Failed to submit off-ramp request" },
            { status: 500 },
        );
    }
}
