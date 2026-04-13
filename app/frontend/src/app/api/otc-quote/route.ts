import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/otc-quote — Request an OTC desk quote for large USDC purchases
 *
 * For wholesale B2B payments above ~$25K, card and ACH on-ramps
 * are either too slow or exceed their limits. OTC desks provide:
 *   - Competitive pricing (0.1-0.5% vs 3.5% card fees)
 *   - Same-day settlement for wire transfers
 *   - Dedicated account management
 *
 * In production this would integrate with Circle, Cumberland, Galaxy,
 * or a similar institutional OTC provider API.
 */

// In-memory store for quote requests
const quoteRequests: {
    id: string;
    walletAddress: string;
    amount: number;
    email: string;
    status: "pending" | "quoted" | "accepted" | "expired";
    indicativeRate?: number;
    expiresAt?: string;
    createdAt: string;
}[] = [];

export async function POST(request: NextRequest) {
    const rateLimited = await checkRateLimit(`otc:${getClientIp(request)}`);
    if (rateLimited) return rateLimited;

    // OTC desk integration not yet available — requires a real provider (Circle, Cumberland, etc.)
    if (process.env.OTC_PROVIDER_ENABLED !== "true") {
        return NextResponse.json(
            {
                error: "OTC desk integration coming soon",
                message: "Large USDC purchases via wire transfer will be available once we onboard an OTC provider. Contact support@settlr.dev for manual assistance with orders over $25K.",
            },
            { status: 503 },
        );
    }

    try {
        const body = await request.json();
        const { walletAddress, amount, email } = body;

        if (
            !walletAddress ||
            typeof walletAddress !== "string" ||
            walletAddress.length < 32
        ) {
            return NextResponse.json(
                { error: "Valid Solana wallet address required" },
                { status: 400 },
            );
        }
        if (!amount || typeof amount !== "number" || amount < 25_000) {
            return NextResponse.json(
                { error: "OTC desk minimum is $25,000" },
                { status: 400 },
            );
        }
        if (!email || typeof email !== "string" || !email.includes("@")) {
            return NextResponse.json(
                { error: "Valid email required for OTC communication" },
                { status: 400 },
            );
        }

        const quoteId = `otc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        // Indicative rate (in production: fetch live from OTC provider)
        // OTC desks typically offer near-peg pricing for USDC
        const indicativeRate = 1.0 + (amount > 500_000 ? 0.001 : 0.003);

        const expiresAt = new Date(
            Date.now() + 15 * 60 * 1000,
        ).toISOString(); // 15 min

        quoteRequests.push({
            id: quoteId,
            walletAddress,
            amount,
            email,
            status: "quoted",
            indicativeRate,
            expiresAt,
            createdAt: new Date().toISOString(),
        });

        console.log(
            `[otc-quote] New request: $${amount.toLocaleString()} for ${walletAddress.slice(0, 8)}… (${email})`,
        );

        // In production:
        // 1. POST to Circle/Cumberland API for a firm quote
        // 2. Send email to buyer with wire instructions
        // 3. Send email to OTC desk team for manual followup

        return NextResponse.json({
            quoteId,
            status: "quoted",
            amount,
            indicativeRate,
            indicativeTotal: Math.ceil(amount * indicativeRate * 100) / 100,
            currency: "USD",
            deliveryCurrency: "USDC (Solana)",
            deliveryAddress: walletAddress,
            expiresAt,
            wireInstructions: {
                bankName: "Partner Bank (via OTC Provider)",
                accountName: "Settlr OTC Trading LLC",
                routingNumber: "Contact support for details",
                accountNumber: "Contact support for details",
                reference: quoteId,
                note: "Wire instructions will be sent to your email within 5 minutes.",
            },
            estimatedDelivery: "Same day for wires received before 3 PM ET",
        });
    } catch (err) {
        console.error("[otc-quote] POST error:", err);
        return NextResponse.json(
            { error: "Failed to request OTC quote" },
            { status: 500 },
        );
    }
}

/** GET /api/otc-quote?id=xxx — Check quote status */
export async function GET(request: NextRequest) {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
        return NextResponse.json(
            { error: "Quote ID required" },
            { status: 400 },
        );
    }

    const quote = quoteRequests.find((q) => q.id === id);
    if (!quote) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Check expiry
    if (
        quote.expiresAt &&
        new Date(quote.expiresAt) < new Date() &&
        quote.status === "quoted"
    ) {
        quote.status = "expired";
    }

    return NextResponse.json(quote);
}
