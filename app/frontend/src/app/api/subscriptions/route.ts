/**
 * Subscriptions API
 *
 * Core subscription management for recurring stablecoin payments.
 *
 * POST /api/subscriptions — Create subscription (subscribe customer to plan)
 * GET  /api/subscriptions — List subscriptions (by merchant or customer)
 *
 * Actions via POST body { action }:
 *   subscribe  — Create a new subscription
 *   cancel     — Cancel (immediately or at period end)
 *   pause      — Pause billing
 *   resume     — Resume paused subscription
 *   charge     — Manually trigger a charge for a subscription
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { resolveMerchantId } from "@/lib/resolve-merchant";

function generateId(prefix: string): string {
    return `${prefix}_${crypto.randomBytes(12).toString("hex")}`;
}

function calculatePeriodEnd(
    start: Date,
    interval: string,
    intervalCount: number
): Date {
    const end = new Date(start);
    switch (interval) {
        case "daily":
            end.setDate(end.getDate() + intervalCount);
            break;
        case "weekly":
            end.setDate(end.getDate() + 7 * intervalCount);
            break;
        case "monthly":
            end.setMonth(end.getMonth() + intervalCount);
            break;
        case "yearly":
            end.setFullYear(end.getFullYear() + intervalCount);
            break;
    }
    return end;
}

/**
 * GET /api/subscriptions
 */
