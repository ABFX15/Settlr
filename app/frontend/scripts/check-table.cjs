/**
 * Check which Supabase tables exist and which are missing.
 * Run: node scripts/check-table.cjs
 */
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const env = fs.readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
const sb = createClient(url, key);

const TABLES = [
    "merchants",
    "invoices",
    "payments",
    "purchase_orders",
    "checkout_sessions",
    "webhook_events",
    "subscriptions",
    "waitlist",
    "privacy_receipts",
    "one_click_payments",
    "leaflink_configs",
    "leaflink_syncs",
    "treasury_transactions",
    "payouts",
];

async function main() {
    console.log("Checking Supabase tables...\n");
    for (const table of TABLES) {
        const { error } = await sb.from(table).select("id").limit(1);
        if (error) {
            console.log(`  ❌ ${table} — MISSING (${error.message.slice(0, 60)})`);
        } else {
            console.log(`  ✅ ${table}`);
        }
    }
    console.log(
        "\nTo create missing tables, run the SQL from supabase/migrations/ in your Supabase SQL Editor.",
    );
    process.exit(0);
});
