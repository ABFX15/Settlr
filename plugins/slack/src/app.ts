/**
 * Settlr Slack Bot
 *
 * Slash commands:
 *   /pay <email> <amount> [memo]   — send USDC to an email address
 *   /pay-batch                     — upload CSV for batch payouts
 *   /pay-status <id>               — check a payout status
 *   /pay-balance                   — check connected wallet balance
 *
 * Approval workflows:
 *   If APPROVAL_CHANNEL is set and the amount exceeds APPROVAL_THRESHOLD,
 *   the bot posts an interactive approval request before sending.
 */

import "dotenv/config";
import { App, LogLevel } from "@slack/bolt";
import { SettlrAPI } from "./settlr-api";
import { parse as csvParse } from "csv-parse/sync";

// ── Config ────────────────────────────────────────────────────────────

const SETTLR_API_KEY = process.env.SETTLR_API_KEY!;
const SETTLR_BASE_URL = process.env.SETTLR_BASE_URL || "https://settlr.dev";
const APPROVAL_CHANNEL = process.env.APPROVAL_CHANNEL; // e.g. "#payment-approvals"
const APPROVAL_THRESHOLD = Number(process.env.APPROVAL_THRESHOLD || "1000");

if (!SETTLR_API_KEY) {
  console.error("❌  SETTLR_API_KEY is required");
  process.exit(1);
}

const api = new SettlrAPI(SETTLR_API_KEY, SETTLR_BASE_URL);

// ── Slack App ─────────────────────────────────────────────────────────

const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  socketMode: !!process.env.SLACK_APP_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  port: Number(process.env.PORT || 3100),
  logLevel: LogLevel.INFO,
});

// ── /pay <email> <amount> [memo] ──────────────────────────────────────

app.command("/pay", async ({ command, ack, respond, client }) => {
  await ack();

  const args = command.text.trim().split(/\s+/);
  const email = args[0];
  const amountStr = args[1];
  const memo = args.slice(2).join(" ") || undefined;

  // Validate
  if (!email || !email.includes("@") || !amountStr) {
    await respond({
      response_type: "ephemeral",
      text: "Usage: `/pay <email> <amount> [memo]`\nExample: `/pay alice@company.com 250 March bonus`",
    });
    return;
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    await respond({
      response_type: "ephemeral",
      text: `Invalid amount: \`${amountStr}\`. Must be a positive number.`,
    });
    return;
  }

  // Approval workflow — if amount exceeds threshold, request approval
  if (APPROVAL_CHANNEL && amount >= APPROVAL_THRESHOLD) {
    try {
      await client.chat.postMessage({
        channel: APPROVAL_CHANNEL,
        text: `💸 Payment approval requested`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Payment Approval Request*\n\n• *From:* <@${command.user_id}>\n• *To:* ${email}\n• *Amount:* $${amount.toFixed(2)} USDC\n${memo ? `• *Memo:* ${memo}\n` : ""}`,
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "✅ Approve" },
                style: "primary",
                action_id: "approve_payment",
                value: JSON.stringify({ email, amount, memo, requesterId: command.user_id, channelId: command.channel_id }),
              },
              {
                type: "button",
                text: { type: "plain_text", text: "❌ Reject" },
                style: "danger",
                action_id: "reject_payment",
                value: JSON.stringify({ email, amount, requesterId: command.user_id, channelId: command.channel_id }),
              },
            ],
          },
        ],
      });

      await respond({
        response_type: "ephemeral",
        text: `⏳ Payment of $${amount.toFixed(2)} to ${email} requires approval (threshold: $${APPROVAL_THRESHOLD}). Posted to ${APPROVAL_CHANNEL}.`,
      });
    } catch (err: any) {
      await respond({
        response_type: "ephemeral",
        text: `Error posting approval: ${err.message}`,
      });
    }
    return;
  }

  // Direct send — under threshold or no approval channel configured
  try {
    const payout = await api.createPayout({
      email,
      amount,
      memo,
      metadata: {
        slack_user: command.user_id,
        slack_channel: command.channel_id,
      },
    });

    await respond({
      response_type: "in_channel",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `✅ *Payout sent*\n\n• *To:* ${email}\n• *Amount:* $${amount.toFixed(2)} USDC\n${memo ? `• *Memo:* ${memo}\n` : ""}• *ID:* \`${payout.id}\`\n• *Status:* ${payout.status}\n• *Claim link:* ${payout.claimUrl}`,
          },
        },
      ],
    });
  } catch (err: any) {
    await respond({
      response_type: "ephemeral",
      text: `❌ Payout failed: ${err.message}`,
    });
  }
});

// ── Approval button handlers ──────────────────────────────────────────

