-- Add wallet_address and name to waitlist for linking wallet signups
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(44);
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Index for quick wallet lookup
CREATE INDEX IF NOT EXISTS idx_waitlist_wallet ON waitlist(wallet_address);
