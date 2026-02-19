-- Settlr recipient network: auto-delivery, balances, notifications
-- Recipients who have claimed at least once get instant payouts

-- ============================================================
-- 1. Recipients registry (email → wallet mapping)
-- ============================================================

CREATE TABLE IF NOT EXISTS recipients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    wallet_address TEXT NOT NULL,
    display_name TEXT,
    
    -- Auth
    auth_token TEXT UNIQUE,            -- magic link token
    auth_token_expires_at TIMESTAMPTZ,
    
    -- Preferences
    notifications_enabled BOOLEAN DEFAULT true,
    auto_withdraw BOOLEAN DEFAULT true, -- true = instant on-chain, false = hold in balance
    
    -- Stats
    total_received NUMERIC(18,6) DEFAULT 0,
    total_payouts INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_payout_at TIMESTAMPTZ
);

CREATE INDEX idx_recipients_email ON recipients(email);
CREATE INDEX idx_recipients_wallet ON recipients(wallet_address);
CREATE INDEX idx_recipients_auth_token ON recipients(auth_token);

-- ============================================================
-- 2. Recipient balances (Settlr Balance)
-- ============================================================

CREATE TABLE IF NOT EXISTS recipient_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES recipients(id),
    currency TEXT DEFAULT 'USDC',
    balance NUMERIC(18,6) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(recipient_id, currency)
);

CREATE INDEX idx_balances_recipient ON recipient_balances(recipient_id);

-- ============================================================
-- 3. Balance transactions (credit/debit log)
-- ============================================================

CREATE TABLE IF NOT EXISTS balance_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES recipients(id),
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'withdrawal')),
    amount NUMERIC(18,6) NOT NULL,
    currency TEXT DEFAULT 'USDC',
    
    -- Reference
    payout_id TEXT,                   -- link to payouts table
    tx_signature TEXT,                -- on-chain signature for withdrawals
    description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_balance_tx_recipient ON balance_transactions(recipient_id);
CREATE INDEX idx_balance_tx_payout ON balance_transactions(payout_id);

-- ============================================================
-- 4. RLS policies
-- ============================================================

ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipient_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on recipients" ON recipients
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on recipient_balances" ON recipient_balances
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on balance_transactions" ON balance_transactions
    FOR ALL USING (true) WITH CHECK (true);
