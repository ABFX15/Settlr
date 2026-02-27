-- LeafLink ↔ Settlr integration tables
--
-- leaflink_syncs:   Tracks each LeafLink order through the settlement lifecycle
-- leaflink_configs: Per-merchant integration config (API keys, preferences)

-- ── Sync records ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leaflink_syncs (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    leaflink_order_id INTEGER NOT NULL,
    leaflink_order_number TEXT NOT NULL,
    seller_email TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    buyer_company TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    settlr_invoice_id TEXT,
    settlr_payment_link TEXT,
    tx_signature TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'link_sent', 'paid', 'synced', 'failed', 'cancelled')),
    metadata JSONB NOT NULL DEFAULT '{}',
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaflink_syncs_merchant ON leaflink_syncs(merchant_id);
CREATE INDEX IF NOT EXISTS idx_leaflink_syncs_order_id ON leaflink_syncs(leaflink_order_id);
CREATE INDEX IF NOT EXISTS idx_leaflink_syncs_invoice_id ON leaflink_syncs(settlr_invoice_id);
CREATE INDEX IF NOT EXISTS idx_leaflink_syncs_status ON leaflink_syncs(status);
CREATE INDEX IF NOT EXISTS idx_leaflink_syncs_created ON leaflink_syncs(created_at);

-- ── Integration configs ─────────────────────────────────

CREATE TABLE IF NOT EXISTS leaflink_configs (
    merchant_id TEXT PRIMARY KEY,
    leaflink_api_key TEXT NOT NULL,
    leaflink_company_id INTEGER NOT NULL,
    auto_create_invoice BOOLEAN NOT NULL DEFAULT TRUE,
    auto_send_link BOOLEAN NOT NULL DEFAULT TRUE,
    webhook_secret TEXT,
    metrc_sync BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaflink_configs_company ON leaflink_configs(leaflink_company_id);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE leaflink_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaflink_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on leaflink_syncs"
    ON leaflink_syncs FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on leaflink_configs"
    ON leaflink_configs FOR ALL
    USING (true)
    WITH CHECK (true);

-- ── Triggers ────────────────────────────────────────────

CREATE TRIGGER update_leaflink_syncs_updated_at
    BEFORE UPDATE ON leaflink_syncs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaflink_configs_updated_at
    BEFORE UPDATE ON leaflink_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
