-- Webhook Events & Delivery Log
-- Tracks every event dispatched to merchant webhook endpoints
-- and the delivery status / retry history for each.

-- ─── webhook_events ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_events (
    id              TEXT PRIMARY KEY,
    type            TEXT NOT NULL,          -- e.g. 'payout.created'
    merchant_id     TEXT NOT NULL,
    data            JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_merchant
    ON webhook_events(merchant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type
    ON webhook_events(type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created
    ON webhook_events(created_at DESC);

-- ─── webhook_deliveries ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id              TEXT PRIMARY KEY,
    event_id        TEXT NOT NULL REFERENCES webhook_events(id),
    webhook_id      TEXT NOT NULL,
    url             TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending',   -- pending | success | failed
    http_status     INT,
    attempts        INT NOT NULL DEFAULT 0,
    max_attempts    INT NOT NULL DEFAULT 5,
    last_attempt_at TIMESTAMPTZ,
    next_retry_at   TIMESTAMPTZ,
    response_body   TEXT,
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event
    ON webhook_deliveries(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook
    ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status
    ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created
    ON webhook_deliveries(created_at DESC);

-- RLS (service role only — backend writes these)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_events"
    ON webhook_events FOR ALL
    USING (true) WITH CHECK (true);

CREATE POLICY "service_role_deliveries"
    ON webhook_deliveries FOR ALL
    USING (true) WITH CHECK (true);
