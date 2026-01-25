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

                try {
                    console.log("[Gasless] signAndSend: Signing and submitting transaction...");
                    const signer = await getKoraSigner(client);
                    console.log("[Gasless] Using signer:", signer.signerAddress);

                    const result = await client.signAndSendTransaction({
                        transaction,
                        signer_key: signer.signerAddress,
                    });

                    console.log("[Gasless] signAndSendTransaction result:", JSON.stringify(result));

                    // Cast to access potential fields returned by API
                    const response = result as unknown as {
                        signed_transaction?: string;
                        signature?: string;
                        transaction_hash?: string;
                    };

                    // Try to get signature from response or extract from signed tx
                    let signature = response.signature || response.transaction_hash;

                    if (!signature && response.signed_transaction) {
                        // Extract signature from the signed transaction
                        try {
                            const { VersionedTransaction, Transaction } = await import("@solana/web3.js");
                            const bs58 = await import("bs58");
                            const txBytes = Buffer.from(response.signed_transaction, "base64");

                            try {
                                const vtx = VersionedTransaction.deserialize(txBytes);
                                if (vtx.signatures[0] && !vtx.signatures[0].every(b => b === 0)) {
                                    signature = bs58.default.encode(vtx.signatures[0]);
                                    console.log("[Gasless] Extracted signature from versioned tx:", signature);
                                }
                            } catch {
                                const tx = Transaction.from(txBytes);
                                if (tx.signature) {
                                    signature = bs58.default.encode(tx.signature);
                                    console.log("[Gasless] Extracted signature from legacy tx:", signature);
                                }
                            }
                        } catch (extractErr) {
                            console.log("[Gasless] Could not extract signature:", extractErr);
                        }
                    }

                    return NextResponse.json({
                        signedTransaction: response.signed_transaction,
                        signature,
                        success: true,
                    });
                } catch (txError) {
                    const errorMessage = txError instanceof Error ? txError.message : String(txError);
                    console.error("[Gasless] signAndSend error:", errorMessage);

                    // Handle "already processed" - this means the transaction succeeded previously
                    if (errorMessage.includes('already been processed') ||
                        errorMessage.includes('AlreadyProcessed') ||
                        errorMessage.includes('-32002')) {
                        console.log('[Gasless] Transaction already processed - treating as success');

                        // Try to extract signature from the transaction if possible
                        // The transaction was already submitted successfully
                        return NextResponse.json({
                            signedTransaction: transaction,
                            signature: null, // Signature unknown but tx succeeded
                            alreadyProcessed: true,
                            message: 'Transaction was already processed successfully'
                        });
                    }

                    // Re-throw other errors
                    throw txError;
                }
            }

            case "transfer": {
                const { amount, token, source, destination, nonce } = body;
                if (!amount || !token || !source || !destination) {
                    return NextResponse.json(
                        { error: "Missing transfer parameters" },
                        { status: 400 }
                    );
                }

                // Platform fee configuration
                const PLATFORM_FEE_BPS = 100; // 1% = 100 basis points
                const PROGRAM_ID_STR = "339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5";

                // Calculate fee split
                const totalAmount = BigInt(amount);
                const platformFee = (totalAmount * BigInt(PLATFORM_FEE_BPS)) / BigInt(10000);
                const merchantAmount = totalAmount - platformFee;

                console.log(`[Gasless] Creating transfer: ${amount} of ${token} from ${source} to ${destination} (nonce: ${nonce || 'none'})`);
                console.log(`[Gasless] Fee split: merchant=${merchantAmount}, platform=${platformFee}`);

                // Import required modules
                const { Connection, PublicKey, Transaction } = await import("@solana/web3.js");
                const {
                    getAssociatedTokenAddress,
                    createTransferInstruction,
                    createAssociatedTokenAccountInstruction,
                    getAccount,
                } = await import("@solana/spl-token");

                const connection = new Connection(
                    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
                    "confirmed"
                );

                const sourcePubkey = new PublicKey(source);
                const destinationPubkey = new PublicKey(destination);
                const tokenMint = new PublicKey(token);
                const programId = new PublicKey(PROGRAM_ID_STR);

                // Platform Treasury PDA (on-chain treasury token account)
                const [treasuryPDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from("platform_treasury")],
                    programId
                );

                // Get ATAs
                const sourceAta = await getAssociatedTokenAddress(tokenMint, sourcePubkey);
                const destinationAta = await getAssociatedTokenAddress(tokenMint, destinationPubkey);

                // Get Kora signer for fee payer
                const koraSigner = await getKoraSigner();
                const feePayerPubkey = new PublicKey(koraSigner.signerAddress);

                const tx = new Transaction();

                // Check if destination ATA exists
                try {
                    await getAccount(connection, destinationAta);
                } catch {
                    tx.add(
                        createAssociatedTokenAccountInstruction(
                            feePayerPubkey,
                            destinationAta,
                            destinationPubkey,
                            tokenMint
                        )
                    );
                }

                // Treasury is already initialized on-chain, no need to create

                // Transfer merchant amount (99%)
                tx.add(
                    createTransferInstruction(
                        sourceAta,
                        destinationAta,
                        sourcePubkey,
                        merchantAmount
                    )
                );

                // Transfer platform fee (1%)
                if (platformFee > BigInt(0)) {
                    tx.add(
                        createTransferInstruction(
                            sourceAta,
                            treasuryPDA,
                            sourcePubkey,
                            platformFee
                        )
                    );
                    console.log(`[Gasless] Added fee transfer: ${platformFee} to treasury ${treasuryPDA.toBase58()}`);
                }

                // Get blockhash and set fee payer
                const { blockhash } = await connection.getLatestBlockhash("confirmed");
                tx.recentBlockhash = blockhash;
                tx.feePayer = feePayerPubkey;

                // Serialize for client signing
                const serialized = tx.serialize({
                    requireAllSignatures: false,
                    verifySignatures: false,
                }).toString("base64");

                console.log(`[Gasless] Transfer transaction created with fee split`);

                return NextResponse.json({
                    transaction: serialized,
                    nonce: nonce,
                    platformFee: platformFee.toString(),
                    merchantAmount: merchantAmount.toString(),
                });
            }

            case "broadcast": {
                // Broadcast a fully-signed transaction directly to Solana
                // Use this when the transaction is already signed by all parties
                if (!transaction) {
                    return NextResponse.json(
                        { error: "Missing transaction" },
                        { status: 400 }
                    );
                }

                console.log("[Gasless] Broadcasting fully-signed transaction to Solana...");

                const { Connection } = await import("@solana/web3.js");
                const connection = new Connection(
                    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
                    "confirmed"
                );

                try {
                    // Decode the base64 transaction
                    const txBuffer = Buffer.from(transaction, "base64");

                    // Send the transaction
                    const signature = await connection.sendRawTransaction(txBuffer, {
                        skipPreflight: false,
                        preflightCommitment: "confirmed",
                    });

                    console.log("[Gasless] Transaction broadcast, signature:", signature);

                    // Wait for confirmation
                    const confirmation = await connection.confirmTransaction(signature, "confirmed");

                    if (confirmation.value.err) {
                        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
                    }

                    console.log("[Gasless] Transaction confirmed!");

                    return NextResponse.json({
                        signature,
                        confirmed: true,
                    });
                } catch (broadcastError) {
                    const errorMessage = broadcastError instanceof Error ? broadcastError.message : String(broadcastError);

                    // Handle "already processed" as success
                    if (errorMessage.includes('already been processed') ||
                        errorMessage.includes('AlreadyProcessed') ||
                        errorMessage.includes('has already been processed')) {
                        console.log('[Gasless] Transaction already processed - treating as success');
                        return NextResponse.json({
                            signature: null,
                            alreadyProcessed: true,
                            message: 'Transaction was already processed successfully'
                        });
                    }

                    throw broadcastError;
                }
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
