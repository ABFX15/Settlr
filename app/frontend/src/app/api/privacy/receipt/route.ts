/**
 * Private Receipt API v2
 * 
 * Issues FHE-encrypted private receipts for payments using Inco Lightning.
 * Only authorized parties (merchant + customer) can decrypt payment amounts.
 * 
 * Uses @inco/solana-sdk for real client-side encryption.
 * Stores encrypted handles in Supabase for off-chain verification.
 * 
 * POST: Issue a private receipt for a completed payment
 * GET: Retrieve/verify a private receipt
 */

import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';
import {
    encryptAmount,
    usdcToMicroUnits,
    findPrivateReceiptPda as findReceiptPda,
    findAllowancePda as findAllowance,
    INCO_LIGHTNING_PROGRAM_ID,
    SETTLR_PROGRAM_ID,
} from '@/lib/inco-lightning';

// Flag to use real Inco encryption vs simulated
const USE_REAL_INCO_ENCRYPTION = true;

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

/**
 * Generate an encrypted handle using Inco Lightning FHE encryption.
 * 
 * When USE_REAL_INCO_ENCRYPTION is true:
 * - Uses @inco/solana-sdk to encrypt the amount with Inco's TEE public key
 * - Returns the ciphertext hex which can be used with the on-chain program
 * 
 * When false (fallback):
 * - Uses SHA-256 to generate a deterministic handle (for testing)
 */
async function generateEncryptedHandle(
    paymentId: string,
    amount: number,
    customer: string,
    merchant: string
): Promise<{ handle: string; hash: string; ciphertext?: string; isRealEncryption: boolean }> {

    if (USE_REAL_INCO_ENCRYPTION) {
        try {
            // Convert USDC amount to micro-units (6 decimals)
            const microUnits = usdcToMicroUnits(amount);

            // Encrypt using Inco SDK - this calls Inco's TEE endpoint
            const ciphertextHex = await encryptAmount(microUnits);

            console.log('[Privacy] Real Inco encryption successful');
            console.log(`  Amount: $${amount} USDC → ${microUnits} micro-units`);
            console.log(`  Ciphertext: ${ciphertextHex.slice(0, 32)}...`);

            // Generate a handle from the ciphertext (first 16 bytes as u128)
            const ciphertextBytes = Buffer.from(ciphertextHex.replace(/^0x/, ''), 'hex');
            let handle = BigInt(0);
            for (let i = 15; i >= 0 && i < ciphertextBytes.length; i--) {
                handle = (handle << BigInt(8)) | BigInt(ciphertextBytes[i]);
            }

            // Short hash for display
            const hashHex = ciphertextHex.slice(2, 18); // First 8 bytes after 0x

            return {
                handle: handle.toString(),
                hash: hashHex,
                ciphertext: ciphertextHex,
                isRealEncryption: true
            };
        } catch (error) {
            console.error('[Privacy] Real Inco encryption failed, falling back to simulated:', error);
            // Fall through to simulated encryption
        }
    }

    // Fallback: Simulated encryption using SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(`${paymentId}:${amount}:${customer}:${merchant}:${Date.now()}`);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
    const hashArray = new Uint8Array(hashBuffer);

    let handle = BigInt(0);
    for (let i = 15; i >= 0; i--) {
        handle = (handle << BigInt(8)) | BigInt(hashArray[i]);
    }

    const hashHex = Array.from(hashArray.slice(0, 8))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return {
        handle: handle.toString(),
        hash: hashHex,
        isRealEncryption: false
    };
}

/**
 * Find the private receipt PDA (for on-chain verification)
 */
function findPrivateReceiptPda(paymentId: string): [PublicKey, number] {
    return findReceiptPda(paymentId);
}

/**
 * Find allowance PDA for a given handle and address
 */
