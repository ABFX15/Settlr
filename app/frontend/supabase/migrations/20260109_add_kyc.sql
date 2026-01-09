-- Add KYC fields to merchants table
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS kyc_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kyc_level TEXT DEFAULT 'basic-kyc-level';

-- Create customer_kyc table to track verification status
CREATE TABLE IF NOT EXISTS customer_kyc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_user_id TEXT NOT NULL, -- wallet address or email
    merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL, -- null = global
    sumsub_applicant_id TEXT,
    status TEXT NOT NULL DEFAULT 'not_started', -- not_started, pending, verified, rejected
    reject_reasons JSONB,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_customer_kyc_external_user 
ON customer_kyc(external_user_id);

CREATE INDEX IF NOT EXISTS idx_customer_kyc_merchant 
ON customer_kyc(merchant_id);

CREATE INDEX IF NOT EXISTS idx_customer_kyc_status 
ON customer_kyc(status);

-- Unique constraint: one verification per user per merchant (or global)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_kyc_unique 
ON customer_kyc(external_user_id, COALESCE(merchant_id, '00000000-0000-0000-0000-000000000000'::UUID));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customer_kyc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS customer_kyc_updated_at ON customer_kyc;
CREATE TRIGGER customer_kyc_updated_at
    BEFORE UPDATE ON customer_kyc
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_kyc_updated_at();

-- Comments for documentation
COMMENT ON TABLE customer_kyc IS 'Tracks KYC verification status for customers';
COMMENT ON COLUMN customer_kyc.external_user_id IS 'Wallet address or email used as Sumsub external user ID';
COMMENT ON COLUMN customer_kyc.merchant_id IS 'If null, this is a global verification valid for all merchants';
COMMENT ON COLUMN customer_kyc.sumsub_applicant_id IS 'Sumsub internal applicant ID';
COMMENT ON COLUMN customer_kyc.status IS 'Current verification status: not_started, pending, verified, rejected';
