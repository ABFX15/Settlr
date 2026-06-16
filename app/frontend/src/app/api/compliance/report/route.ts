/**
 * GET /api/compliance/report?wallet=<pubkey>
 *
 * Returns the merchant's compliance dossier — the bank/OTC-ready proof that
 * their funds are clean: verified identity + license, KYB, AML screening,
 * on-chain volume, and off-ramp history. A merchant pulls their own to send to
 * a partner; admins can pull any.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { assembleMerchantComplianceReport } from "@/lib/compliance-report";

export async function GET(request: NextRequest) {
    try {
        const wallet = new URL(request.url).searchParams.get("wallet");
        if (!wallet || wallet.length < 32) {
            return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
        }
        const report = await assembleMerchantComplianceReport(wallet);
        return NextResponse.json({ report });
    } catch (err) {
        logger.error("[compliance/report] error:", err);
        return NextResponse.json(
            { error: "Failed to generate report" },
            { status: 500 },
        );
    }
}
