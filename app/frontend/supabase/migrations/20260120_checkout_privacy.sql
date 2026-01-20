-- Add privacy fields to checkout_sessions table
-- Enables private payment links where amounts are encrypted on-chain

ALTER TABLE checkout_sessions 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;

ALTER TABLE checkout_sessions 
ADD COLUMN IF NOT EXISTS encrypted_amount TEXT;

ALTER TABLE checkout_sessions 
ADD COLUMN IF NOT EXISTS encrypted_handle TEXT;

ALTER TABLE checkout_sessions 
ADD COLUMN IF NOT EXISTS private_receipt_pda TEXT;

-- Index for filtering private sessions
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_is_private 
ON checkout_sessions(is_private) WHERE is_private = TRUE;

-- Comment for documentation
COMMENT ON COLUMN checkout_sessions.is_private IS 'Whether this is a private payment with FHE-encrypted amount';
COMMENT ON COLUMN checkout_sessions.encrypted_amount IS 'FHE-encrypted amount ciphertext (base64)';
COMMENT ON COLUMN checkout_sessions.encrypted_handle IS 'Inco Lightning handle (u128) for decryption';
COMMENT ON COLUMN checkout_sessions.private_receipt_pda IS 'On-chain PDA address of the private receipt';
