import { NextRequest, NextResponse } from "next/server";

const RANGE_API_KEY = process.env.RANGE_API_KEY;
const RANGE_API_URL = "https://api.range.org/v1/risk";

// Risk score thresholds
const BLOCK_THRESHOLD = 7; // Block payments to wallets with score >= 7 (high risk)
const WARN_THRESHOLD = 5; // Warn for scores >= 5 (medium risk)

interface RiskResponse {
    riskScore: number;
    riskLevel: string;
    numHops: number;
    maliciousAddressesFound: Array<{
        address: string;
        distance: number;
        name_tag: string | null;
        entity: string | null;
        category: string;
    }>;
    reasoning: string;
    attribution?: {
        name_tag: string;
        entity: string;
        category: string;
        address_role: string;
    } | null;
}

/**
 * GET /api/risk-check
 * 
 * Check if a wallet address is safe to receive payments.
 * Uses Range Security API for wallet risk scoring.
 * 
 * Query params:
 * - address: The wallet address to check
 * - network: The blockchain network (default: solana)
 */
export async function GET(req: NextRequest) {
    try {
        const address = req.nextUrl.searchParams.get("address");
        const network = req.nextUrl.searchParams.get("network") || "solana";

        if (!address) {
            return NextResponse.json(
                { error: "Missing address parameter" },
                { status: 400 }
            );
        }

        if (!RANGE_API_KEY) {
            console.warn("[Range] API key not configured, skipping risk check");
            return NextResponse.json({
                safe: true,
                riskScore: 0,
                riskLevel: "Unknown",
                reasoning: "Risk check not configured",
                skipped: true,
            });
        }

        // Call Range API for address risk score
        const response = await fetch(
            `${RANGE_API_URL}/address?address=${encodeURIComponent(address)}&network=${encodeURIComponent(network)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${RANGE_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[Range] API error:", response.status, errorText);

            // Don't block payments if Range is unavailable
            if (response.status === 429) {
                return NextResponse.json({
                    safe: true,
                    riskScore: 0,
                    riskLevel: "Unknown",
                    reasoning: "Rate limited, allowing transaction",
                    skipped: true,
                });
            }

            return NextResponse.json({
                safe: true,
                riskScore: 0,
                riskLevel: "Unknown",
                reasoning: "Risk check unavailable",
                skipped: true,
            });
        }

        const data: RiskResponse = await response.json();

        // Determine if wallet is safe
        const isSafe = data.riskScore < BLOCK_THRESHOLD;
        const isWarning = data.riskScore >= WARN_THRESHOLD && data.riskScore < BLOCK_THRESHOLD;

        console.log(
            `[Range] Address ${address.slice(0, 8)}... risk score: ${data.riskScore} (${data.riskLevel})`
        );

        return NextResponse.json({
            safe: isSafe,
            warning: isWarning,
            blocked: !isSafe,
            riskScore: data.riskScore,
            riskLevel: data.riskLevel,
            numHops: data.numHops,
            reasoning: data.reasoning,
            maliciousConnections: data.maliciousAddressesFound?.length || 0,
            attribution: data.attribution,
        });
    } catch (error) {
        console.error("[Range] Risk check error:", error);

        // Don't block payments on errors - fail open
        return NextResponse.json({
            safe: true,
            riskScore: 0,
            riskLevel: "Unknown",
            reasoning: "Risk check failed",
            skipped: true,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

/**
 * POST /api/risk-check
 * 
 * Full payment risk assessment using Range's payment endpoint.
 * Checks both sender and recipient for comprehensive risk analysis.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            senderAddress,
            recipientAddress,
            amount,
            network = "solana"
        } = body;

        if (!senderAddress || !recipientAddress || !amount) {
            return NextResponse.json(
                { error: "Missing required parameters: senderAddress, recipientAddress, amount" },
                { status: 400 }
            );
        }

        if (!RANGE_API_KEY) {
            console.warn("[Range] API key not configured, skipping payment risk check");
            return NextResponse.json({
                safe: true,
                overallRiskLevel: "unknown",
                riskFactors: [],
                skipped: true,
            });
        }

        // Call Range Payment Risk Assessment API
        const params = new URLSearchParams({
            sender_address: senderAddress,
            recipient_address: recipientAddress,
            amount: amount.toString(),
            sender_network: network,
            recipient_network: network,
        });

        const response = await fetch(
            `${RANGE_API_URL}/payment?${params.toString()}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${RANGE_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[Range] Payment risk API error:", response.status, errorText);

            return NextResponse.json({
                safe: true,
                overallRiskLevel: "unknown",
                riskFactors: [],
                skipped: true,
                reason: "Payment risk check unavailable",
            });
        }

        const data = await response.json();

        const isSafe = data.overall_risk_level !== "high";
        const isWarning = data.overall_risk_level === "medium";

        console.log(
            `[Range] Payment risk: ${data.overall_risk_level} (${data.risk_factors?.length || 0} factors)`
        );

        return NextResponse.json({
            safe: isSafe,
            warning: isWarning,
            blocked: !isSafe,
            overallRiskLevel: data.overall_risk_level,
            riskFactors: data.risk_factors || [],
            processingTimeMs: data.processing_time_ms,
        });
    } catch (error) {
        console.error("[Range] Payment risk check error:", error);

        return NextResponse.json({
            safe: true,
            overallRiskLevel: "unknown",
            riskFactors: [],
            skipped: true,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}
