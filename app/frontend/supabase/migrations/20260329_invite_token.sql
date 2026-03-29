-- Add invite_token column for magic-link gated onboarding
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS invite_token VARCHAR(64) UNIQUE;

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_invite_token ON waitlist(invite_token);
