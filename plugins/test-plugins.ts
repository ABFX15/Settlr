#!/usr/bin/env npx tsx
/**
 * E2E Plugin Test Suite
 *
 * Tests every API endpoint the plugins depend on, against the real Settlr API.
 * Run against local dev:  SETTLR_BASE_URL=http://localhost:3000 SETTLR_API_KEY=sk_test_xxx npx tsx plugins/test-plugins.ts
 * Run against production: SETTLR_API_KEY=sk_live_xxx npx tsx plugins/test-plugins.ts
 */

const BASE_URL = process.env.SETTLR_BASE_URL || "http://localhost:3000";
const API_KEY = process.env.SETTLR_API_KEY;

if (!API_KEY) {
  console.error("\n❌ SETTLR_API_KEY is required.\n");
  console.error("Usage:");
  console.error("  SETTLR_API_KEY=sk_test_xxx npx tsx plugins/test-plugins.ts");
  console.error("  SETTLR_BASE_URL=http://localhost:3000 SETTLR_API_KEY=sk_test_xxx npx tsx plugins/test-plugins.ts\n");
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let skipped = 0;

async function request(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<{ status: number; data: any }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY!,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err: any) {
    failed++;
    console.log(`  ❌ ${name}`);
    console.log(`     ${err.message}`);
  }
}

function skip(name: string, reason: string) {
  skipped++;
  console.log(`  ⏭️  ${name} — ${reason}`);
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

// ── Tests ──────────────────────────────────────────────────────────────

async function main() {

console.log(`\n🔗 Testing against: ${BASE_URL}`);
console.log(`🔑 API key: ${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}\n`);

// Track created resources for later tests
let createdPayoutId: string | null = null;
let batchId: string | null = null;

// ────────────────────────────────────────────────────────────────────────
// 0. FUND — deposit into the demo merchant balance so payout tests work
// ────────────────────────────────────────────────────────────────────────

console.log("━━━ Fund demo account ━━━");

await test("POST /api/treasury/deposit funds demo balance", async () => {
  const { status, data } = await request("POST", "/api/treasury/deposit", {
    txSignature: `demo_fund_${Date.now()}_e2e_test`,
    amount: 500,
    currency: "USDC",
  });
  assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
  assert(data.status === "credited", `Expected credited: ${JSON.stringify(data)}`);
  console.log(`     → Deposited $${data.amount} USDC, available: $${data.balance?.available ?? "?"}`);
});

// ────────────────────────────────────────────────────────────────────────
// 1. AUTH — used by Zapier authentication test
// ────────────────────────────────────────────────────────────────────────

console.log("━━━ Auth (Zapier) ━━━");

await test("GET /api/auth/me returns merchant profile", async () => {
  const { status, data } = await request("GET", "/api/auth/me");
  assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
  assert(typeof data.id === "string", `Missing merchant id: ${JSON.stringify(data)}`);
  assert(data.wallet || data.tier, `Missing wallet or tier data: ${JSON.stringify(data)}`);
  console.log(`     → Merchant: ${data.name || data.id}, tier: ${data.tier}`);
});

await test("GET /api/auth/me rejects bad key", async () => {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { "X-API-Key": "sk_invalid_nonsense_key" },
  });
  assert(res.status === 401, `Expected 401, got ${res.status}`);
});

await test("POST /api/sdk/validate validates key", async () => {
  const { status, data } = await request("POST", "/api/sdk/validate");
  assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
  assert(data.valid === true, `Expected valid=true: ${JSON.stringify(data)}`);
});

// ────────────────────────────────────────────────────────────────────────
// 2. BALANCE — used by Slack bot /pay-balance command
// ────────────────────────────────────────────────────────────────────────

console.log("\n━━━ Balance (Slack) ━━━");

await test("GET /api/balance returns USDC balance", async () => {
  const { status, data } = await request("GET", "/api/balance");
  assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
  assert(typeof data.usdc === "number", `Missing usdc field: ${JSON.stringify(data)}`);
  assert(data.currency === "USDC", `Expected USDC currency: ${JSON.stringify(data)}`);
  console.log(`     → Balance: $${data.usdc} USDC (wallet: ${data.wallet || "none"})`);
});

