-- Persistence for B2B supplier payees + the off-ramp settlement flow.
-- Until now these lived in-memory (lost on restart); these tables back them.

-- ── Saved payees (supplier address book) ────────────────
CREATE TABLE IF NOT EXISTS payees (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    license_number TEXT,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payees_merchant ON payees(merchant_id);

-- ── Off-ramp requests ───────────────────────────────────
CREATE TABLE IF NOT EXISTS offramp_requests (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    wallet TEXT NOT NULL,
    method TEXT NOT NULL,
    region TEXT NOT NULL DEFAULT 'US',
    currency TEXT NOT NULL DEFAULT 'USD',
    amount NUMERIC(14, 2) NOT NULL,
    local_amount NUMERIC(14, 2) NOT NULL,
    account_info TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    provider TEXT,
    provider_ref TEXT,
    license_number TEXT,
    risk_score NUMERIC,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_offramp_requests_merchant ON offramp_requests(merchant_id);
CREATE INDEX IF NOT EXISTS idx_offramp_requests_status ON offramp_requests(status);

-- ── Off-ramp OTC batches ────────────────────────────────
CREATE TABLE IF NOT EXISTS offramp_batches (
    id TEXT PRIMARY KEY,
    request_ids JSONB NOT NULL DEFAULT '[]',
    total_amount NUMERIC(14, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'settled')),
    wire_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── RLS (service role only — these are server-managed) ──
ALTER TABLE payees ENABLE ROW LEVEL SECURITY;
ALTER TABLE offramp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offramp_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on payees"
    ON payees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on offramp_requests"
    ON offramp_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on offramp_batches"
    ON offramp_batches FOR ALL USING (true) WITH CHECK (true);

-- ── updated_at triggers ─────────────────────────────────
CREATE TRIGGER update_offramp_requests_updated_at
    BEFORE UPDATE ON offramp_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offramp_batches_updated_at
    BEFORE UPDATE ON offramp_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
