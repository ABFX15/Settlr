/**
 * GET  /api/recipients/me — Get recipient profile + payout history
 * PATCH /api/recipients/me — Update wallet, preferences
 *
 * Authenticated by X-Recipient-Id header (set from magic link session on frontend).
 */

import { NextRequest, NextResponse } from "next/server";
import {
    getRecipientByEmail,
    getPayoutsByRecipientEmail,
    updateRecipient,
    getOrCreateBalance,
} from "@/lib/db";

// Simple auth: frontend stores recipient email from magic link validation
// and passes it as a header. Production would use signed JWT.
async function authenticateRecipient(request: NextRequest) {
    const recipientEmail = request.headers.get("x-recipient-email");
    if (!recipientEmail) return null;
    return getRecipientByEmail(recipientEmail);
}

/**
 * GET /api/recipients/me
 * Returns the recipient's profile, payout history, and balance.
 */
export async function GET(request: NextRequest) {
    try {
        const recipient = await authenticateRecipient(request);
        if (!recipient) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
        const offset = parseInt(searchParams.get("offset") || "0");

        const [payouts, balance] = await Promise.all([
            getPayoutsByRecipientEmail(recipient.email, { limit, offset }),
            getOrCreateBalance(recipient.id, "USDC"),
        ]);

        return NextResponse.json({
            profile: {
                id: recipient.id,
                email: recipient.email,
                walletAddress: recipient.walletAddress,
                displayName: recipient.displayName,
                notificationsEnabled: recipient.notificationsEnabled,
                autoWithdraw: recipient.autoWithdraw,
                totalReceived: recipient.totalReceived,
                totalPayouts: recipient.totalPayouts,
                createdAt: recipient.createdAt.toISOString(),
                lastPayoutAt: recipient.lastPayoutAt?.toISOString(),
            },
            balance: {
                currency: balance.currency,
                amount: balance.balance,
            },
            payouts: payouts.map(p => ({
                id: p.id,
                amount: p.amount,
                currency: p.currency,
                memo: p.memo,
                status: p.status,
                txSignature: p.txSignature,
                createdAt: p.createdAt.toISOString(),
                claimedAt: p.claimedAt?.toISOString(),
            })),
            count: payouts.length,
            limit,
            offset,
        });
    } catch (error) {
        console.error("[recipients/me] Error:", error);
        return NextResponse.json(
            { error: "Failed to load profile" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/recipients/me
 * Body: { walletAddress?, displayName?, notificationsEnabled?, autoWithdraw? }
 */
export async function PATCH(request: NextRequest) {
    try {
        const recipient = await authenticateRecipient(request);
        if (!recipient) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { walletAddress, displayName, notificationsEnabled, autoWithdraw } = body;

        // Validate wallet if provided
        if (walletAddress !== undefined) {
            if (typeof walletAddress !== "string" || walletAddress.length < 32 || walletAddress.length > 44) {
                return NextResponse.json(
                    { error: "Invalid Solana wallet address" },
                    { status: 400 }
                );
            }
        }

        const updated = await updateRecipient(recipient.email, {
            walletAddress,
            displayName,
            notificationsEnabled,
            autoWithdraw,
        });

        if (!updated) {
            return NextResponse.json(
                { error: "Failed to update profile" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            id: updated.id,
            email: updated.email,
            walletAddress: updated.walletAddress,
            displayName: updated.displayName,
            notificationsEnabled: updated.notificationsEnabled,
            autoWithdraw: updated.autoWithdraw,
            updatedAt: updated.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error("[recipients/me] Error updating:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
