-- ============================================
-- Merchant Treasury: Balance + Transaction Ledger
-- ============================================

-- Merchant balances (one per merchant per currency)
CREATE TABLE IF NOT EXISTS merchant_balances (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL REFERENCES merchants(id),
    currency TEXT NOT NULL DEFAULT 'USDC',
    available NUMERIC NOT NULL DEFAULT 0,
    pending NUMERIC NOT NULL DEFAULT 0,
    reserved NUMERIC NOT NULL DEFAULT 0,
    total_deposited NUMERIC NOT NULL DEFAULT 0,
    total_withdrawn NUMERIC NOT NULL DEFAULT 0,
    total_payouts NUMERIC NOT NULL DEFAULT 0,
    total_fees NUMERIC NOT NULL DEFAULT 0,
    deposit_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(merchant_id, currency)
);

-- Treasury transaction ledger (immutable audit trail)
CREATE TABLE IF NOT EXISTS treasury_transactions (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL REFERENCES merchants(id),
    type TEXT NOT NULL CHECK (type IN (
        'deposit',
        'payout_reserved',
        'payout_released',
        'payout_refund',
        'fee_deducted',
        'withdrawal'
    )),
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USDC',
    payout_id TEXT REFERENCES payouts(id),
    tx_signature TEXT,
    description TEXT,
    balance_after NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_merchant_balances_merchant ON merchant_balances(merchant_id);
CREATE INDEX IF NOT EXISTS idx_treasury_tx_merchant ON treasury_transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_treasury_tx_type ON treasury_transactions(type);
CREATE INDEX IF NOT EXISTS idx_treasury_tx_payout ON treasury_transactions(payout_id);
CREATE INDEX IF NOT EXISTS idx_treasury_tx_created ON treasury_transactions(created_at DESC);

-- RLS
ALTER TABLE merchant_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_transactions ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access on merchant_balances"
    ON merchant_balances FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on treasury_transactions"
    ON treasury_transactions FOR ALL
    USING (auth.role() = 'service_role');
