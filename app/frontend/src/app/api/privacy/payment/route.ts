/**
 * Private Payment API — DEPRECATED
 *
 * This endpoint previously simulated a Privacy Cash ZK shielding flow but
 * never executed real on-chain operations. It has been removed in favour
 * of the production privacy architecture:
 *
 *   1. Standard USDC transfer on Solana (amount visible — unavoidable
 *      without a real ZK shielding integration)
 *   2. Client-side encrypted receipt blob (NaCl sealed-box) stored in
 *      Supabase — only the merchant's wallet can decrypt
 *   3. On-chain receipt PDA stores only an opaque hash via the
 *      `issue_private_receipt` instruction
 *   4. Merchant decrypts receipt details in the dashboard with their
 *      wallet signature
 *
 * Receipt encryption is handled by /api/privacy/receipt (action "issue").
 */

import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json(
        {
            error: "deprecated",
            message:
                "The simulated private payment endpoint has been removed. Use the standard payment flow with client-encrypted receipt storage via /api/privacy/receipt.",
            replacement: "/api/privacy/receipt",
        },
        { status: 410 }
    );
}

export async function GET() {
    return NextResponse.json(
        {
            service: "Private Payment API",
            status: "deprecated",
            reason:
                "Demo-mode simulation removed. Real privacy uses standard USDC transfer + client-encrypted receipts via /api/privacy/receipt.",
        },
        { status: 410 }
    );
}
