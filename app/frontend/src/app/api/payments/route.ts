import { NextRequest, NextResponse } from "next/server";
import { getAllPayments, getPaymentsByMerchantWallet } from "@/lib/db";
import { resolveMerchantId } from "@/lib/resolve-merchant";

/**
 * GET /api/payments
 * 
 * Fetch payments - filter by merchant wallet or merchantId
 * Query params:
 *   - wallet: merchant wallet address to filter by (checks both wallet_address and signer_wallet)
 *   - merchantId: UUID or wallet address (resolved to UUID, then looks up wallet)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get("wallet");

        let payments;
        if (wallet) {
            // getMerchantByWallet now checks both wallet_address and signer_wallet
            payments = await getPaymentsByMerchantWallet(wallet);
        } else {
            payments = await getAllPayments();
        }

        return NextResponse.json({
            payments,
            count: payments.length,
        });
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json(
            { error: "Failed to fetch payments", payments: [] },
            { status: 500 }
        );
    }
}
