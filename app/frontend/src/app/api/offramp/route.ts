/**
 * GET /api/offramp  — List off-ramp requests for a merchant
 * POST /api/offramp — Submit a new off-ramp request
 *
 * Auth: wallet query param (GET) or wallet in body (POST)
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import {
    getOrCreateMerchantByWallet,
} from "@/lib/db";
import { isUserVerified } from "@/lib/sumsub";
import { screenWallet } from "@/lib/range";
import {
    createOfframpRequest,
    listOfframpRequests,
    updateOfframpStatus,
} from "@/lib/offramp";
import { initiateOfframpPayout } from "@/lib/offramp-providers";

/**
 * KYB enforcement gate.
 *
 * When OFFBANK_REQUIRE_KYB_FOR_OFFRAMP=true and Sumsub credentials are
 * configured, every off-ramp POST is gated on the merchant having a
 * verified Sumsub applicant under their wallet address. This is the
 * compliance-required check for restricted verticals (cannabis, firearms,
 * high-risk SMB) before any USD movement.
 *
 * If the env flag is off OR Sumsub isn't configured, this is a no-op so
 * dev/devnet flows keep working.
 */
async function assertKybIfRequired(wallet: string): Promise<NextResponse | null> {
    const required = process.env.OFFBANK_REQUIRE_KYB_FOR_OFFRAMP === "true";
    const sumsubReady = !!process.env.SUMSUB_APP_TOKEN && !!process.env.SUMSUB_SECRET_KEY;
    if (!required || !sumsubReady) return null;

    try {
        const verified = await isUserVerified(wallet);
        if (!verified) {
            return NextResponse.json(
                {
                    error: "kyb_required",
                    message:
                        "Your business must complete KYB verification before settling to USD. Visit /dashboard/compliance to start.",
                },
                { status: 403 },
            );
        }
    } catch (err) {
        logger.error("[offramp] KYB check failed:", err);
        // Fail closed when the gate is required but the check errors —
        // refusing settlement is safer than leaking funds to an unverified
        // merchant.
        return NextResponse.json(
            {
                error: "kyb_check_failed",
                message:
                    "Couldn't verify your KYB status. Please retry in a moment or contact support.",
            },
            { status: 503 },
        );
    }
    return null;
}

// ---------------------------------------------------------------------------
// Handlers
//
// Requests stay "pending" until a real cannabis-compliant settlement partner
// confirms the USD moved (via /api/integrations/offramp/webhook). We never
// fake completion — claiming "completed" before money settles is a demo
// liability and, for cannabis, a compliance one.
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
        const requests = await listOfframpRequests(merchant.id);

        return NextResponse.json({
            requests,
            total: requests.length,
        });
    } catch (err) {
        logger.error("[offramp] GET error:", err);
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

        // Compliance gate — refuses off-ramp for unverified merchants when
        // OFFBANK_REQUIRE_KYB_FOR_OFFRAMP=true.
        const kybBlock = await assertKybIfRequired(wallet);
        if (kybBlock) return kybBlock;

        // AML: screen the wallet before any USD movement. Range falls back to
        // a low-risk mock when no API key is set, so dev/devnet still works.
        const screen = await screenWallet(wallet);
        if (screen.shouldBlock) {
            logger.warn(
                `[offramp] Blocked wallet ${wallet.slice(0, 8)}… (risk ${screen.riskScore})`,
            );
            return NextResponse.json(
                {
                    error: "risk_blocked",
                    message:
                        "This wallet was flagged by compliance screening and can't off-ramp. Contact support.",
                },
                { status: 403 },
            );
        }

        const merchant = await getOrCreateMerchantByWallet(wallet);

        const offrampReq = await createOfframpRequest({
            merchantId: merchant.id,
            wallet,
            method,
            region: region || "US",
            currency: currency || "USD",
            amount,
            localAmount: localAmount || amount,
            accountInfo,
            // Compliance metadata partners require, attached automatically.
            licenseNumber: merchant.licenseNumber,
            riskScore: screen.riskScore,
        });

        // Hand off to the provider chain (e.g. cybrid → manual fallback).
        const initiation = await initiateOfframpPayout({
            requestId: offrampReq.id,
            amount,
            currency: currency || "USD",
            method,
            accountInfo,
            licenseNumber: merchant.licenseNumber,
            merchantWallet: wallet,
        });
        const updated =
            (await updateOfframpStatus(offrampReq.id, initiation.status, {
                provider: initiation.provider,
                providerRef: initiation.providerRef,
            })) || offrampReq;

        return NextResponse.json({
            request: updated,
            message: `Off-ramp request received: ${amount} USDC → ${method}. Funds settle once ${
                initiation.provider === "manual"
                    ? "our compliance partner confirms"
                    : `${initiation.provider} settles`
            } — you'll see the status update here.`,
        });
    } catch (err) {
        logger.error("[offramp] POST error:", err);
        return NextResponse.json(
            { error: "Failed to submit off-ramp request" },
            { status: 500 },
        );
    }
}
