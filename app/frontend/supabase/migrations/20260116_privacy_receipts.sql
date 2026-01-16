-- Privacy Receipts table
-- Stores encrypted payment receipt handles for Inco Lightning integration
-- The actual encrypted data lives in Inco's covalidator network

CREATE TABLE IF NOT EXISTS privacy_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id TEXT NOT NULL UNIQUE,
    customer_wallet TEXT NOT NULL,
    merchant_wallet TEXT NOT NULL,
    
    -- Encrypted handle (u128 stored as text since Postgres doesn't have u128)
    -- In production, this would be the actual Inco Lightning handle
    encrypted_handle TEXT NOT NULL,
    
    -- Hash of the encrypted data for verification (without revealing amount)
    encrypted_hash TEXT,
    
    -- Timestamp of original payment
    payment_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Privacy metadata
    privacy_version INTEGER DEFAULT 1,
    encryption_method TEXT DEFAULT 'inco_lightning_fhe',
    
    -- Allowance tracking (who can decrypt)
    customer_allowance_granted BOOLEAN DEFAULT TRUE,
    merchant_allowance_granted BOOLEAN DEFAULT TRUE,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_privacy_receipts_payment_id ON privacy_receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_privacy_receipts_customer ON privacy_receipts(customer_wallet);
CREATE INDEX IF NOT EXISTS idx_privacy_receipts_merchant ON privacy_receipts(merchant_wallet);
CREATE INDEX IF NOT EXISTS idx_privacy_receipts_handle ON privacy_receipts(encrypted_handle);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_privacy_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_privacy_receipts_updated_at
    BEFORE UPDATE ON privacy_receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_privacy_receipts_updated_at();

-- RLS policies (if needed)
ALTER TABLE privacy_receipts ENABLE ROW LEVEL SECURITY;

-- Allow read access for authorized parties only
CREATE POLICY "Users can read their own privacy receipts" ON privacy_receipts
    FOR SELECT
    USING (true); -- For demo, allow all reads. In production: auth.uid() check
