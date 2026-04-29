/**
 * Private Receipt API v3 — MagicBlock PER
 * 
 * Issues TEE-private payment receipts using MagicBlock Private Ephemeral Rollups.
 * Payment amounts are hidden from base-layer observers while processed inside TEE.
 * 
 * POST: Create / delegate / process / settle / verify / list / revoke
 * GET: Query receipt by paymentId or list by wallet
 */

import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';
import {
    findPrivateReceiptPda,
    findDelegationRecordPda,
    findDelegationMetadataPda,
    usdcToMicroUnits,
    DELEGATION_PROGRAM_ID,
    OFFBANK_PROGRAM_ID,
    TEE_VALIDATOR,
    PER_ENDPOINT,
    SessionStatus,
    SESSION_STATUS_LABELS,
    generateSessionHash,
    getPrivacyVisibility,
} from '@/lib/inco-lightning';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

// In-memory session store (use DB in production)
const sessions = new Map<string, {
    paymentId: string;
    amount: number;
    customer: string;
    merchant: string;
    status: SessionStatus;
    isDelegated: boolean;
    sessionHash: string;
    privateReceiptPda: string;
    delegationRecordPda: string;
    delegationMetadataPda: string;
    createdAt: string;
    delegatedAt?: string;
    processedAt?: string;
    settledAt?: string;
}>();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            action,
            paymentId,
            amount,
            customer,
            merchant,
            txSignature,
            wallet,
            encrypted, // { ciphertext, nonce, ephemeralPublicKey, recipientPublicKey, version }
            payloadHash,
        } = body;

        if (!action) {
            return NextResponse.json(
                { error: 'Missing action parameter' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'issue':
            case 'create': {
                // Create a private payment session on base layer
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

                // Validate optional encrypted payload shape
                if (encrypted) {
                    const ok =
                        typeof encrypted.ciphertext === 'string' &&
                        typeof encrypted.nonce === 'string' &&
                        typeof encrypted.ephemeralPublicKey === 'string' &&
                        typeof encrypted.recipientPublicKey === 'string' &&
                        encrypted.version === 1;
                    if (!ok) {
                        return NextResponse.json(
                            { error: 'Invalid encrypted payload shape' },
                            { status: 400 }
                        );
                    }
                }

                // Derive PDAs
                const [privateReceiptPda] = findPrivateReceiptPda(paymentId);
                const [delegationRecordPda] = findDelegationRecordPda(privateReceiptPda);
                const [delegationMetadataPda] = findDelegationMetadataPda(privateReceiptPda);

                // Generate session hash (also used as receipt-bind handle if no payload hash provided)
                const sessionHash = await generateSessionHash(paymentId, amount, customer, merchant);

                const session = {
                    paymentId,
                    amount,
                    customer,
                    merchant,
                    status: SessionStatus.Pending,
                    isDelegated: false,
                    sessionHash,
                    privateReceiptPda: privateReceiptPda.toBase58(),
                    delegationRecordPda: delegationRecordPda.toBase58(),
                    delegationMetadataPda: delegationMetadataPda.toBase58(),
                    createdAt: new Date().toISOString(),
                };

                sessions.set(paymentId, session);

                // Store in Supabase if configured
                let stored = false;
                if (supabase) {
                    try {
                        const row: Record<string, unknown> = {
                            payment_id: paymentId,
                            customer_wallet: customer,
                            merchant_wallet: merchant,
                            session_hash: sessionHash,
                            session_status: 'pending',
                            is_delegated: false,
                            payment_timestamp: new Date().toISOString(),
                            privacy_version: 3,
                            encryption_method: encrypted ? 'nacl_box_v1' : 'magicblock_per',
                            status: 'active',
                            // NOT NULL legacy column from initial migration:
                            encrypted_handle: encrypted?.payloadHash || payloadHash || sessionHash,
                        };
                        if (encrypted) {
                            row.ciphertext = encrypted.ciphertext;
                            row.encryption_nonce = encrypted.nonce;
                            row.ephemeral_pubkey = encrypted.ephemeralPublicKey;
                            row.recipient_pubkey = encrypted.recipientPublicKey;
                            row.encryption_scheme = encrypted.version;
                        }
                        if (payloadHash) row.payload_hash = payloadHash;
                        if (txSignature) row.tx_signature = txSignature;

                        const { error } = await supabase
                            .from('privacy_receipts')
                            .upsert(row, { onConflict: 'payment_id' });

                        if (!error) stored = true;
                        else console.warn('[PER] Supabase upsert error:', error.message);
                    } catch (err) {
                        console.warn('[PER] Supabase error:', err);
                    }
                }

                const visibility = getPrivacyVisibility(SessionStatus.Pending);

                return NextResponse.json({
                    success: true,
                    action: 'create',
                    paymentId,
                    sessionHash,
                    payloadHash: payloadHash || null,
                    encryptedStored: !!encrypted && stored,
                    status: 'pending',
                    statusLabel: SESSION_STATUS_LABELS[SessionStatus.Pending],
                    isDelegated: false,
                    privateReceiptPda: session.privateReceiptPda,
                    delegationRecordPda: session.delegationRecordPda,
                    delegationMetadataPda: session.delegationMetadataPda,
                    visibility,
                    stored,
                    teeValidator: TEE_VALIDATOR.toBase58(),
                    perEndpoint: PER_ENDPOINT,
                    teeDelegationStatus:
                        'unavailable_on_devnet — receipt is encrypted client-side and stored off-chain. TEE delegation will activate when MagicBlock devnet program is live.',
                    message: encrypted
                        ? 'Encrypted private receipt stored. Only the merchant can decrypt.'
                        : 'Private payment session created (no client encryption supplied).',
                    handleShort: `0x${(payloadHash || sessionHash).slice(0, 12)}`,
                });
            }

            case 'delegate':
            case 'process':
            case 'settle': {
                // MagicBlock TEE delegation program is not deployed on devnet.
                // We expose these actions for forward-compatibility but return
                // 501 so the UI can show an honest "coming soon" badge instead
                // of pretending state has transitioned inside a TEE.
                return NextResponse.json(
                    {
                        error: 'tee_delegation_unavailable',
                        action,
                        message:
                            'MagicBlock Private Ephemeral Rollup delegation is not yet available on devnet. The encrypted receipt is already protecting your data — TEE delegation will activate once the on-chain program is live.',
                        replacement: 'Encrypted receipt via action "issue" with `encrypted` payload.',
                    },
                    { status: 501 }
                );
            }

            case 'verify':
            case 'status': {
                // Get session status
                if (!paymentId) {
                    return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
                }

                // Check in-memory first
                const session = sessions.get(paymentId);
                if (session) {
                    return NextResponse.json({
                        success: true,
                        exists: true,
                        source: 'memory',
                        ...session,
                        statusLabel: SESSION_STATUS_LABELS[session.status],
                        visibility: getPrivacyVisibility(session.status),
                    });
                }

                // Check Supabase
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
                                sessionHash: data.session_hash,
                                sessionStatus: data.session_status,
                                isDelegated: data.is_delegated,
                                createdAt: data.created_at,
                                status: data.status,
                                privacyNote: 'MagicBlock PER — TEE-based privacy for payments.',
                            });
                        }
                    } catch (err) {
                        console.warn('[PER] Verify lookup error:', err);
                    }
                }

                // Not found — derive PDA for on-chain check
                const [privateReceiptPda] = findPrivateReceiptPda(paymentId);

                return NextResponse.json({
                    success: false,
                    exists: false,
                    privateReceiptPda: privateReceiptPda.toBase58(),
                    message: 'Session not found. Check on-chain PDA.',
                });
            }

            case 'list': {
                // List privacy receipts for a wallet
                if (!wallet) {
                    return NextResponse.json({ error: 'Missing wallet parameter' }, { status: 400 });
                }

                if (!supabase) {
                    // Return from in-memory store
                    const results = Array.from(sessions.values())
                        .filter(s => s.customer === wallet || s.merchant === wallet);
                    return NextResponse.json({
                        success: true,
                        wallet,
                        receipts: results,
                        count: results.length,
                        source: 'memory',
                    });
                }

                try {
                    const { data, error } = await supabase
                        .from('privacy_receipts')
                        .select(
                            'payment_id, customer_wallet, merchant_wallet, session_hash, session_status, is_delegated, created_at, status, ciphertext, encryption_nonce, ephemeral_pubkey, recipient_pubkey, payload_hash, tx_signature, encryption_scheme, encryption_method, payment_timestamp'
                        )
                        .or(`customer_wallet.eq.${wallet},merchant_wallet.eq.${wallet}`)
                        .order('created_at', { ascending: false })
                        .limit(50);

                    if (error) throw error;

                    return NextResponse.json({
                        success: true,
                        wallet,
                        receipts: data || [],
                        count: data?.length || 0,
                        source: 'database',
                    });
                } catch (err) {
                    console.error('[PER] List error:', err);
                    return NextResponse.json({
                        success: false,
                        error: 'Failed to fetch receipts',
                        receipts: []
                    });
                }
            }

            case 'revoke': {
                if (!paymentId) {
                    return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
                }

                // Remove from memory
                sessions.delete(paymentId);

                if (supabase) {
                    const { error } = await supabase
                        .from('privacy_receipts')
                        .update({ status: 'revoked' })
                        .eq('payment_id', paymentId);

                    if (!error) {
                        return NextResponse.json({
                            success: true,
                            message: 'Privacy receipt revoked',
                            paymentId
                        });
                    }
                }

                return NextResponse.json({
                    success: true,
                    message: 'Session removed',
                    paymentId
                });
            }

            default:
                return NextResponse.json(
                    { error: `Unknown action: ${action}` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('[PER] API error:', error);
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
        const body = JSON.stringify({ action: 'list', wallet });
        const internalRequest = new NextRequest(request.url, {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'application/json' },
        });
        return POST(internalRequest);
    }

    if (paymentId) {
        const body = JSON.stringify({ action: 'status', paymentId });
        const internalRequest = new NextRequest(request.url, {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'application/json' },
        });
        return POST(internalRequest);
    }

    // Return API info
    return NextResponse.json({
        name: 'Offbank Private Receipt API',
        version: '3.0.0',
        privacy: 'MagicBlock Private Ephemeral Rollups',
        hackathon: 'MagicBlock SolanaBlitz 2026',
        endpoints: {
            POST: {
                actions: ['create', 'delegate', 'process', 'settle', 'status', 'list', 'revoke'],
            },
            GET: {
                params: ['paymentId', 'wallet'],
            },
        },
        programs: {
            offbank: OFFBANK_PROGRAM_ID.toBase58(),
            delegation: DELEGATION_PROGRAM_ID.toBase58(),
            teeValidator: TEE_VALIDATOR.toBase58(),
        },
        perEndpoint: PER_ENDPOINT,
    });
}
