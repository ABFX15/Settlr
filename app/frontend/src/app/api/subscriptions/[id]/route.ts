/**
 * Subscription Details API
 *
 * GET  /api/subscriptions/[id] — Get subscription details + payment history
 * PUT  /api/subscriptions/[id] — Update subscription (e.g., change plan)
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!isSupabaseConfigured()) {
            return NextResponse.json({ error: "Not configured" }, { status: 500 });
        }

        // Fetch subscription with plan details
        const { data: sub, error } = await supabase
            .from("subscriptions")
            .select(
                "*, subscription_plans(name, description, features, interval, interval_count, amount)"
            )
            .eq("id", id)
            .single();

        if (error || !sub) {
            return NextResponse.json(
                { error: "Subscription not found" },
                { status: 404 }
            );
        }

        // Fetch payment history
        const { data: payments } = await supabase
            .from("subscription_payments")
            .select("*")
            .eq("subscription_id", id)
            .order("created_at", { ascending: false })
            .limit(50);

        return NextResponse.json({
            subscription: {
                id: sub.id,
                planId: sub.plan_id,
                plan: sub.subscription_plans
                    ? {
                        name: sub.subscription_plans.name,
                        description: sub.subscription_plans.description,
                        features: sub.subscription_plans.features,
                        interval: sub.subscription_plans.interval,
                        intervalCount: sub.subscription_plans.interval_count,
                        amount: sub.subscription_plans.amount,
                    }
                    : null,
                merchantWallet: sub.merchant_wallet,
                customerWallet: sub.customer_wallet,
                customerEmail: sub.customer_email,
                status: sub.status,
                amount: sub.amount,
                currency: sub.currency,
                interval: sub.interval,
                intervalCount: sub.interval_count,
                currentPeriodStart: sub.current_period_start,
                currentPeriodEnd: sub.current_period_end,
                trialEnd: sub.trial_end,
                cancelAtPeriodEnd: sub.cancel_at_period_end,
                cancelledAt: sub.cancelled_at,
                pausedAt: sub.paused_at,
                retryCount: sub.retry_count,
                createdAt: sub.created_at,
            },
            payments: (payments || []).map((p) => ({
                id: p.id,
                amount: p.amount,
                platformFee: p.platform_fee,
                status: p.status,
                txSignature: p.tx_signature,
                periodStart: p.period_start,
                periodEnd: p.period_end,
                attemptCount: p.attempt_count,
                failureReason: p.failure_reason,
                createdAt: p.created_at,
            })),
        });
    } catch (error) {
        console.error("[Subscription Detail] Error:", error);
        return NextResponse.json(
            { error: "Internal error" },
            { status: 500 }
        );
    }
}
