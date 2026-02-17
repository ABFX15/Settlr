-- Payouts table: tracks all outbound payouts from the Payout API
-- Each row represents a single payout to a recipient identified by email.

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

-- Index for looking up payouts by merchant
CREATE INDEX IF NOT EXISTS idx_payouts_merchant_id ON payouts(merchant_id);

-- Index for looking up payouts by claim token (recipient claim flow)
CREATE INDEX IF NOT EXISTS idx_payouts_claim_token ON payouts(claim_token);

-- Index for looking up payouts by email
CREATE INDEX IF NOT EXISTS idx_payouts_email ON payouts(email);

-- Index for looking up payouts by batch
CREATE INDEX IF NOT EXISTS idx_payouts_batch_id ON payouts(batch_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- Payout batches table: groups multiple payouts together
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

-- RLS policies
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_batches ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access on payouts"
    ON payouts FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on payout_batches"
    ON payout_batches FOR ALL
    USING (true)
    WITH CHECK (true);
