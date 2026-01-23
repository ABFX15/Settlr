-- Add encrypted_ciphertext column for storing Inco Lightning ciphertext
-- This stores the actual encrypted data that can be used on-chain

ALTER TABLE privacy_receipts
ADD COLUMN IF NOT EXISTS encrypted_ciphertext TEXT;

-- Add comment for documentation
COMMENT ON COLUMN privacy_receipts.encrypted_ciphertext IS 'The FHE ciphertext from Inco Lightning, used for on-chain verification';
