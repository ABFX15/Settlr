/**
 * Payment Status API
 * 
 * Mobile games can poll this endpoint to check payment status.
 * Useful for games that open checkout in external browser.
 * 
 * GET /api/checkout/status?session={sessionId}
 * GET /api/checkout/status?order_id={orderId}
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export interface PaymentStatusResponse {
    status: 'pending' | 'completed' | 'expired' | 'cancelled' | 'not_found';
    signature?: string;
    amount?: number;
    orderId?: string;
    completedAt?: string;
    expiresAt?: string;
}

export async function GET(request: NextRequest) {
    try {
        const params = request.nextUrl.searchParams;
        const sessionId = params.get('session');
        const orderId = params.get('order_id');

        if (!sessionId && !orderId) {
            return NextResponse.json(
                { error: 'Provide session or order_id parameter' },
                { status: 400 }
            );
        }

        // Try to find from Supabase
        if (supabase) {
            let query = supabase.from('checkout_sessions').select('*');

            if (sessionId) {
                query = query.eq('id', sessionId);
            } else if (orderId) {
                query = query.eq('order_id', orderId);
            }

            const { data: session } = await query.single();

            if (session) {
                // Check if expired
                const isExpired = session.expires_at && new Date(session.expires_at) < new Date();

                const response: PaymentStatusResponse = {
                    status: session.status === 'completed'
                        ? 'completed'
                        : isExpired
                            ? 'expired'
                            : session.status || 'pending',
                    signature: session.tx_signature || undefined,
                    amount: session.amount,
                    orderId: session.order_id,
                    completedAt: session.completed_at,
                    expiresAt: session.expires_at,
                };

                return NextResponse.json(response);
            }
        }

        // Session not found - check if we have a transaction record
        // (for payments made without checkout session)
        if (supabase && orderId) {
            const { data: payment } = await supabase
                .from('payments')
                .select('*')
                .eq('order_id', orderId)
                .single();

            if (payment) {
                return NextResponse.json({
                    status: 'completed',
                    signature: payment.tx_signature,
                    amount: payment.amount,
                    orderId: payment.order_id,
                    completedAt: payment.created_at,
                } as PaymentStatusResponse);
            }
        }

        // Not found
        return NextResponse.json({
            status: 'not_found',
        } as PaymentStatusResponse);

    } catch (error) {
        console.error('[PaymentStatus] Error:', error);
        return NextResponse.json(
            { error: 'Failed to check status' },
            { status: 500 }
        );
    }
}

/**
 * POST to update status (called internally after payment completes)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, orderId, status, signature, amount } = body;

        if (!sessionId && !orderId) {
            return NextResponse.json(
                { error: 'Provide sessionId or orderId' },
                { status: 400 }
            );
        }

        if (!supabase) {
            // Demo mode - just return success
            return NextResponse.json({
                success: true,
                demo: true,
                message: 'Status would be updated (demo mode)',
            });
        }

        // Update checkout session
        if (sessionId) {
            await supabase
                .from('checkout_sessions')
                .update({
                    status: status || 'completed',
                    tx_signature: signature,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', sessionId);
        }

        // Also record in payments table for history
        if (status === 'completed' && signature) {
            await supabase
                .from('payments')
                .insert({
                    order_id: orderId,
                    session_id: sessionId,
                    tx_signature: signature,
                    amount: amount,
                    status: 'completed',
                });
        }

        return NextResponse.json({
            success: true,
            message: 'Status updated',
        });

    } catch (error) {
        console.error('[PaymentStatus] Update error:', error);
        return NextResponse.json(
            { error: 'Failed to update status' },
            { status: 500 }
        );
    }
}
