/**
 * GET /api/recipients/balance — Get recipient's balance and transaction history
 *
 * Authenticated by X-Recipient-Email header.
 */

import { NextRequest, NextResponse } from "next/server";
import {
    getRecipientByEmail,
    getOrCreateBalance,
    getBalanceTransactions,
} from "@/lib/db";

async function authenticateRecipient(request: NextRequest) {
    const recipientEmail = request.headers.get("x-recipient-email");
    if (!recipientEmail) return null;
    return getRecipientByEmail(recipientEmail);
}

export async function GET(request: NextRequest) {
    try {
        const recipient = await authenticateRecipient(request);
        if (!recipient) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
        const offset = parseInt(searchParams.get("offset") || "0");

        const [balance, transactions] = await Promise.all([
            getOrCreateBalance(recipient.id, "USDC"),
            getBalanceTransactions(recipient.id, { limit, offset }),
        ]);

        return NextResponse.json({
            balance: {
                currency: balance.currency,
                amount: balance.balance,
            },
            transactions: transactions.map(tx => ({
                id: tx.id,
                type: tx.type,
                amount: tx.amount,
                currency: tx.currency,
                payoutId: tx.payoutId,
                txSignature: tx.txSignature,
                description: tx.description,
                createdAt: tx.createdAt.toISOString(),
            })),
            count: transactions.length,
            limit,
            offset,
        });
    } catch (error) {
        console.error("[recipients/balance] Error:", error);
        return NextResponse.json(
            { error: "Failed to load balance" },
            { status: 500 }
        );
    }
}
