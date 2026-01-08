import { NextRequest, NextResponse } from "next/server";
import { createMerchant, createApiKey, getMerchantByWallet } from "@/lib/db";

/**
 * POST /api/merchants/register
 * Register a new merchant and generate an API key
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, websiteUrl, walletAddress, webhookUrl } = body;

        // Validate required fields
        if (!name || typeof name !== "string" || name.trim().length < 2) {
            return NextResponse.json(
                { error: "Business name is required (min 2 characters)" },
                { status: 400 }
            );
        }

        if (!walletAddress || typeof walletAddress !== "string") {
            return NextResponse.json(
                { error: "Wallet address is required" },
                { status: 400 }
            );
        }

        // Validate Solana address format
        const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        if (!solanaAddressRegex.test(walletAddress)) {
            return NextResponse.json(
                { error: "Invalid Solana wallet address" },
                { status: 400 }
            );
        }

        // Check if wallet already registered
        const existingMerchant = await getMerchantByWallet(walletAddress);
        if (existingMerchant) {
            return NextResponse.json(
                { error: "This wallet address is already registered" },
                { status: 409 }
            );
        }

        // Create merchant
        const merchant = await createMerchant({
            name: name.trim(),
            websiteUrl: websiteUrl || null,
            walletAddress,
            webhookUrl: webhookUrl || null,
        });

        // Generate API key (test key for now, can be upgraded later)
        const { apiKey, rawKey } = await createApiKey(
            merchant.id,
            "Default",
            "free",
            true // isTest = true for devnet
        );

        return NextResponse.json({
            success: true,
            merchant: {
                id: merchant.id,
                name: merchant.name,
                walletAddress: merchant.walletAddress,
                createdAt: merchant.createdAt,
            },
            apiKey: rawKey, // Return raw key only once
            apiKeyPrefix: apiKey.keyPrefix,
        });
    } catch (error) {
        console.error("Merchant registration error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Registration failed" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/merchants/register
 * Check if a wallet is already registered
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get("wallet");

        if (!walletAddress) {
            return NextResponse.json(
                { error: "Wallet address is required" },
                { status: 400 }
            );
        }

        const merchant = await getMerchantByWallet(walletAddress);

        return NextResponse.json({
            registered: !!merchant,
            merchant: merchant
                ? {
                    id: merchant.id,
                    name: merchant.name,
                }
                : null,
        });
    } catch (error) {
        console.error("Merchant lookup error:", error);
        return NextResponse.json(
            { error: "Failed to check registration" },
            { status: 500 }
        );
    }
}
