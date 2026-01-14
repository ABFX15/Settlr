import { NextRequest, NextResponse } from "next/server";
import { getPaymentsByMerchant, getPaymentsByMerchantWallet, getMerchant, getMerchantByWallet } from "@/lib/db";

/**
 * GET /api/merchants/[id]/export
 * 
 * Export merchant payments as CSV for accounting software
 * Compatible with QuickBooks, Xero, Wave, FreshBooks
 * 
 * The [id] param can be either:
 * - A merchant UUID
 * - A wallet address (for dashboard usage)
 * 
 * Query params:
 * - format: "csv" (default) | "json"
 * - from: ISO date string (optional)
 * - to: ISO date string (optional)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);

        const format = searchParams.get("format") || "csv";
        const fromDate = searchParams.get("from");
        const toDate = searchParams.get("to");

        // Try to find merchant by ID first, then by wallet address
        let merchant = await getMerchant(id);
        let payments;

        if (merchant) {
            payments = await getPaymentsByMerchant(id);
        } else {
            // Try wallet address lookup
            merchant = await getMerchantByWallet(id);
            if (!merchant) {
                // No merchant record, but might still have payments by wallet
                payments = await getPaymentsByMerchantWallet(id);
                if (payments.length === 0) {
                    return NextResponse.json(
                        { error: "Merchant not found" },
                        { status: 404 }
                    );
                }
                // Create a pseudo-merchant object for the export
                merchant = {
                    id: id,
                    name: "Merchant",
                    walletAddress: id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            } else {
                payments = await getPaymentsByMerchantWallet(id);
            }
        }
        // Filter by date range if provided
        if (fromDate) {
            const from = new Date(fromDate).getTime();
            payments = payments.filter(p => p.completedAt >= from);
        }
        if (toDate) {
            const to = new Date(toDate).getTime();
            payments = payments.filter(p => p.completedAt <= to);
        }

        // Calculate fee (0.5% platform fee)
        const FEE_BPS = 50; // 0.5%

        if (format === "json") {
            const jsonData = payments.map(p => ({
                date: new Date(p.completedAt).toISOString().split("T")[0],
                transactionId: p.id,
                txSignature: p.txSignature,
                customerWallet: p.customerWallet,
                amount: p.amount,
                fee: Number((p.amount * FEE_BPS / 10000).toFixed(2)),
                netAmount: Number((p.amount * (1 - FEE_BPS / 10000)).toFixed(2)),
                currency: p.currency,
                status: p.status,
                description: p.description || "",
                refundedAmount: p.refundedAmount || 0,
            }));

            return NextResponse.json({
                merchant: {
                    id: merchant.id,
                    name: merchant.name,
                    wallet: merchant.walletAddress,
                },
                exportDate: new Date().toISOString(),
                totalPayments: payments.length,
                totalVolume: payments.reduce((sum, p) => sum + p.amount, 0),
                payments: jsonData,
            });
        }

        // Generate CSV
        const csvHeaders = [
            "Date",
            "Transaction ID",
            "Solana TX",
            "Customer Wallet",
            "Gross Amount",
            "Fee (0.5%)",
            "Net Amount",
            "Currency",
            "Status",
            "Description",
            "Refunded Amount",
        ];

        const csvRows = payments.map(p => {
            const fee = Number((p.amount * FEE_BPS / 10000).toFixed(2));
            const net = Number((p.amount - fee).toFixed(2));

            return [
                new Date(p.completedAt).toISOString().split("T")[0],
                p.id,
                p.txSignature,
                p.customerWallet,
                p.amount.toFixed(2),
                fee.toFixed(2),
                net.toFixed(2),
                p.currency,
                p.status,
                `"${(p.description || "").replace(/"/g, '""')}"`,
                (p.refundedAmount || 0).toFixed(2),
            ].join(",");
        });

        // Add summary row
        const totalGross = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalFees = Number((totalGross * FEE_BPS / 10000).toFixed(2));
        const totalNet = Number((totalGross - totalFees).toFixed(2));
        const totalRefunded = payments.reduce((sum, p) => sum + (p.refundedAmount || 0), 0);

        csvRows.push(""); // Empty row before summary
        csvRows.push(`TOTALS,${payments.length} transactions,,,$${totalGross.toFixed(2)},$${totalFees.toFixed(2)},$${totalNet.toFixed(2)},USDC,,,${totalRefunded.toFixed(2)}`);

        const csv = [csvHeaders.join(","), ...csvRows].join("\n");

        // Generate filename
        const dateStr = new Date().toISOString().split("T")[0];
        const filename = `settlr-payments-${merchant.name.toLowerCase().replace(/\s+/g, "-")}-${dateStr}.csv`;

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json(
            { error: "Failed to export payments" },
            { status: 500 }
        );
    }
}
