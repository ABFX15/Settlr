-- Add session-tracking columns to privacy_receipts.
-- The privacy receipt API (api/privacy/receipt) writes a `session_hash`
-- (deterministic hash of paymentId/amount/customer/merchant), a coarse
-- session lifecycle status, and a delegation flag for MagicBlock PER.
-- These weren't part of the original 20260116 schema.

ALTER TABLE privacy_receipts
    ADD COLUMN IF NOT EXISTS session_hash   TEXT,
    ADD COLUMN IF NOT EXISTS session_status TEXT
        CHECK (session_status IN ('pending', 'active', 'settled', 'revoked', 'expired')),
    ADD COLUMN IF NOT EXISTS is_delegated   BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_privacy_receipts_session_hash
    ON privacy_receipts(session_hash);
CREATE INDEX IF NOT EXISTS idx_privacy_receipts_session_status
    ON privacy_receipts(session_status);

COMMENT ON COLUMN privacy_receipts.session_hash IS
    'SHA-256(paymentId|amount|customer|merchant), base58. Lets the privacy session be looked up without revealing the components.';
COMMENT ON COLUMN privacy_receipts.session_status IS
    'Coarse lifecycle: pending → active → settled (or revoked/expired). Distinct from `status` which is the receipt row state.';
COMMENT ON COLUMN privacy_receipts.is_delegated IS
    'True once the on-chain PDA has been delegated to MagicBlock for ER execution.';
