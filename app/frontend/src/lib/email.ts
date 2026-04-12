/**
 * Email utility for sending settlement notification emails.
 *
 * Uses Resend in production (RESEND_API_KEY env var).
 * Falls back to console.log for development / when no key is set.
 */

import { explorerUrl as buildExplorerUrl } from "./constants";

const FROM_EMAIL = process.env.PAYOUT_FROM_EMAIL || "adam@settlr.dev";
const APP_NAME = "Settlr";

function getResendKey(): string | undefined {
    return process.env.RESEND_API_KEY;
}

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

async function sendViaResend(options: SendEmailOptions): Promise<boolean> {
    const apiKey = getResendKey();
    if (!apiKey) {
        console.error("[email] RESEND_API_KEY is not set");
        return false;
    }
    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
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
    if (getResendKey()) {
        return sendViaResend(options);
    }
    console.warn("[email] No RESEND_API_KEY — falling back to console log");
    return logToConsole(options);
}

/**
 * Send a payout claim email to a recipient.
 */
/**
 * Send a notification email when a payout was auto-delivered to a known wallet.
 */
export async function sendInstantPayoutEmail(params: {
    to: string;
    amount: number;
    currency: string;
    memo?: string;
    walletAddress: string;
    txSignature: string;
    merchantName?: string;
}): Promise<boolean> {
    const { to, amount, currency, memo, walletAddress, txSignature, merchantName } = params;
    const formattedAmount = `$${amount.toFixed(2)} ${currency}`;
    const sender = merchantName || "A platform";
    const shortWallet = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
    const explorerUrl = buildExplorerUrl(txSignature);

    const subject = `${formattedAmount} sent to your wallet`;

    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <div style="background: #34d399; color: #fff; width: 56px; height: 56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px;">✓</div>
            <h1 style="color: #212121; font-size: 24px; margin: 0;">Instant settlement received</h1>
        </div>
        <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; border: 1px solid #bbf7d0;">
            <p style="color: #666; font-size: 14px; margin: 0 0 8px;">Amount</p>
            <p style="color: #212121; font-size: 36px; font-weight: 700; margin: 0;">${formattedAmount}</p>
            ${memo ? `<p style="color: #8a8a8a; font-size: 14px; margin: 8px 0 0;">${memo}</p>` : ""}
        </div>
        <p style="color: #444; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            ${sender} sent you <strong>${formattedAmount}</strong> and it was <strong>delivered instantly</strong> to your saved wallet (<code>${shortWallet}</code>). No action needed.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
            <a href="${explorerUrl}" style="display: inline-block; background: #3B82F6; color: #fff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                View transaction ↗
            </a>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">
            Want to change your wallet or turn off instant delivery? <a href="https://settlr.dev/me" style="color: #3B82F6; text-decoration: none;">Manage your preferences</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="color: #bbb; font-size: 11px; text-align: center;">
            Powered by <a href="https://settlr.dev" style="color: #3B82F6; text-decoration: none;">Settlr</a> — non-custodial settlement infrastructure
        </p>
    </div>`;

    const text = `${sender} sent you ${formattedAmount}${memo ? ` — ${memo}` : ""}. Delivered instantly to ${shortWallet}. View: ${explorerUrl}`;

    return sendEmail({ to, subject, html, text });
}

/**
 * Send a magic link email for recipient dashboard access.
 */
export async function sendAuthLinkEmail(params: {
    to: string;
    authUrl: string;
}): Promise<boolean> {
    const { to, authUrl } = params;
    const subject = "Sign in to Settlr";

    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #212121; font-size: 24px; margin: 0;">Sign in to Settlr</h1>
        </div>
        <p style="color: #444; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Click the button below to access your recipient dashboard. This link expires in 15 minutes.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
            <a href="${authUrl}" style="display: inline-block; background: #3B82F6; color: #fff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                Sign in →
            </a>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">
            If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="color: #bbb; font-size: 11px; text-align: center;">
            Powered by <a href="https://settlr.dev" style="color: #3B82F6; text-decoration: none;">Settlr</a> — non-custodial settlement infrastructure
        </p>
    </div>`;

    const text = `Sign in to Settlr: ${authUrl} — this link expires in 15 minutes.`;

    return sendEmail({ to, subject, html, text });
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
            <h1 style="color: #212121; font-size: 24px; margin: 0;">You've been paid</h1>
        </div>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #666; font-size: 14px; margin: 0 0 8px;">Amount</p>
            <p style="color: #212121; font-size: 36px; font-weight: 700; margin: 0;">${formattedAmount}</p>
            ${memo ? `<p style="color: #8a8a8a; font-size: 14px; margin: 8px 0 0;">${memo}</p>` : ""}
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
            Powered by <a href="https://settlr.dev" style="color: #3B82F6; text-decoration: none;">Settlr</a> — non-custodial settlement infrastructure
        </p>
    </div>`;

    const text = `${sender} sent you ${formattedAmount}${memo ? ` — ${memo}` : ""}. Claim your funds: ${claimUrl} (expires ${expiresFormatted})`;

    return sendEmail({ to, subject, html, text });
}

/**
 * Send an invoice email to a buyer.
 */
export async function sendInvoiceEmail(params: {
    to: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    buyerName: string;
    merchantName: string;
    dueDate: Date;
    invoiceUrl: string;
    memo?: string;
}): Promise<boolean> {
    const { to, invoiceNumber, amount, currency, buyerName, merchantName, dueDate, invoiceUrl, memo } = params;
    const formattedAmount = `$${amount.toFixed(2)} ${currency}`;
    const dueFormatted = dueDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    const subject = `Invoice ${invoiceNumber} from ${merchantName} — ${formattedAmount}`;

    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #212121; font-size: 24px; margin: 0 0 8px;">Invoice from ${merchantName}</h1>
            <p style="color: #8a8a8a; font-size: 14px; margin: 0;">${invoiceNumber}</p>
        </div>
        <div style="background: #F8F7F3; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; border: 1px solid #d3d3d3;">
            <p style="color: #8a8a8a; font-size: 14px; margin: 0 0 8px;">Amount Due</p>
            <p style="color: #212121; font-size: 36px; font-weight: 700; margin: 0;">${formattedAmount}</p>
            <p style="color: #8a8a8a; font-size: 14px; margin: 8px 0 0;">Due by ${dueFormatted}</p>
        </div>
        <p style="color: #5c5c5c; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Hi ${buyerName},<br><br>
            ${merchantName} has sent you an invoice for <strong>${formattedAmount}</strong>.
            ${memo ? `<br><em style="color: #8a8a8a;">${memo}</em>` : ""}
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
            <a href="${invoiceUrl}" style="display: inline-block; background: #34c759; color: #fff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                View & Pay Invoice →
            </a>
        </div>
        <p style="color: #8a8a8a; font-size: 12px; text-align: center;">
            Pay online — no bank transfers, no delays. Funds settle instantly.
        </p>
        <hr style="border: none; border-top: 1px solid #d3d3d3; margin: 32px 0;" />
        <p style="color: #8a8a8a; font-size: 11px; text-align: center;">
            Powered by <a href="https://settlr.dev" style="color: #34c759; text-decoration: none;">Settlr</a> — instant business payments
        </p>
    </div>`;

    const text = `Invoice ${invoiceNumber} from ${merchantName} for ${formattedAmount}. Due ${dueFormatted}. View and pay: ${invoiceUrl}`;

    return sendEmail({ to, subject, html, text });
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  COLLECTION REMINDER EMAILS                                            */
/* ═══════════════════════════════════════════════════════════════════════ */

type ReminderTone = "pre_due_nudge" | "due_today" | "overdue_gentle" | "overdue_firm" | "overdue_final";

const REMINDER_COPY: Record<ReminderTone, {
    subject: (inv: string, merchant: string) => string;
    heading: string;
    body: (buyerName: string, merchant: string, amount: string, due: string) => string;
    cta: string;
    urgencyColor: string;
    urgencyBg: string;
}> = {
    pre_due_nudge: {
        subject: (inv, m) => `Reminder: Invoice ${inv} from ${m} is due soon`,
        heading: "Payment due soon",
        body: (b, m, a, d) => `Hi ${b},<br><br>Just a friendly reminder that invoice for <strong>${a}</strong> from ${m} is due on <strong>${d}</strong>. Please arrange payment at your earliest convenience.`,
        cta: "View & Pay Invoice →",
        urgencyColor: "#3B82F6",
        urgencyBg: "#EFF6FF",
    },
    due_today: {
        subject: (inv, m) => `Due today: Invoice ${inv} from ${m}`,
        heading: "Payment due today",
        body: (b, m, a, d) => `Hi ${b},<br><br>Your invoice for <strong>${a}</strong> from ${m} is <strong>due today</strong>. Please submit payment to avoid any delays.`,
        cta: "Pay Now →",
        urgencyColor: "#F59E0B",
        urgencyBg: "#FFFBEB",
    },
    overdue_gentle: {
        subject: (inv, m) => `Payment overdue: Invoice ${inv} from ${m}`,
        heading: "Payment is overdue",
        body: (b, m, a, d) => `Hi ${b},<br><br>Your invoice for <strong>${a}</strong> from ${m} was due on <strong>${d}</strong> and is now <strong>past due</strong>. Please arrange payment as soon as possible.`,
        cta: "Pay Now →",
        urgencyColor: "#F97316",
        urgencyBg: "#FFF7ED",
    },
    overdue_firm: {
        subject: (inv, m) => `Action required: Invoice ${inv} from ${m} is 7 days overdue`,
        heading: "Payment is 7 days overdue",
        body: (b, m, a, d) => `Hi ${b},<br><br>This is a follow-up regarding your overdue invoice for <strong>${a}</strong> from ${m}, originally due <strong>${d}</strong>. Please arrange immediate payment to keep your account in good standing.`,
        cta: "Pay Immediately →",
        urgencyColor: "#EF4444",
        urgencyBg: "#FEF2F2",
    },
    overdue_final: {
        subject: (inv, m) => `Final notice: Invoice ${inv} from ${m}`,
        heading: "Final payment notice",
        body: (b, m, a, d) => `Hi ${b},<br><br>This is a final notice for your overdue invoice of <strong>${a}</strong> from ${m}, originally due <strong>${d}</strong>. Immediate payment is required. If you have already submitted payment, please disregard this notice.`,
        cta: "Pay Now →",
        urgencyColor: "#e74c3c",
        urgencyBg: "#FEF2F2",
    },
};

export async function sendCollectionReminderEmail(params: {
    to: string;
    type: ReminderTone;
    invoiceNumber: string;
    amount: number;
    currency: string;
    buyerName: string;
    merchantName: string;
    dueDate: Date;
    invoiceUrl: string;
    daysOverdue?: number;
}): Promise<boolean> {
    const { to, type, invoiceNumber, amount, currency, buyerName, merchantName, dueDate, invoiceUrl, daysOverdue } = params;
    const copy = REMINDER_COPY[type];
    const formattedAmount = `$${amount.toFixed(2)} ${currency}`;
    const dueFormatted = dueDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    const subject = copy.subject(invoiceNumber, merchantName);

    const overdueTag = daysOverdue && daysOverdue > 0
        ? `<div style="background: ${copy.urgencyBg}; border: 1px solid ${copy.urgencyColor}20; border-radius: 8px; padding: 10px 16px; text-align: center; margin-bottom: 20px;">
            <span style="color: ${copy.urgencyColor}; font-size: 13px; font-weight: 600;">${daysOverdue} day${daysOverdue !== 1 ? "s" : ""} past due</span>
           </div>`
        : "";

    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #212121; font-size: 24px; margin: 0 0 8px;">${copy.heading}</h1>
            <p style="color: #8a8a8a; font-size: 14px; margin: 0;">${invoiceNumber} · ${merchantName}</p>
        </div>
        ${overdueTag}
        <div style="background: ${copy.urgencyBg}; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; border: 1px solid #d3d3d3;">
            <p style="color: #8a8a8a; font-size: 14px; margin: 0 0 8px;">Amount Due</p>
            <p style="color: #212121; font-size: 36px; font-weight: 700; margin: 0;">${formattedAmount}</p>
            <p style="color: ${copy.urgencyColor}; font-size: 14px; margin: 8px 0 0; font-weight: 600;">Due ${dueFormatted}</p>
        </div>
        <p style="color: #5c5c5c; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            ${copy.body(buyerName, merchantName, formattedAmount, dueFormatted)}
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
            <a href="${invoiceUrl}" style="display: inline-block; background: ${copy.urgencyColor}; color: #fff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                ${copy.cta}
            </a>
        </div>
        <p style="color: #8a8a8a; font-size: 12px; text-align: center;">
            If you've already submitted payment, please disregard this reminder.
        </p>
        <hr style="border: none; border-top: 1px solid #d3d3d3; margin: 32px 0;" />
        <p style="color: #8a8a8a; font-size: 11px; text-align: center;">
            Powered by <a href="https://settlr.dev" style="color: #34c759; text-decoration: none;">Settlr</a> — instant business payments
        </p>
    </div>`;

    const text = `${copy.heading}: Invoice ${invoiceNumber} from ${merchantName} for ${formattedAmount}, due ${dueFormatted}. Pay here: ${invoiceUrl}`;

    return sendEmail({ to, subject, html, text });
}
