import { NextRequest, NextResponse } from "next/server";
import {
    isPrivyGaslessEnabled,
    getFeePayerAddress,
    getFeePayerWalletId,
    getPrivyClient,
} from "@/lib/privy-server";
import {
    Connection,
    PublicKey,
    Transaction,
    VersionedTransaction,
} from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    createTransferInstruction,
    createAssociatedTokenAccountInstruction,
    getAccount,
} from "@solana/spl-token";

const RPC_ENDPOINT = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"); // Devnet USDC

// Platform fee configuration
const PLATFORM_FEE_BPS = 100; // 1% = 100 basis points
const PROGRAM_ID = new PublicKey("339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5");

// Platform Treasury PDA - this is the actual on-chain treasury token account
// Derived with seeds = ["platform_treasury"]
function getPlatformTreasuryPDA(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_treasury")],
        PROGRAM_ID
    );
    return pda;
}

/**
 * GET /api/sponsor-transaction
 * 
 * Returns gasless configuration - the fee payer address that clients should use
 */
export async function GET() {
    try {
        const enabled = isPrivyGaslessEnabled();
        const feePayerAddress = getFeePayerAddress();

        if (!enabled || !feePayerAddress) {
            return NextResponse.json({
                enabled: false,
                message: "Privy gasless not configured. Set PRIVY_FEE_PAYER_WALLET_ID and PRIVY_FEE_PAYER_ADDRESS.",
            });
        }

        return NextResponse.json({
            enabled: true,
            feePayerAddress,
        });
    } catch (error) {
        console.error("Sponsor config error:", error);
        return NextResponse.json(
            { enabled: false, error: "Failed to get sponsor config" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/sponsor-transaction
 * 
 * Two actions:
 * 1. action: "create" - Create a USDC transfer transaction (server sets blockhash)
 * 2. action: "submit" - Receive user-signed transaction, add fee payer signature, and send
 */
export async function POST(req: NextRequest) {
    try {
        if (!isPrivyGaslessEnabled()) {
            return NextResponse.json(
                { error: "Gasless transactions not configured" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { action } = body;

        const feePayerAddress = getFeePayerAddress();
        const feePayerWalletId = getFeePayerWalletId();

        if (!feePayerAddress || !feePayerWalletId) {
            return NextResponse.json(
                { error: "Fee payer not configured" },
                { status: 400 }
            );
        }

        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const client = getPrivyClient();

        switch (action) {
            case "create": {
                // Create a USDC transfer transaction with fee payer paying gas
                // Includes platform fee collection (1%)
                const { amount, source, destination } = body;

                if (!amount || !source || !destination) {
                    return NextResponse.json(
                        { error: "Missing amount, source, or destination" },
                        { status: 400 }
                    );
                }

                const totalAmount = BigInt(amount);

                // Calculate platform fee (1%)
                const platformFee = (totalAmount * BigInt(PLATFORM_FEE_BPS)) / BigInt(10000);
                const merchantAmount = totalAmount - platformFee;

                console.log(`[Sponsor] Total: ${totalAmount}, Fee: ${platformFee}, Merchant: ${merchantAmount}`);

                const sourcePubkey = new PublicKey(source);
                const destinationPubkey = new PublicKey(destination);
                const feePayerPubkey = new PublicKey(feePayerAddress);

                // Use the on-chain program's treasury PDA (already initialized as token account)
                const treasuryPDA = getPlatformTreasuryPDA();

                const sourceAta = await getAssociatedTokenAddress(USDC_MINT, sourcePubkey);
                const destinationAta = await getAssociatedTokenAddress(USDC_MINT, destinationPubkey);

                const tx = new Transaction();

                // Check if destination (merchant) ATA exists
                try {
                    await getAccount(connection, destinationAta);
                } catch {
                    // Create ATA - fee payer pays for this
                    tx.add(
                        createAssociatedTokenAccountInstruction(
                            feePayerPubkey, // Fee payer pays for account creation
                            destinationAta,
                            destinationPubkey,
                            USDC_MINT
                        )
                    );
                }

                // Treasury is already initialized on-chain, no need to create

                // Transfer merchant amount (99%) to merchant
                tx.add(
                    createTransferInstruction(
                        sourceAta,
                        destinationAta,
                        sourcePubkey, // User is the authority
                        merchantAmount
                    )
                );

                // Transfer platform fee (1%) to treasury
                if (platformFee > BigInt(0)) {
                    tx.add(
                        createTransferInstruction(
                            sourceAta,
                            treasuryPDA,
                            sourcePubkey, // User is the authority
                            platformFee
                        )
                    );
                    console.log(`[Sponsor] Added fee transfer: ${platformFee} to treasury ${treasuryPDA.toBase58()}`);
                }

                // Get REAL blockhash from our RPC - we'll use this same RPC to send later
                const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
                tx.recentBlockhash = blockhash;
                tx.feePayer = feePayerPubkey; // Fee payer pays gas

                // Serialize for client signing
                const serialized = tx.serialize({
                    requireAllSignatures: false,
                    verifySignatures: false,
                }).toString("base64");

                return NextResponse.json({
                    transaction: serialized,
                    blockhash,
                    lastValidBlockHeight,
                    feePayerAddress,
                    platformFee: platformFee.toString(),
                    merchantAmount: merchantAmount.toString(),
                });
            }

            case "submit": {
                // Receive user-signed transaction, add fee payer signature, and send
                const { transaction } = body;

                if (!transaction) {
                    return NextResponse.json(
                        { error: "Missing transaction" },
                        { status: 400 }
                    );
                }

                // Deserialize the transaction (user has already signed it)
                const txBuffer = Buffer.from(transaction, "base64");
                let tx: Transaction | VersionedTransaction;
                try {
                    tx = VersionedTransaction.deserialize(txBuffer);
                } catch {
                    tx = Transaction.from(txBuffer);
                }

                // Use Privy to SIGN ONLY (not send) as fee payer
                // This preserves the blockhash we set in the "create" step
                const signResult = await client.walletApi.solana.signTransaction({
                    walletId: feePayerWalletId,
                    transaction: tx,
                });

                // Now send via our own RPC (same one we used for blockhash)
                const signedTx = signResult.signedTransaction;
                let signature: string;

                if (signedTx instanceof VersionedTransaction) {
                    signature = await connection.sendTransaction(signedTx, {
                        skipPreflight: true,
                        maxRetries: 3,
                    });
                } else {
                    signature = await connection.sendRawTransaction(signedTx.serialize(), {
                        skipPreflight: true,
                        maxRetries: 3,
                    });
                }

                // Wait for confirmation
                await connection.confirmTransaction(signature, "confirmed");

                return NextResponse.json({
                    transactionHash: signature,
                    message: "Transaction sponsored and sent successfully",
                });
            }

            default:
                return NextResponse.json(
                    { error: `Unknown action: ${action}. Use 'create' or 'submit'` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("Sponsor transaction error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to process transaction",
            },
            { status: 500 }
        );
    }
}
