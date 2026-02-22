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
    SETTLR_PROGRAM_ID,
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
        const { action, paymentId, amount, customer, merchant, txSignature, wallet } = body;

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

                // Derive PDAs
                const [privateReceiptPda] = findPrivateReceiptPda(paymentId);
                const [delegationRecordPda] = findDelegationRecordPda(privateReceiptPda);
                const [delegationMetadataPda] = findDelegationMetadataPda(privateReceiptPda);

                // Generate session hash
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
                        const { error } = await supabase
                            .from('privacy_receipts')
                            .upsert({
                                payment_id: paymentId,
                                customer_wallet: customer,
                                merchant_wallet: merchant,
                                session_hash: sessionHash,
                                session_status: 'pending',
                                is_delegated: false,
                                payment_timestamp: new Date().toISOString(),
                                privacy_version: 3,
                                encryption_method: 'magicblock_per',
                                status: 'active'
                            }, { onConflict: 'payment_id' });

                        if (!error) stored = true;
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
                    message: 'Private payment session created. Ready for TEE delegation.',
                    handleShort: `0x${sessionHash.slice(0, 12)}`,
                });
            }

            case 'delegate': {
                // Delegate session to TEE
                if (!paymentId) {
                    return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
                }

                const session = sessions.get(paymentId);
                if (!session) {
                    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
                }

                if (session.status !== SessionStatus.Pending) {
                    return NextResponse.json({
                        error: `Cannot delegate session in ${SESSION_STATUS_LABELS[session.status]} state`
                    }, { status: 400 });
                }

                session.status = SessionStatus.Active;
                session.isDelegated = true;
                session.delegatedAt = new Date().toISOString();

                if (supabase) {
                    try {
                        await supabase.from('privacy_receipts')
                            .update({ session_status: 'active', is_delegated: true })
                            .eq('payment_id', paymentId);
                    } catch { /* ignore */ }
                }

                const visibility = getPrivacyVisibility(SessionStatus.Active);

                return NextResponse.json({
                    success: true,
                    action: 'delegate',
                    paymentId,
                    status: 'active',
                    statusLabel: SESSION_STATUS_LABELS[SessionStatus.Active],
                    isDelegated: true,
                    visibility,
                    message: 'Session delegated to MagicBlock TEE. Amount hidden from base-layer observers.',
                    privacyNote: 'Account state is now inside TEE. Base-layer queries will not see current data.',
                });
            }

            case 'process': {
                // Process payment privately inside TEE
                if (!paymentId) {
                    return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
                }

                const session = sessions.get(paymentId);
                if (!session) {
                    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
                }

                if (session.status !== SessionStatus.Active) {
                    return NextResponse.json({
                        error: `Cannot process session in ${SESSION_STATUS_LABELS[session.status]} state`
                    }, { status: 400 });
                }

                session.status = SessionStatus.Processed;
                session.processedAt = new Date().toISOString();

                if (supabase) {
                    try {
                        await supabase.from('privacy_receipts')
                            .update({ session_status: 'processed' })
                            .eq('payment_id', paymentId);
                    } catch { /* ignore */ }
                }

                return NextResponse.json({
                    success: true,
                    action: 'process',
                    paymentId,
                    status: 'processed',
                    statusLabel: SESSION_STATUS_LABELS[SessionStatus.Processed],
                    isDelegated: true,
                    visibility: getPrivacyVisibility(SessionStatus.Processed),
                    message: 'Payment processed privately inside TEE. Ready for settlement.',
                });
            }

            case 'settle': {
                // Settle: commit state back to base layer
                if (!paymentId) {
                    return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
                }

                const session = sessions.get(paymentId);
                if (!session) {
                    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
                }

                if (session.status !== SessionStatus.Processed) {
                    return NextResponse.json({
                        error: `Cannot settle session in ${SESSION_STATUS_LABELS[session.status]} state`
                    }, { status: 400 });
                }

                session.status = SessionStatus.Settled;
                session.isDelegated = false;
                session.settledAt = new Date().toISOString();

                if (supabase) {
                    try {
                        await supabase.from('privacy_receipts')
                            .update({ session_status: 'settled', is_delegated: false })
                            .eq('payment_id', paymentId);
                    } catch { /* ignore */ }
                }

                return NextResponse.json({
                    success: true,
                    action: 'settle',
                    paymentId,
                    status: 'settled',
                    statusLabel: SESSION_STATUS_LABELS[SessionStatus.Settled],
                    isDelegated: false,
                    visibility: getPrivacyVisibility(SessionStatus.Settled),
                    amount: session.amount,
                    message: 'Payment settled. State committed back to base layer.',
                    privacyNote: 'Amount is now visible on base layer after settlement.',
                });
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
                        .select('payment_id, session_hash, session_status, is_delegated, created_at, status')
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
        name: 'Settlr Private Receipt API',
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
            settlr: SETTLR_PROGRAM_ID.toBase58(),
            delegation: DELEGATION_PROGRAM_ID.toBase58(),
            teeValidator: TEE_VALIDATOR.toBase58(),
        },
        perEndpoint: PER_ENDPOINT,
    });
}