function findAllowancePda(handle: bigint, allowedAddress: PublicKey): [PublicKey, number] {
    return findAllowance(handle, allowedAddress);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, paymentId, amount, customer, merchant, txSignature } = body;

        if (!action) {
            return NextResponse.json(
                { error: 'Missing action parameter' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'issue':
            case 'simulate': {
                // Issue a private receipt for a completed payment
                // 'simulate' and 'issue' do the same thing in demo mode
                if (!paymentId || amount === undefined || !customer || !merchant) {
                    return NextResponse.json(
                        { error: 'Missing required parameters: paymentId, amount, customer, merchant' },
                        { status: 400 }
                    );
                }

                // Validate addresses
                try {
                    new PublicKey(customer);
                    new PublicKey(merchant);
                } catch {
                    return NextResponse.json(
                        { error: 'Invalid wallet address format' },
                        { status: 400 }
                    );
                }

                // Generate encrypted handle using Inco Lightning
                const encryptionResult = await generateEncryptedHandle(
                    paymentId,
                    amount,
                    customer,
                    merchant
                );

                const { handle, hash, ciphertext, isRealEncryption } = encryptionResult;

                // Derive PDAs
                const [privateReceiptPda] = findPrivateReceiptPda(paymentId);
                const handleBigInt = BigInt(handle);
                const [customerAllowancePda] = findAllowancePda(handleBigInt, new PublicKey(customer));
                const [merchantAllowancePda] = findAllowancePda(handleBigInt, new PublicKey(merchant));

                // Store in Supabase if configured
                let stored = false;
                if (supabase) {
                    try {
                        const { error } = await supabase
                            .from('privacy_receipts')
                            .upsert({
                                payment_id: paymentId,
                                customer_wallet: customer,
                                merchant_wallet: merchant,
                                encrypted_handle: handle,
                                encrypted_hash: hash,
                                encrypted_ciphertext: ciphertext,
                                payment_timestamp: new Date().toISOString(),
                                privacy_version: 1,
                                encryption_method: isRealEncryption ? 'inco_lightning_fhe' : 'simulated_sha256',
                                customer_allowance_granted: true,
                                merchant_allowance_granted: true,
                                status: 'active'
                            }, {
                                onConflict: 'payment_id'
                            });

                        if (!error) {
                            stored = true;
                            console.log('[Privacy] Receipt stored in Supabase:', paymentId);
                        } else {
                            console.warn('[Privacy] Supabase storage error:', error);
                        }
                    } catch (err) {
                        console.warn('[Privacy] Supabase error:', err);
                    }
                }

                return NextResponse.json({
                    success: true,
                    action: action,
                    paymentId,

                    // Encrypted handle from Inco Lightning
                    handle,
                    encryptedHandle: handle, // Alias for backwards compat
                    encryptedHash: hash,

                    // Ciphertext for on-chain program (if using real encryption)
                    ciphertext: ciphertext || null,

                    // Whether real Inco FHE encryption was used
                    isRealEncryption,

                    // PDA addresses for on-chain verification
                    privateReceiptPda: privateReceiptPda.toBase58(),
                    customerAllowancePda: customerAllowancePda.toBase58(),
                    merchantAllowancePda: merchantAllowancePda.toBase58(),

                    // Storage status
                    stored,
                    demo: !isRealEncryption, // Only demo if not using real Inco encryption

                    // Privacy info
                    message: isRealEncryption
                        ? 'Private receipt issued with Inco Lightning FHE encryption'
                        : 'Private receipt issued (simulated encryption)',
                    privacyNote: isRealEncryption
                        ? 'Amount encrypted with Inco TEE. Only customer and merchant can decrypt via attested decryption.'
                        : 'Simulated encryption - for production, enable USE_REAL_INCO_ENCRYPTION.',

                    // Display-friendly shortened handle
                    handleShort: `0x${handle.slice(-12)}`,
                });
            }

            case 'verify': {
                // Verify a private receipt exists
                if (!paymentId) {
                    return NextResponse.json(
                        { error: 'Missing paymentId' },
                        { status: 400 }
                    );
                }

                // Check Supabase first
                if (supabase) {
                    try {
                        const { data, error } = await supabase
                            .from('privacy_receipts')
                            .select('*')
                            .eq('payment_id', paymentId)
                            .single();

                        if (data && !error) {
                            return NextResponse.json({
                                success: true,
                                exists: true,
                                source: 'database',
                                paymentId: data.payment_id,
                                customer: data.customer_wallet,
                                merchant: data.merchant_wallet,
                                encryptedHandle: data.encrypted_handle,
                                encryptedHash: data.encrypted_hash,
                                createdAt: data.created_at,
                                status: data.status,
                                customerAllowance: data.customer_allowance_granted,
                                merchantAllowance: data.merchant_allowance_granted,
                                privacyNote: 'Amount is FHE-encrypted. Authorized parties can decrypt via Inco covalidators.',
                            });
                        }
                    } catch (err) {
                        console.warn('[Privacy] Verify lookup error:', err);
                    }
                }

                // Fall back to on-chain check (would work if Inco is deployed)
                const [privateReceiptPda] = findPrivateReceiptPda(paymentId);

                return NextResponse.json({
                    success: false,
                    exists: false,
                    privateReceiptPda: privateReceiptPda.toBase58(),
                    message: 'Private receipt not found in database. Check on-chain PDA.',
                });
            }

            case 'list': {
                // List privacy receipts for a wallet
                const wallet = body.wallet;
                if (!wallet) {
                    return NextResponse.json(
                        { error: 'Missing wallet parameter' },
                        { status: 400 }
                    );
                }

                if (!supabase) {
                    return NextResponse.json({
                        success: false,
                        error: 'Database not configured',
                        receipts: []
                    });
                }

                try {
                    const { data, error } = await supabase
                        .from('privacy_receipts')
                        .select('payment_id, encrypted_handle, encrypted_hash, created_at, status')
                        .or(`customer_wallet.eq.${wallet},merchant_wallet.eq.${wallet}`)
                        .order('created_at', { ascending: false })
                        .limit(50);

                    if (error) throw error;

                    return NextResponse.json({
                        success: true,
                        wallet,
                        receipts: data || [],
                        count: data?.length || 0
                    });
                } catch (err) {
                    console.error('[Privacy] List error:', err);
                    return NextResponse.json({
                        success: false,
                        error: 'Failed to fetch receipts',
                        receipts: []
                    });
                }
            }

            case 'revoke': {
                // Revoke decryption access (demo only)
                if (!paymentId) {
                    return NextResponse.json(
                        { error: 'Missing paymentId' },
                        { status: 400 }
                    );
                }

                if (supabase) {
                    const { error } = await supabase
                        .from('privacy_receipts')
                        .update({ status: 'revoked' })
                        .eq('payment_id', paymentId);

                    if (!error) {
                        return NextResponse.json({
                            success: true,
                            message: 'Privacy receipt access revoked',
                            paymentId
                        });
                    }
                }

                return NextResponse.json({
                    success: false,
                    error: 'Failed to revoke access'
                }, { status: 500 });
            }

            default:
                return NextResponse.json(
                    { error: `Unknown action: ${action}` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('[Privacy] API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');
    const wallet = searchParams.get('wallet');

    if (wallet) {
        // List receipts for wallet
        const body = JSON.stringify({ action: 'list', wallet });
        const internalRequest = new NextRequest(request.url, {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'application/json' },
        });
        return POST(internalRequest);
    }

    if (paymentId) {
        // Verify specific receipt
        const body = JSON.stringify({ action: 'verify', paymentId });
        const internalRequest = new NextRequest(request.url, {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'application/json' },
        });
        return POST(internalRequest);
    }

    return NextResponse.json(
        { error: 'Missing paymentId or wallet query parameter' },
        { status: 400 }
    );
}
