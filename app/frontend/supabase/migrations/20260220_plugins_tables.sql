-- Combined migration: create payouts, payout_batches, and webhooks tables
-- These tables are required by the plugin integrations (Slack, Zapier, Shopify, WooCommerce, Bubble)
--
-- Run with: psql $DATABASE_URL -f supabase/migrations/20260220_plugins_tables.sql
-- Or apply via Supabase dashboard: SQL Editor → paste & run

-- ─── Payouts ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payouts (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    merchant_wallet TEXT NOT NULL,
    email TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USDC',
    memo TEXT,
    metadata JSONB,
    status TEXT NOT NULL DEFAULT 'pending',
    claim_token TEXT NOT NULL UNIQUE,
    recipient_wallet TEXT,
    tx_signature TEXT,
    batch_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    funded_at TIMESTAMPTZ,
    claimed_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_payouts_merchant_id ON payouts(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payouts_claim_token ON payouts(claim_token);
CREATE INDEX IF NOT EXISTS idx_payouts_email ON payouts(email);
CREATE INDEX IF NOT EXISTS idx_payouts_batch_id ON payouts(batch_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on payouts" ON payouts;
CREATE POLICY "Service role full access on payouts"
    ON payouts FOR ALL
    USING (true)
    WITH CHECK (true);

-- ─── Payout Batches ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payout_batches (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'processing',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payout_batches_merchant_id ON payout_batches(merchant_id);

ALTER TABLE payout_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on payout_batches" ON payout_batches;
CREATE POLICY "Service role full access on payout_batches"
    ON payout_batches FOR ALL
    USING (true)
    WITH CHECK (true);

-- ─── Webhooks (endpoint configurations) ──────────────────────────────
CREATE TABLE IF NOT EXISTS webhooks (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    url TEXT NOT NULL,
    secret TEXT NOT NULL,
    events TEXT[] NOT NULL DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT true,
    last_delivery_at TIMESTAMPTZ,
    last_delivery_status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_merchant_id ON webhooks(merchant_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on webhooks" ON webhooks;
CREATE POLICY "Service role full access on webhooks"
    ON webhooks FOR ALL
    USING (true)
    WITH CHECK (true);

-- ─── Webhook Events ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    merchant_id TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_merchant ON webhook_events(merchant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created ON webhook_events(created_at DESC);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_events" ON webhook_events;
CREATE POLICY "service_role_events"
    ON webhook_events FOR ALL
    USING (true) WITH CHECK (true);

-- ─── Webhook Deliveries ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES webhook_events(id),
    webhook_id TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    http_status INT,
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    last_attempt_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ,
    response_body TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event ON webhook_deliveries(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created ON webhook_deliveries(created_at DESC);

ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_deliveries" ON webhook_deliveries;
CREATE POLICY "service_role_deliveries"
    ON webhook_deliveries FOR ALL
    USING (true) WITH CHECK (true);
