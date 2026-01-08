import { NextRequest, NextResponse } from "next/server";
import { getAllPayments, getPaymentsByMerchantWallet } from "@/lib/db";

/**
 * GET /api/payments
 * 
 * Fetch payments - optionally filter by merchant wallet
 * Query params:
 *   - wallet: merchant wallet address to filter by
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get("wallet");

        let payments;
        if (wallet) {
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
