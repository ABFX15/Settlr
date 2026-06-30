-- Durable merchant settings (business profile, EVM receiving address,
-- auto-offramp, notifications, LeafLink config). Previously in-memory and lost
-- on restart. Stored as a JSON blob keyed by the merchant's wallet.

CREATE TABLE IF NOT EXISTS merchant_settings (
    wallet      TEXT PRIMARY KEY,
    settings    JSONB NOT NULL,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE merchant_settings ENABLE ROW LEVEL SECURITY;

-- Service role only (the server uses the service-role key; never exposed to
-- the browser). No anon access.
CREATE POLICY "Allow all for service role" ON merchant_settings
    FOR ALL USING (true);