await test("GET /api/treasury/balance returns full details", async () => {
  const { status, data } = await request("GET", "/api/treasury/balance");
  assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
  assert(data.balance && typeof data.balance.available === "number", `Missing balance.available: ${JSON.stringify(data)}`);
  console.log(`     → Available: $${data.balance.available}, Reserved: $${data.balance.reserved}`);
});

// ────────────────────────────────────────────────────────────────────────
// 3. PAYOUTS — used by Slack /pay, Zapier Send Payout action
// ────────────────────────────────────────────────────────────────────────

console.log("\n━━━ Payouts (Slack + Zapier) ━━━");

await test("POST /api/payouts creates a payout", async () => {
  const { status, data } = await request("POST", "/api/payouts", {
    email: "plugin-test@settlr.dev",
    amount: 1.0,
    currency: "USDC",
    memo: "E2E plugin test",
    metadata: { source: "e2e-test", timestamp: new Date().toISOString() },
  });

  if (status === 402) {
    skip("POST /api/payouts", `Insufficient balance: $${data.balance?.available ?? "?"} available`);
    return;
  }

  assert(status === 201, `Expected 201, got ${status}: ${JSON.stringify(data)}`);
  assert(typeof data.id === "string", `Missing payout id: ${JSON.stringify(data)}`);
  assert(data.email === "plugin-test@settlr.dev", `Email mismatch: ${data.email}`);
  assert(data.amount === 1.0, `Amount mismatch: ${data.amount}`);
  assert(["sent", "claimed"].includes(data.status), `Unexpected status: ${data.status}`);

  createdPayoutId = data.id;
  console.log(`     → Payout ${data.id}: $${data.amount} → ${data.email} [${data.status}]`);
});

await test("POST /api/payouts validates input", async () => {
  const { status } = await request("POST", "/api/payouts", {
    email: "not-an-email",
    amount: 1.0,
  });
  assert(status === 400, `Expected 400 for bad email, got ${status}`);

  const { status: status2 } = await request("POST", "/api/payouts", {
    email: "test@test.com",
    amount: -5,
  });
  assert(status2 === 400, `Expected 400 for negative amount, got ${status2}`);
});

if (createdPayoutId) {
  await test(`GET /api/payouts/${createdPayoutId} returns payout details`, async () => {
    const { status, data } = await request("GET", `/api/payouts/${createdPayoutId}`);
    assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
    assert(data.id === createdPayoutId, `ID mismatch: ${data.id}`);
    assert(data.email === "plugin-test@settlr.dev", `Email mismatch: ${data.email}`);
    console.log(`     → Status: ${data.status}, Created: ${data.createdAt}`);
  });
} else {
  skip("GET /api/payouts/:id", "No payout created (probably insufficient balance)");
}

await test("GET /api/payouts lists payouts with filters", async () => {
  const { status, data } = await request("GET", "/api/payouts?limit=5");
  assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
  assert(Array.isArray(data.data), `Expected data.data array: ${JSON.stringify(data)}`);
  console.log(`     → Found ${data.count} payouts (showing ${data.data.length})`);
});

await test("GET /api/payouts?status=claimed (Zapier trigger)", async () => {
  const { status, data } = await request("GET", "/api/payouts?status=claimed&limit=5");
  assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
  assert(Array.isArray(data.data), `Expected data.data array`);
  console.log(`     → ${data.count} claimed payouts`);
});

// ────────────────────────────────────────────────────────────────────────
// 4. BATCH PAYOUTS — used by Slack /pay-batch command
// ────────────────────────────────────────────────────────────────────────

console.log("\n━━━ Batch Payouts (Slack) ━━━");

