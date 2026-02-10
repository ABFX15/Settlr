/**
 * Subscription Renewal Cron
 *
 * GET /api/subscriptions/cron/renew
 *
 * Called by Vercel Cron (or external scheduler) to process due subscriptions.
 * Charges customers whose billing period has ended and advances to next period.
 *
 * Cron schedule: every hour (or every 15 min for higher resolution)
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Protect with a secret so only cron can call this
const CRON_SECRET = process.env.CRON_SECRET || "";

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

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret (skip in development)
        const authHeader = request.headers.get("authorization");
        if (
            CRON_SECRET &&
            process.env.NODE_ENV === "production" &&
            authHeader !== `Bearer ${CRON_SECRET}`
        ) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!isSupabaseConfigured()) {
            return NextResponse.json({
                message: "Supabase not configured",
                processed: 0,
            });
        }

        const now = new Date().toISOString();
        const results = {
            processed: 0,
            charged: 0,
            failed: 0,
            cancelled: 0,
            trialConverted: 0,
            errors: [] as string[],
        };

        // 1. Handle trial-to-active conversions
        const { data: trialSubs } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("status", "trialing")
            .lte("trial_end", now);

        if (trialSubs && trialSubs.length > 0) {
            for (const sub of trialSubs) {
                try {
                    // Transition to active and charge
                    const periodStart = new Date();
                    const periodEnd = calculatePeriodEnd(
                        periodStart,
                        sub.interval,
                        sub.interval_count
                    );

                    await supabase
                        .from("subscriptions")
                        .update({
                            status: "active",
                            current_period_start: periodStart.toISOString(),
                            current_period_end: periodEnd.toISOString(),
                        })
                        .eq("id", sub.id);

                    const chargeResult = await chargeSubscription(sub);
                    if (chargeResult.success) {
                        results.trialConverted++;
                    } else {
                        await supabase
                            .from("subscriptions")
                            .update({ status: "past_due" })
                            .eq("id", sub.id);
                        results.failed++;
                    }
                    results.processed++;
                } catch (err) {
                    results.errors.push(
                        `Trial conversion failed for ${sub.id}: ${err}`
                    );
                }
            }
        }

        // 2. Process active subscriptions due for renewal
        const { data: dueSubs } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("status", "active")
            .lte("current_period_end", now)
            .eq("cancel_at_period_end", false);

        if (dueSubs && dueSubs.length > 0) {
            for (const sub of dueSubs) {
                try {
                    results.processed++;

                    // Advance to next period
                    const newPeriodStart = new Date(sub.current_period_end as string);
                    const newPeriodEnd = calculatePeriodEnd(
                        newPeriodStart,
                        sub.interval,
                        sub.interval_count
                    );

                    await supabase
                        .from("subscriptions")
                        .update({
                            current_period_start: newPeriodStart.toISOString(),
                            current_period_end: newPeriodEnd.toISOString(),
                        })
                        .eq("id", sub.id);

                    // Charge
                    const updatedSub = {
                        ...sub,
                        current_period_start: newPeriodStart.toISOString(),
                        current_period_end: newPeriodEnd.toISOString(),
                    };
                    const chargeResult = await chargeSubscription(updatedSub);

                    if (chargeResult.success) {
                        results.charged++;
                        // Fire webhook
                        await fireWebhook(sub, "subscription.renewed", chargeResult.payment);
                    } else {
                        // Increment retry count
                        const retryCount = (sub.retry_count || 0) + 1;
                        const maxRetries = sub.max_retries || 3;

                        if (retryCount >= maxRetries) {
                            // Max retries reached — mark as expired
                            await supabase
                                .from("subscriptions")
                                .update({
                                    status: "expired",
                                    retry_count: retryCount,
                                })
                                .eq("id", sub.id);
                            await fireWebhook(sub, "subscription.expired");
                        } else {
                            await supabase
                                .from("subscriptions")
                                .update({
                                    status: "past_due",
                                    retry_count: retryCount,
                                })
                                .eq("id", sub.id);
                        }
                        results.failed++;
                    }
                } catch (err) {
                    results.errors.push(`Renewal failed for ${sub.id}: ${err}`);
                }
            }
        }

        // 3. Handle cancel-at-period-end subscriptions
        const { data: cancelSubs } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("cancel_at_period_end", true)
            .in("status", ["active", "trialing"])
            .lte("current_period_end", now);

        if (cancelSubs && cancelSubs.length > 0) {
            for (const sub of cancelSubs) {
                await supabase
                    .from("subscriptions")
                    .update({ status: "cancelled" })
                    .eq("id", sub.id);
                await fireWebhook(sub, "subscription.cancelled");
                results.cancelled++;
                results.processed++;
            }
        }

        // 4. Retry past_due subscriptions (every run)
        const { data: pastDueSubs } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("status", "past_due")
            .lt("retry_count", 3);

        if (pastDueSubs && pastDueSubs.length > 0) {
            for (const sub of pastDueSubs) {
                try {
                    results.processed++;
                    const chargeResult = await chargeSubscription(sub);

                    if (chargeResult.success) {
                        await supabase
                            .from("subscriptions")
                            .update({
                                status: "active",
                                retry_count: 0,
                            })
                            .eq("id", sub.id);
                        results.charged++;
                    } else {
                        const retryCount = (sub.retry_count || 0) + 1;
                        if (retryCount >= (sub.max_retries || 3)) {
                            await supabase
                                .from("subscriptions")
                                .update({
                                    status: "expired",
                                    retry_count: retryCount,
                                })
                                .eq("id", sub.id);
                            await fireWebhook(sub, "subscription.expired");
                        } else {
                            await supabase
                                .from("subscriptions")
                                .update({ retry_count: retryCount })
                                .eq("id", sub.id);
                        }
                        results.failed++;
                    }
                } catch (err) {
                    results.errors.push(`Retry failed for ${sub.id}: ${err}`);
                }
            }
        }

        console.log("[Cron] Subscription renewal results:", results);

        return NextResponse.json({
            success: true,
            timestamp: now,
            ...results,
        });
    } catch (error) {
        console.error("[Cron] Error:", error);
        return NextResponse.json(
            { error: "Cron processing failed" },
            { status: 500 }
        );
    }
}

/**
 * Charge a subscription using the sponsor-transaction API
 */
