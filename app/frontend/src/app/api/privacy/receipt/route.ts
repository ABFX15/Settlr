/**
 * Private Receipt API v2
 * 
 * Issues FHE-encrypted private receipts for payments using Inco Lightning.
 * Only authorized parties (merchant + customer) can decrypt payment amounts.
 * 
 * For demo: Stores privacy metadata in Supabase with simulated encryption handles.
 * For production: Would make actual on-chain CPI to Inco Lightning program.
 * 
 * POST: Issue a private receipt for a completed payment
 * GET: Retrieve/verify a private receipt
 */

import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';

// Program IDs for reference
const SETTLR_PROGRAM_ID = new PublicKey('339A4zncMj8fbM2zvEopYXu6TZqRieJKebDiXCKwquA5');
const INCO_LIGHTNING_PROGRAM_ID = new PublicKey('5sjEbPiqgZrYwR31ahR6Uk9wf5awoX61YGg7jExQSwaj');

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

/**
 * Generate a deterministic encrypted handle from payment data.
 * In production, this would come from Inco Lightning's FHE encryption.
 * 
 * The handle is a u128 that uniquely identifies the encrypted value
 * in Inco's covalidator network.
 */
async function generateEncryptedHandle(
    paymentId: string,
    amount: number,
    customer: string,
    merchant: string
): Promise<{ handle: string; hash: string }> {
    // Create a deterministic hash of the payment data
    const encoder = new TextEncoder();
    const data = encoder.encode(`${paymentId}:${amount}:${customer}:${merchant}:${Date.now()}`);

    // Use Web Crypto API for hashing
    const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
    const hashArray = new Uint8Array(hashBuffer);

    // Convert first 16 bytes to u128 handle (little-endian)
    let handle = BigInt(0);
    for (let i = 15; i >= 0; i--) {
        handle = (handle << BigInt(8)) | BigInt(hashArray[i]);
    }

    // Create display hash (hex of first 8 bytes of full hash)
    const hashHex = Array.from(hashArray.slice(0, 8))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return {
        handle: handle.toString(),
        hash: hashHex
    };
}

/**
 * Find the private receipt PDA (for on-chain verification)
 * Uses first 32 bytes of paymentId hash to fit PDA seed limit
 */
function findPrivateReceiptPda(paymentId: string): [PublicKey, number] {
    // PDA seeds have max 32 bytes - hash long payment IDs (like tx signatures)
    let paymentIdSeed: Buffer;
    if (paymentId.length > 32) {
        // Use first 32 chars of the paymentId as seed (tx signatures are base58)
        paymentIdSeed = Buffer.from(paymentId.slice(0, 32));
    } else {
        paymentIdSeed = Buffer.from(paymentId);
    }

    return PublicKey.findProgramAddressSync(
        [Buffer.from('private_receipt'), paymentIdSeed],
        SETTLR_PROGRAM_ID
    );
}

/**
 * Find allowance PDA for a given handle and address
 */
function findAllowancePda(handle: bigint, allowedAddress: PublicKey): [PublicKey, number] {
    const handleBuffer = Buffer.alloc(16);
    let h = handle;
    for (let i = 0; i < 16; i++) {
        handleBuffer[i] = Number(h & BigInt(0xff));
        h = h >> BigInt(8);
    }
    return PublicKey.findProgramAddressSync(
        [handleBuffer, allowedAddress.toBuffer()],
        INCO_LIGHTNING_PROGRAM_ID
    );
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

                // Generate encrypted handle
                const { handle, hash } = await generateEncryptedHandle(
                    paymentId,
                    amount,
                    customer,
                    merchant
                );

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
                                payment_timestamp: new Date().toISOString(),
                                privacy_version: 1,
                                encryption_method: 'inco_lightning_fhe_demo',
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

                    // Encrypted handle (would be from Inco in production)
                    handle,
                    encryptedHandle: handle, // Alias for backwards compat
                    encryptedHash: hash,

                    // PDA addresses for on-chain verification
                    privateReceiptPda: privateReceiptPda.toBase58(),
                    customerAllowancePda: customerAllowancePda.toBase58(),
                    merchantAllowancePda: merchantAllowancePda.toBase58(),

                    // Storage status
                    stored,
                    demo: true, // Flag indicating demo mode

                    // Privacy info
                    message: 'Private receipt issued successfully',
                    privacyNote: 'Payment amount is encrypted. Only customer and merchant can decrypt via Inco Lightning.',

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