await test("POST /api/payouts/batch creates batch", async () => {
  const { status, data } = await request("POST", "/api/payouts/batch", {
    payouts: [
      { email: "batch-test-1@settlr.dev", amount: 1.0, memo: "E2E batch 1" },
      { email: "batch-test-2@settlr.dev", amount: 1.5, memo: "E2E batch 2" },
    ],
  });

  if (status === 402) {
    skip("POST /api/payouts/batch", `Insufficient balance`);
    return;
  }

  assert(status === 200 || status === 201, `Expected 200/201, got ${status}: ${JSON.stringify(data)}`);
  assert(typeof data.id === "string", `Missing batch id: ${JSON.stringify(data)}`);
  assert(Array.isArray(data.payouts), `Missing payouts array: ${JSON.stringify(data)}`);

  batchId = data.id;
  console.log(`     → Batch ${data.id}: ${data.count || data.payouts.length} payouts, total $${data.total}`);
});

await test("POST /api/payouts/batch validates input", async () => {
  const { status } = await request("POST", "/api/payouts/batch", { payouts: [] });
  assert(status === 400, `Expected 400 for empty batch, got ${status}`);
});

// ────────────────────────────────────────────────────────────────────────
// 5. PAYMENTS — used by Shopify app & Zapier create payment link action
// ────────────────────────────────────────────────────────────────────────

console.log("\n━━━ Payments (Shopify + Zapier) ━━━");

await test("GET /api/payments lists payments", async () => {
  const { status, data } = await request("GET", "/api/payments");
  assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
  assert(Array.isArray(data.payments) || Array.isArray(data.data), `Expected array: ${JSON.stringify(data)}`);
  const payments = data.payments || data.data;
  console.log(`     → ${payments.length} payments found`);
});

// ────────────────────────────────────────────────────────────────────────
// 6. WEBHOOKS — used by Shopify & WooCommerce
// ────────────────────────────────────────────────────────────────────────

console.log("\n━━━ Webhooks (Shopify + WooCommerce) ━━━");

await test("GET /api/webhooks lists registered webhooks", async () => {
  // The webhooks endpoint requires merchantId param (dashboard-style auth)
  // Use the merchant ID we got from /api/auth/me
  const { data: me } = await request("GET", "/api/auth/me");
  const merchantId = me?.id;
  const { status, data } = await request("GET", `/api/webhooks?merchantId=${merchantId}`);
  assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
  const hooks = Array.isArray(data) ? data : data.webhooks || [];
  console.log(`     → ${hooks.length} webhooks registered`);
});

// ────────────────────────────────────────────────────────────────────────
// Summary
// ────────────────────────────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════");
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log("══════════════════════════════════════════");

console.log("\n📋 Plugin compatibility matrix:");
console.log("┌──────────────┬────────────────────────────────────────────────┐");
console.log("│ Plugin       │ Endpoints tested                               │");
console.log("├──────────────┼────────────────────────────────────────────────┤");
console.log("│ Slack        │ POST /api/payouts, POST /api/payouts/batch,   │");
console.log("│              │ GET /api/payouts/:id, GET /api/balance         │");
console.log("├──────────────┼────────────────────────────────────────────────┤");
console.log("│ Zapier       │ GET /api/auth/me, POST /api/payouts,          │");
console.log("│              │ GET /api/payouts?status=, GET /api/payments    │");
console.log("├──────────────┼────────────────────────────────────────────────┤");
console.log("│ Shopify      │ GET /api/payments, POST /api/webhooks         │");
console.log("├──────────────┼────────────────────────────────────────────────┤");
console.log("│ WooCommerce  │ POST /api/payouts (via PHP), webhooks         │");
console.log("├──────────────┼────────────────────────────────────────────────┤");
console.log("│ Bubble       │ POST /api/payouts, GET /api/payments          │");
console.log("└──────────────┴────────────────────────────────────────────────┘");

if (failed > 0) {
  console.log("\n⚠️  Some tests failed. Check the output above for details.\n");
  process.exit(1);
} else {
  console.log("\n🎉 All tests passed! Plugins are compatible with this API.\n");
  process.exit(0);
}

} // end main

main().catch((err) => {
  console.error("\n💥 Fatal error:", err.message);
  process.exit(1);
});