async function chargeSubscription(
    sub: Record<string, unknown>
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
        // Create pending payment record
        await supabase.from("subscription_payments").insert({
            id: paymentId,
            subscription_id: subId,
            plan_id: planId,
            merchant_wallet: merchantWallet,
            customer_wallet: customerWallet,
            amount,
            currency: "USDC",
            status: "pending",
            period_start: periodStart,
            period_end: periodEnd,
        });

        // Execute payment via sponsor-transaction
        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const amountLamports = Math.floor(amount * 1_000_000);

        const response = await fetch(`${appUrl}/api/sponsor-transaction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "create-and-submit",
                amount: amountLamports,
                source: customerWallet,
                destination: merchantWallet,
                memo: `Settlr sub renewal ${subId}`,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(
                (err as Record<string, string>).error || "Payment failed"
            );
        }

        const txData = (await response.json()) as Record<string, unknown>;
        const signature = txData.transactionHash as string;

        // Mark payment completed
        await supabase
            .from("subscription_payments")
            .update({
                status: "completed",
                tx_signature: signature,
                platform_fee: amount * 0.01,
            })
            .eq("id", paymentId);

        return {
            success: true,
            payment: { id: paymentId, amount, signature, status: "completed" },
        };
    } catch (error) {
        console.error(`[Charge] Failed for sub ${subId}:`, error);

        await supabase
            .from("subscription_payments")
            .update({
                status: "failed",
                failure_reason:
                    error instanceof Error ? error.message : "Unknown error",
                attempt_count: ((sub.retry_count as number) || 0) + 1,
            })
            .eq("id", paymentId);

        return {
            success: false,
            error: error instanceof Error ? error.message : "Charge failed",
        };
    }
}

/**
 * Fire webhook to merchant for subscription events
 */
async function fireWebhook(
    sub: Record<string, unknown>,
    eventType: string,
    payment?: Record<string, unknown>
) {
    try {
        const merchantId = sub.merchant_id as string;

        // Look up merchant webhook URL
        const { data: merchant } = await supabase
            .from("merchants")
            .select("webhook_url, webhook_secret")
            .eq("id", merchantId)
            .single();

        if (!merchant?.webhook_url) return;

        const payload = {
            id: generateId("evt"),
            type: eventType,
            subscription: {
                id: sub.id,
                planId: sub.plan_id,
                customerWallet: sub.customer_wallet,
                amount: sub.amount,
                status: sub.status,
            },
            payment: payment || null,
            timestamp: new Date().toISOString(),
        };

        // Sign the webhook
        const signature = merchant.webhook_secret
            ? crypto
                .createHmac("sha256", merchant.webhook_secret)
                .update(JSON.stringify(payload))
                .digest("hex")
            : "";

        await fetch(merchant.webhook_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Settlr-Signature": signature,
                "X-Settlr-Event": eventType,
            },
            body: JSON.stringify(payload),
        }).catch((err) =>
            console.error(`[Webhook] Failed for ${merchantId}:`, err)
        );
    } catch (err) {
        console.error("[Webhook] Error:", err);
    }
}