export async function GET(request: NextRequest) {
    try {
        const params = request.nextUrl.searchParams;
        const rawMerchantId = params.get("merchantId");
        const customerWallet = params.get("customer");
        const status = params.get("status");
        const planId = params.get("planId");

        if (!isSupabaseConfigured()) {
            return NextResponse.json({ subscriptions: [], demo: true });
        }

        // Resolve wallet address to UUID if needed
        const merchantId = rawMerchantId ? await resolveMerchantId(rawMerchantId) : null;

        let query = supabase
            .from("subscriptions")
            .select(
                "*, subscription_plans(name, description, features, interval, interval_count)"
            )
            .order("created_at", { ascending: false });

        if (merchantId) query = query.eq("merchant_id", merchantId);
        if (customerWallet) query = query.eq("customer_wallet", customerWallet);
        if (status) query = query.eq("status", status);
        if (planId) query = query.eq("plan_id", planId);

        const { data, error } = await query;

        if (error) {
            console.error("[Subscriptions] List error:", error);
            return NextResponse.json(
                { error: "Failed to list subscriptions" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            subscriptions: (data || []).map((s) => ({
                id: s.id,
                planId: s.plan_id,
                plan: s.subscription_plans
                    ? {
                        name: s.subscription_plans.name,
                        description: s.subscription_plans.description,
                        features: s.subscription_plans.features,
                        interval: s.subscription_plans.interval,
                        intervalCount: s.subscription_plans.interval_count,
                    }
                    : null,
                merchantWallet: s.merchant_wallet,
                customerWallet: s.customer_wallet,
                customerEmail: s.customer_email,
                status: s.status,
                amount: s.amount,
                currency: s.currency,
                interval: s.interval,
                intervalCount: s.interval_count,
                currentPeriodStart: s.current_period_start,
                currentPeriodEnd: s.current_period_end,
                trialEnd: s.trial_end,
                cancelAtPeriodEnd: s.cancel_at_period_end,
                cancelledAt: s.cancelled_at,
                pausedAt: s.paused_at,
                createdAt: s.created_at,
            })),
        });
    } catch (error) {
        console.error("[Subscriptions] Error:", error);
        return NextResponse.json(
            { error: "Internal error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/subscriptions
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        if (!action) {
            return NextResponse.json(
                { error: "Missing action" },
                { status: 400 }
            );
        }

        switch (action) {
            case "subscribe":
                return handleSubscribe(body);
            case "cancel":
                return handleCancel(body);
            case "pause":
                return handlePause(body);
            case "resume":
                return handleResume(body);
            case "charge":
                return handleCharge(body);
            default:
                return NextResponse.json(
                    { error: `Unknown action: ${action}` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("[Subscriptions] Error:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Internal error",
            },
            { status: 500 }
        );
    }
}

/**
 * Subscribe a customer to a plan
 */
async function handleSubscribe(body: Record<string, unknown>) {
    const {
        planId,
        customerWallet,
        customerEmail,
        merchantWallet,
        metadata,
    } = body as {
        planId: string;
        customerWallet: string;
        customerEmail?: string;
        merchantWallet: string;
        metadata?: Record<string, string>;
    };

    if (!planId || !customerWallet || !merchantWallet) {
        return NextResponse.json(
            { error: "Missing: planId, customerWallet, merchantWallet" },
            { status: 400 }
        );
    }

    if (!isSupabaseConfigured()) {
        return NextResponse.json({
            subscription: {
                id: generateId("sub"),
                planId,
                customerWallet,
                status: "active",
            },
            demo: true,
        });
    }

    // Fetch the plan
    const { data: plan, error: planError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", planId)
        .eq("active", true)
        .single();

    if (planError || !plan) {
        return NextResponse.json(
            { error: "Plan not found or inactive" },
            { status: 404 }
        );
    }

    // Check for existing active subscription
    const { data: existing } = await supabase
        .from("subscriptions")
        .select("id, status")
        .eq("plan_id", planId)
        .eq("customer_wallet", customerWallet)
        .in("status", ["active", "trialing", "past_due"])
        .single();

    if (existing) {
        return NextResponse.json(
            {
                error: "Customer already has an active subscription to this plan",
                subscriptionId: existing.id,
            },
            { status: 409 }
        );
    }

    const now = new Date();
    const hasTrial = plan.trial_days > 0;
    const trialEnd = hasTrial
        ? new Date(now.getTime() + plan.trial_days * 86400000)
        : null;

    const periodStart = hasTrial ? trialEnd! : now;
    const periodEnd = calculatePeriodEnd(
        periodStart,
        plan.interval,
        plan.interval_count
    );

    const subId = generateId("sub");

    const { data: sub, error: subError } = await supabase
        .from("subscriptions")
        .insert({
            id: subId,
            plan_id: planId,
            merchant_id: plan.merchant_id,
            merchant_wallet: merchantWallet,
            customer_wallet: customerWallet,
            customer_email: customerEmail,
            status: hasTrial ? "trialing" : "active",
            amount: plan.amount,
            currency: plan.currency,
            interval: plan.interval,
            interval_count: plan.interval_count,
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
            trial_end: trialEnd?.toISOString(),
            metadata: metadata || null,
        })
        .select()
        .single();

    if (subError) {
        console.error("[Subscribe] Error:", subError);
        return NextResponse.json(
            { error: "Failed to create subscription" },
            { status: 500 }
        );
    }

    // Increment subscriber count on the plan
    try {
        await supabase.rpc("increment_subscriber_count", {
            p_plan_id: planId,
        });
    } catch {
        // If RPC doesn't exist, do manual update
        await supabase
            .from("subscription_plans")
            .update({
                subscriber_count: (plan.subscriber_count || 0) + 1,
            })
            .eq("id", planId);
    }

    // If no trial, charge immediately
    if (!hasTrial) {
        const chargeResult = await chargeSubscription(sub, plan);
        if (!chargeResult.success) {
            // Mark as past_due if first charge fails
            await supabase
                .from("subscriptions")
                .update({ status: "past_due" })
                .eq("id", subId);

            return NextResponse.json({
                subscription: formatSubscription(sub),
                warning: "Subscription created but initial charge failed. Status: past_due",
                chargeError: chargeResult.error,
            });
        }

        return NextResponse.json({
            subscription: formatSubscription(sub),
            payment: chargeResult.payment,
            message: "Subscription created and first payment collected",
        });
    }

    return NextResponse.json({
        subscription: formatSubscription(sub),
        message: `Subscription created with ${plan.trial_days}-day trial. First charge on ${periodStart.toISOString().split("T")[0]}`,
    });
}

/**
 * Cancel a subscription
 */
async function handleCancel(body: Record<string, unknown>) {
    const { subscriptionId, immediately = false } = body as {
        subscriptionId: string;
        immediately?: boolean;
    };

    if (!subscriptionId) {
        return NextResponse.json(
            { error: "Missing: subscriptionId" },
            { status: 400 }
        );
    }

    if (!isSupabaseConfigured()) {
        return NextResponse.json({ success: true, demo: true });
    }

    const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", subscriptionId)
        .single();

    if (!sub) {
        return NextResponse.json(
            { error: "Subscription not found" },
            { status: 404 }
        );
    }

    if (sub.status === "cancelled") {
        return NextResponse.json(
            { error: "Subscription already cancelled" },
            { status: 400 }
        );
    }

    const now = new Date().toISOString();

    if (immediately) {
        await supabase
            .from("subscriptions")
            .update({
                status: "cancelled",
                cancelled_at: now,
                cancel_at_period_end: false,
            })
            .eq("id", subscriptionId);

        return NextResponse.json({
            success: true,
            message: "Subscription cancelled immediately",
        });
    }

    // Cancel at end of current period
    await supabase
        .from("subscriptions")
        .update({
            cancel_at_period_end: true,
            cancelled_at: now,
        })
        .eq("id", subscriptionId);

    return NextResponse.json({
        success: true,
        message: `Subscription will cancel at end of period: ${sub.current_period_end}`,
        cancelAt: sub.current_period_end,
    });
}

/**
 * Pause a subscription
 */
async function handlePause(body: Record<string, unknown>) {
    const { subscriptionId } = body as { subscriptionId: string };

    if (!subscriptionId) {
        return NextResponse.json(
            { error: "Missing: subscriptionId" },
            { status: 400 }
        );
    }

    if (!isSupabaseConfigured()) {
        return NextResponse.json({ success: true, demo: true });
    }

    const { data: sub } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("id", subscriptionId)
        .single();

    if (!sub || !["active", "trialing"].includes(sub.status)) {
        return NextResponse.json(
            { error: "Subscription not found or not in pausable state" },
            { status: 400 }
        );
    }

    await supabase
        .from("subscriptions")
        .update({
            status: "paused",
            paused_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId);

    return NextResponse.json({
        success: true,
        message: "Subscription paused. No further charges until resumed.",
    });
}

/**
 * Resume a paused subscription
 */
async function handleResume(body: Record<string, unknown>) {
    const { subscriptionId } = body as { subscriptionId: string };

    if (!subscriptionId) {
        return NextResponse.json(
            { error: "Missing: subscriptionId" },
            { status: 400 }
        );
    }

    if (!isSupabaseConfigured()) {
        return NextResponse.json({ success: true, demo: true });
    }

    const { data: sub } = await supabase
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("id", subscriptionId)
        .single();

    if (!sub || sub.status !== "paused") {
        return NextResponse.json(
            { error: "Subscription not found or not paused" },
            { status: 400 }
        );
    }

    // Reset billing period from now
    const now = new Date();
    const periodEnd = calculatePeriodEnd(
        now,
        sub.interval,
        sub.interval_count
    );

    await supabase
        .from("subscriptions")
        .update({
            status: "active",
            paused_at: null,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
        })
        .eq("id", subscriptionId);

    return NextResponse.json({
        success: true,
        message: "Subscription resumed",
        nextCharge: periodEnd.toISOString(),
    });
}

/**
 * Manually trigger a charge for a subscription
 */
async function handleCharge(body: Record<string, unknown>) {
    const { subscriptionId } = body as { subscriptionId: string };

    if (!subscriptionId) {
        return NextResponse.json(
            { error: "Missing: subscriptionId" },
            { status: 400 }
        );
    }

    if (!isSupabaseConfigured()) {
        return NextResponse.json({
            success: true,
            demo: true,
            signature: `demo-sub-tx-${Date.now()}`,
        });
    }

    const { data: sub } = await supabase
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("id", subscriptionId)
        .single();

    if (!sub) {
        return NextResponse.json(
            { error: "Subscription not found" },
            { status: 404 }
        );
    }

    const result = await chargeSubscription(sub, sub.subscription_plans);

    if (!result.success) {
        return NextResponse.json(
            { error: result.error },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        payment: result.payment,
        message: `Charged $${sub.amount} USDC`,
    });
}

/**
 * Core charge function — charges a subscription via sponsor-transaction
 * This reuses the existing Privy gasless infrastructure.
 */
async function chargeSubscription(
    sub: Record<string, unknown>,
    plan: Record<string, unknown>
): Promise<{
    success: boolean;
    payment?: Record<string, unknown>;
    error?: string;
}> {
    const amount = sub.amount as number;
    const customerWallet = sub.customer_wallet as string;
    const merchantWallet = sub.merchant_wallet as string;
    const subId = sub.id as string;
    const planId = sub.plan_id as string;
    const periodStart = sub.current_period_start as string;
    const periodEnd = sub.current_period_end as string;

    const paymentId = generateId("sp");

    try {
        // Create payment record first
        await supabase.from("subscription_payments").insert({
            id: paymentId,
            subscription_id: subId,
            plan_id: planId,
            merchant_wallet: merchantWallet,
            customer_wallet: customerWallet,
            amount: amount,
            currency: "USDC",
            status: "pending",
            period_start: periodStart,
            period_end: periodEnd,
        });

        // Use sponsor-transaction API to execute the payment
        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const amountLamports = Math.floor(amount * 1_000_000);

        // Step 1: Create the transaction
        const createRes = await fetch(`${appUrl}/api/sponsor-transaction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "create-and-submit",
                amount: amountLamports,
                source: customerWallet,
                destination: merchantWallet,
                memo: `Settlr subscription ${subId}`,
            }),
        });

        if (!createRes.ok) {
            const err = await createRes.json().catch(() => ({}));
            throw new Error(
                (err as Record<string, string>).error || "Transaction creation failed"
            );
        }

        const txData = (await createRes.json()) as Record<string, unknown>;
        const signature = txData.transactionHash as string;

        // Update payment as completed
        await supabase
            .from("subscription_payments")
            .update({
                status: "completed",
                tx_signature: signature,
                platform_fee: amount * 0.01, // 1%
            })
            .eq("id", paymentId);

        // Reset retry count on success
        await supabase
            .from("subscriptions")
            .update({ retry_count: 0 })
            .eq("id", subId);

        return {
            success: true,
            payment: {
                id: paymentId,
                amount,
                signature,
                status: "completed",
            },
        };
    } catch (error) {
        console.error(`[Subscription Charge] Failed for ${subId}:`, error);

        // Update payment as failed
        await supabase
            .from("subscription_payments")
            .update({
                status: "failed",
                failure_reason:
                    error instanceof Error ? error.message : "Unknown error",
            })
            .eq("id", paymentId);

        return {
            success: false,
            error:
                error instanceof Error ? error.message : "Charge failed",
        };
    }
}

function formatSubscription(sub: Record<string, unknown>) {
    return {
        id: sub.id,
        planId: sub.plan_id,
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
        createdAt: sub.created_at,
    };
}