app.action("approve_payment", async ({ action, ack, respond, client, body }) => {
  await ack();

  const payload = JSON.parse((action as any).value);
  const approver = (body as any).user?.id;

  try {
    const payout = await api.createPayout({
      email: payload.email,
      amount: payload.amount,
      memo: payload.memo,
      metadata: {
        slack_requester: payload.requesterId,
        slack_approver: approver,
        slack_channel: payload.channelId,
      },
    });

    // Update approval message
    await respond({
      replace_original: true,
      text: `✅ Approved by <@${approver}>`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `✅ *Payment approved* by <@${approver}>\n\n• *To:* ${payload.email}\n• *Amount:* $${payload.amount.toFixed(2)} USDC\n• *ID:* \`${payout.id}\`\n• *Claim:* ${payout.claimUrl}`,
          },
        },
      ],
    });

    // Notify requester
    await client.chat.postMessage({
      channel: payload.channelId,
      text: `✅ Your payment of $${payload.amount.toFixed(2)} to ${payload.email} was approved by <@${approver}> and sent. Payout ID: \`${payout.id}\``,
    });
  } catch (err: any) {
    await respond({
      replace_original: false,
      text: `❌ Failed to send approved payment: ${err.message}`,
    });
  }
});

app.action("reject_payment", async ({ action, ack, respond, client, body }) => {
  await ack();

  const payload = JSON.parse((action as any).value);
  const rejector = (body as any).user?.id;

  await respond({
    replace_original: true,
    text: `❌ Rejected by <@${rejector}>`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `❌ *Payment rejected* by <@${rejector}>\n\n• *To:* ${payload.email}\n• *Amount:* $${payload.amount.toFixed(2)} USDC`,
        },
      },
    ],
  });

  // Notify requester
  await client.chat.postMessage({
    channel: payload.channelId,
    text: `❌ Your payment of $${payload.amount.toFixed(2)} to ${payload.email} was rejected by <@${rejector}>.`,
  });
});

// ── /pay-batch ────────────────────────────────────────────────────────

app.command("/pay-batch", async ({ command, ack, respond }) => {
  await ack();

  const text = command.text.trim();
  if (!text) {
    await respond({
      response_type: "ephemeral",
      text: "Paste a CSV with columns: `email,amount,memo`\n\nExample:\n```\nalice@company.com,250,March\nbob@company.com,180,March\n```",
    });
    return;
  }

  try {
    const records = csvParse(text, {
      columns: false,
      skip_empty_lines: true,
      trim: true,
    }) as string[][];

    const payouts = records.map((row: string[]) => {
      const [email, amountStr, ...memoParts] = row;
      const amount = parseFloat(amountStr);
      if (!email?.includes("@") || isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid row: ${row.join(",")}`);
      }
      return { email, amount, memo: memoParts.join(",") || undefined };
    });

    if (payouts.length === 0) {
      await respond({
        response_type: "ephemeral",
        text: "No valid rows found in CSV.",
      });
      return;
    }

    const batch = await api.createBatch(payouts);

    const summary = batch.payouts
      .map(
        (p) => `• ${p.email}: $${p.amount.toFixed(2)} — \`${p.status}\``
      )
      .join("\n");

    await respond({
      response_type: "in_channel",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `✅ *Batch payout sent*\n\n• *Batch ID:* \`${batch.id}\`\n• *Total:* $${batch.total.toFixed(2)} USDC\n• *Count:* ${batch.count}\n\n${summary}`,
          },
        },
      ],
    });
  } catch (err: any) {
    await respond({
      response_type: "ephemeral",
      text: `❌ Batch failed: ${err.message}`,
    });
  }
});

// ── /pay-status <id> ──────────────────────────────────────────────────

app.command("/pay-status", async ({ command, ack, respond }) => {
  await ack();

  const id = command.text.trim();
  if (!id) {
    await respond({
      response_type: "ephemeral",
      text: "Usage: `/pay-status <payout_id>`\nExample: `/pay-status po_abc123`",
    });
    return;
  }

  try {
    const payout = await api.getPayout(id);

    const statusEmoji: Record<string, string> = {
      pending: "⏳",
      funded: "💰",
      sent: "📤",
      claimed: "✅",
      expired: "⌛",
      failed: "❌",
    };

    await respond({
      response_type: "ephemeral",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: [
              `${statusEmoji[payout.status] || "ℹ️"} *Payout ${payout.id}*`,
              "",
              `• *To:* ${payout.email}`,
              `• *Amount:* $${payout.amount.toFixed(2)} USDC`,
              `• *Status:* ${payout.status}`,
              payout.memo ? `• *Memo:* ${payout.memo}` : null,
              `• *Created:* ${payout.createdAt}`,
              payout.claimedAt ? `• *Claimed:* ${payout.claimedAt}` : null,
              payout.txSignature
                ? `• *Tx:* <https://solscan.io/tx/${payout.txSignature}|View on Solscan>`
                : null,
            ]
              .filter(Boolean)
              .join("\n"),
          },
        },
      ],
    });
  } catch (err: any) {
    await respond({
      response_type: "ephemeral",
      text: `❌ ${err.message}`,
    });
  }
});

// ── /pay-balance ──────────────────────────────────────────────────────

app.command("/pay-balance", async ({ command, ack, respond }) => {
  await ack();

  try {
    const balance = await api.getBalance();

    await respond({
      response_type: "ephemeral",
      text: `💰 *Wallet balance*\n\n• *Wallet:* \`${balance.wallet}\`\n• *USDC:* $${balance.usdc.toFixed(2)}`,
    });
  } catch (err: any) {
    await respond({
      response_type: "ephemeral",
      text: `❌ ${err.message}`,
    });
  }
});

// ── Start ─────────────────────────────────────────────────────────────

(async () => {
  await app.start();
  console.log("⚡ Settlr Slack bot is running");
})();
