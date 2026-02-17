/**
 * Email utility for sending payout claim emails.
 *
 * Uses Resend in production (RESEND_API_KEY env var).
 * Falls back to console.log for development / when no key is set.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.PAYOUT_FROM_EMAIL || "payouts@settlr.dev";
const APP_NAME = "Settlr";

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

async function sendViaResend(options: SendEmailOptions): Promise<boolean> {
    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: `${APP_NAME} <${FROM_EMAIL}>`,
                to: [options.to],
                subject: options.subject,
                html: options.html,
                text: options.text,
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error("[email] Resend API error:", res.status, err);
            return false;
        }

        console.log(`[email] Sent to ${options.to} via Resend`);
        return true;
    } catch (error) {
        console.error("[email] Resend send failed:", error);
        return false;
    }
}

function logToConsole(options: SendEmailOptions): boolean {
    console.log("─────────────────────────────────────────");
    console.log(`[email] TO: ${options.to}`);
    console.log(`[email] SUBJECT: ${options.subject}`);
    console.log(`[email] BODY (text): ${options.text || "(html only)"}`);
    console.log("─────────────────────────────────────────");
    return true;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (RESEND_API_KEY) {
        return sendViaResend(options);
    }
    return logToConsole(options);
}

/**
 * Send a payout claim email to a recipient.
 */
export async function sendPayoutClaimEmail(params: {
    to: string;
    amount: number;
    currency: string;
    memo?: string;
    claimUrl: string;
    merchantName?: string;
    expiresAt: Date;
}): Promise<boolean> {
    const { to, amount, currency, memo, claimUrl, merchantName, expiresAt } = params;
    const formattedAmount = `$${amount.toFixed(2)} ${currency}`;
    const expiresFormatted = expiresAt.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    const sender = merchantName || "A platform";

    const subject = `${sender} sent you ${formattedAmount}`;

    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #111; font-size: 24px; margin: 0;">You've been paid</h1>
        </div>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #666; font-size: 14px; margin: 0 0 8px;">Amount</p>
            <p style="color: #111; font-size: 36px; font-weight: 700; margin: 0;">${formattedAmount}</p>
            ${memo ? `<p style="color: #888; font-size: 14px; margin: 8px 0 0;">${memo}</p>` : ""}
        </div>
        <p style="color: #444; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            ${sender} sent you <strong>${formattedAmount}</strong> via Settlr.
            Click the button below to claim your funds — no bank details needed.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
            <a href="${claimUrl}" style="display: inline-block; background: #3B82F6; color: #fff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                Claim your ${currency}
            </a>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">
            This link expires on ${expiresFormatted}. If you didn't expect this, you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="color: #bbb; font-size: 11px; text-align: center;">
            Powered by <a href="https://settlr.dev" style="color: #3B82F6; text-decoration: none;">Settlr</a> — global payout infrastructure
        </p>
    </div>`;

    const text = `${sender} sent you ${formattedAmount}${memo ? ` — ${memo}` : ""}. Claim your funds: ${claimUrl} (expires ${expiresFormatted})`;

    return sendEmail({ to, subject, html, text });
}
