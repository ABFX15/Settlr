import { NextRequest, NextResponse } from "next/server";
import {
    getKoraClient,
    isKoraEnabled,
    getKoraSigner,
    getSupportedTokens,
} from "@/lib/kora";

/**
 * GET /api/gasless
 * 
 * Returns gasless configuration and status
 */
export async function GET() {
    try {
        if (!isKoraEnabled()) {
            return NextResponse.json({
                enabled: false,
                message: "Gasless transactions not configured. Set NEXT_PUBLIC_KORA_RPC_URL.",
            });
        }

        const client = getKoraClient();
        const signer = await getKoraSigner(client);
        const supportedTokens = await getSupportedTokens(client);

        return NextResponse.json({
            enabled: true,
            feePayer: signer.signerAddress,
            paymentDestination: signer.paymentDestination,
            supportedTokens,
        });
    } catch (error) {
        console.error("Gasless config error:", error);
        return NextResponse.json(
            { enabled: false, error: "Failed to connect to Kora" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/gasless
 * 
 * Handles gasless transaction operations:
 * - action: "estimate" - Estimate transaction fee
 * - action: "sign" - Sign transaction with Kora
 * - action: "signAndSend" - Sign and submit transaction
 */
export async function POST(req: NextRequest) {
    try {
        if (!isKoraEnabled()) {
            return NextResponse.json(
                { error: "Gasless not configured" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { action, transaction, feeToken, sourceWallet } = body;

        const client = getKoraClient();

        switch (action) {
            case "estimate": {
                if (!transaction || !feeToken) {
                    return NextResponse.json(
                        { error: "Missing transaction or feeToken" },
                        { status: 400 }
                    );
                }

                const estimate = await client.estimateTransactionFee({
                    transaction,
                    fee_token: feeToken,
                });

                return NextResponse.json({
                    lamports: estimate.fee_in_lamports,
                    tokenAmount: estimate.fee_in_token,
                    tokenMint: feeToken,
                });
            }

            case "payment": {
                if (!transaction || !feeToken || !sourceWallet) {
                    return NextResponse.json(
                        { error: "Missing transaction, feeToken, or sourceWallet" },
                        { status: 400 }
                    );
                }

                const paymentInstruction = await client.getPaymentInstruction({
                    transaction,
                    fee_token: feeToken,
                    source_wallet: sourceWallet,
                });

                return NextResponse.json({
                    paymentInstruction: paymentInstruction.payment_instruction,
                });
            }

            case "sign": {
                if (!transaction) {
                    return NextResponse.json(
                        { error: "Missing transaction" },
                        { status: 400 }
                    );
                }

                const signer = await getKoraSigner(client);
                const result = await client.signTransaction({
                    transaction,
                    signer_key: signer.signerAddress,
                });

                return NextResponse.json({
                    signedTransaction: result.signed_transaction,
                });
            }

            case "signAndSend": {
                if (!transaction) {
                    return NextResponse.json(
                        { error: "Missing transaction" },
                        { status: 400 }
                    );
                }

                const signer = await getKoraSigner(client);
                const result = await client.signAndSendTransaction({
                    transaction,
                    signer_key: signer.signerAddress,
                });

                // Cast to access potential signature field returned by API
                const response = result as unknown as {
                    signed_transaction: string;
                    signature?: string;
                };

                return NextResponse.json({
                    signedTransaction: response.signed_transaction,
                    signature: response.signature,
                });
            }

            case "transfer": {
                const { amount, token, source, destination } = body;
                if (!amount || !token || !source || !destination) {
                    return NextResponse.json(
                        { error: "Missing transfer parameters" },
                        { status: 400 }
                    );
                }

                const result = await client.transferTransaction({
                    amount,
                    token,
                    source,
                    destination,
                });

                return NextResponse.json({
                    transaction: result.transaction,
                    instructions: result.instructions,
                });
            }

            default:
                return NextResponse.json(
                    { error: `Unknown action: ${action}` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("Gasless API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Gasless operation failed" },
            { status: 500 }
        );
    }
}
