-- ============================================================================
-- Data Pipeline Tables
-- ============================================================================
-- Central event bus + pre-aggregated analytics for Settlr.
-- Supports the /api/pipeline/* endpoints.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Pipeline Events — every state change becomes an event
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pipeline_events (
    id           TEXT PRIMARY KEY,
    event_type   TEXT NOT NULL,
    entity_type  TEXT NOT NULL,
    entity_id    TEXT NOT NULL,
    merchant_id  TEXT NOT NULL,
    data         JSONB DEFAULT '{}',
    processed    BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookup for batch processor: unprocessed events ordered by time
CREATE INDEX IF NOT EXISTS idx_pipeline_events_pending
    ON pipeline_events (processed, created_at)
    WHERE processed = FALSE;

-- Merchant event history (dashboard + export)
CREATE INDEX IF NOT EXISTS idx_pipeline_events_merchant
    ON pipeline_events (merchant_id, created_at DESC);

-- Filter by event type
CREATE INDEX IF NOT EXISTS idx_pipeline_events_type
    ON pipeline_events (event_type, created_at DESC);

-- ---------------------------------------------------------------------------
-- 2. Merchant Daily Stats — pre-aggregated per-merchant daily rollups
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS merchant_daily_stats (
    id                    TEXT PRIMARY KEY,
    merchant_id           TEXT NOT NULL,
    date                  DATE NOT NULL,
    payments_count        INTEGER DEFAULT 0,
    payments_volume       NUMERIC(20, 6) DEFAULT 0,
    invoices_created      INTEGER DEFAULT 0,
    invoices_paid         INTEGER DEFAULT 0,
    invoices_paid_volume  NUMERIC(20, 6) DEFAULT 0,
    payouts_count         INTEGER DEFAULT 0,
    payouts_volume        NUMERIC(20, 6) DEFAULT 0,
    fees_collected        NUMERIC(20, 6) DEFAULT 0,
    orders_created        INTEGER DEFAULT 0,
    orders_paid_volume    NUMERIC(20, 6) DEFAULT 0,
    active_subscriptions  INTEGER DEFAULT 0,
    subscription_revenue  NUMERIC(20, 6) DEFAULT 0,
    new_recipients        INTEGER DEFAULT 0,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (merchant_id, date)
);

CREATE INDEX IF NOT EXISTS idx_merchant_daily_stats_lookup
    ON merchant_daily_stats (merchant_id, date DESC);

-- ---------------------------------------------------------------------------
-- 3. Platform Daily Stats — platform-wide daily rollups
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_daily_stats (
    id                TEXT PRIMARY KEY,
    date              DATE NOT NULL UNIQUE,
    total_merchants   INTEGER DEFAULT 0,
    active_merchants  INTEGER DEFAULT 0,
    payments_count    INTEGER DEFAULT 0,
    payments_volume   NUMERIC(20, 6) DEFAULT 0,
    invoices_created  INTEGER DEFAULT 0,
    invoices_paid     INTEGER DEFAULT 0,
    payouts_count     INTEGER DEFAULT 0,
    payouts_volume    NUMERIC(20, 6) DEFAULT 0,
    fees_collected    NUMERIC(20, 6) DEFAULT 0,
    new_merchants     INTEGER DEFAULT 0,
    new_recipients    INTEGER DEFAULT 0,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_daily_stats_date
    ON platform_daily_stats (date DESC);

-- ---------------------------------------------------------------------------
-- 4. Row-Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE pipeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_daily_stats ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (API routes use service role)
CREATE POLICY "pipeline_events_service"
    ON pipeline_events FOR ALL
    USING (true) WITH CHECK (true);

CREATE POLICY "merchant_daily_stats_service"
    ON merchant_daily_stats FOR ALL
    USING (true) WITH CHECK (true);

CREATE POLICY "platform_daily_stats_service"
    ON platform_daily_stats FOR ALL
    USING (true) WITH CHECK (true);
