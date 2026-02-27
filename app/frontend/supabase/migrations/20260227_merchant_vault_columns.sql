-- Add signer_wallet and multisig_pda columns to merchants table
-- signer_wallet: The user's personal wallet (Phantom/Solflare) used for auth
-- multisig_pda: The Squads multisig PDA that governs the vault
-- wallet_address remains the settlement address (vault PDA for Squads merchants)

ALTER TABLE merchants ADD COLUMN IF NOT EXISTS signer_wallet VARCHAR(44);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS multisig_pda VARCHAR(44);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS license_number VARCHAR(64);

-- Index for looking up merchants by signer wallet (primary auth lookup)
CREATE INDEX IF NOT EXISTS idx_merchants_signer_wallet ON merchants(signer_wallet);

-- Add website_url column if it doesn't exist (was referenced in code but missing from migrations)
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS website_url TEXT;
