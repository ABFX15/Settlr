import { NextRequest, NextResponse } from "next/server";
import { createApiKey, getApiKeysByMerchant, revokeApiKey, getOrCreateMerchantByWallet } from "@/lib/db";

/**
 * Resolve a merchantId — if it looks like a Solana wallet address (base58, ~32-44 chars)
 * rather than a UUID, look up (or create) the merchant record and return the UUID.
 */
async function resolveMerchantId(merchantId: string): Promise<string> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(merchantId);
    if (isUuid) return merchantId;

    // Treat as a Solana wallet address → resolve to merchant UUID
    const merchant = await getOrCreateMerchantByWallet(merchantId);
    return merchant.id;
}

/**
 * POST /api/sdk/keys
 * Create a new API key for a merchant
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { merchantId: rawMerchantId, name, tier, isTest } = body;

        if (!rawMerchantId) {
            return NextResponse.json(
                { error: "Merchant ID required" },
                { status: 400 }
            );
        }

        const merchantId = await resolveMerchantId(rawMerchantId);

        const { apiKey, rawKey } = await createApiKey(
            merchantId,
            name || "Default",
            tier || "free",
            isTest || false
        );

        // Return the raw key only once - user must save it
        return NextResponse.json({
            success: true,
            key: rawKey,
            keyPrefix: apiKey.keyPrefix,
            id: apiKey.id,
            tier: apiKey.tier,
            rateLimit: apiKey.rateLimit,
            message: "Save this key securely. It won't be shown again.",
        });
    } catch (error) {
        console.error("Error creating API key:", error);
        return NextResponse.json(
            { error: "Failed to create API key" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/sdk/keys?merchantId=xxx
 * List all API keys for a merchant
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const rawMerchantId = searchParams.get("merchantId");

        if (!rawMerchantId) {
            return NextResponse.json(
                { error: "Merchant ID required" },
                { status: 400 }
            );
        }

        const merchantId = await resolveMerchantId(rawMerchantId);
        console.log("[API Keys] Fetching keys for merchantId:", merchantId, "(resolved from:", rawMerchantId, ")");
        const keys = await getApiKeysByMerchant(merchantId);
        console.log("[API Keys] Found", keys.length, "keys for merchant");

        // Return keys without the actual key hash
        return NextResponse.json({
            keys: keys.map((k) => ({
                id: k.id,
                keyPrefix: k.keyPrefix,
                name: k.name,
                tier: k.tier,
                rateLimit: k.rateLimit,
                requestCount: k.requestCount,
                lastUsedAt: k.lastUsedAt,
                createdAt: k.createdAt,
                active: k.active,
            })),
        });
    } catch (error) {
        console.error("Error listing API keys:", error);
        return NextResponse.json(
            { error: "Failed to list API keys" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/sdk/keys
 * Revoke an API key
 */
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { keyId } = body;

        if (!keyId) {
            return NextResponse.json(
                { error: "Key ID required" },
                { status: 400 }
            );
        }

        const success = await revokeApiKey(keyId);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to revoke key" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: "API key revoked" });
    } catch (error) {
        console.error("Error revoking API key:", error);
        return NextResponse.json(
            { error: "Failed to revoke API key" },
            { status: 500 }
        );
    }
}
