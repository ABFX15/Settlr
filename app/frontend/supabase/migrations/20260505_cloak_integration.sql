-- Cloak (ZK shielded payments) integration
-- Adds:
--   • merchants.cloak_viewing_nk      32-byte viewing key (hex), published openly
--                                     so that payers can encrypt chain notes to it
--   • merchants.cloak_set_at          when the merchant first registered with Cloak
--   • payments.is_cloak_private       true if this payment was settled through
--                                     the Cloak shielded pool (chain note exists)
--   • payments.cloak_signature        the on-chain Cloak transact signature
--   • payments.cloak_chain_note_hash  hash of the encrypted chain note (lookup key
--                                     when scanning for receipts)
--   • invoices.cloak_required         true if the buyer must pay via Cloak (vs
--                                     standard public USDC). Defaults false.
--
-- Viewing keys (`nk`) are NOT secret — they are an encryption target. The
-- corresponding spend key stays in the merchant's wallet and is derived
-- on-demand from a signed message (same pattern as receipt_pubkey).

ALTER TABLE merchants
    ADD COLUMN IF NOT EXISTS cloak_viewing_nk TEXT,
    ADD COLUMN IF NOT EXISTS cloak_set_at TIMESTAMPTZ;

COMMENT ON COLUMN merchants.cloak_viewing_nk IS
    'Hex-encoded 32-byte Cloak viewing key (nk). Published openly so payers can encrypt chain notes for this merchant. Derived deterministically client-side from a wallet signature.';

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS is_cloak_private BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cloak_signature TEXT,
    ADD COLUMN IF NOT EXISTS cloak_chain_note_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_cloak_signature
    ON payments(cloak_signature) WHERE cloak_signature IS NOT NULL;

COMMENT ON COLUMN payments.is_cloak_private IS
    'TRUE if this payment was settled through the Cloak shielded pool. Amounts and counterparties are not visible on the public ledger; only the merchant''s viewing key reveals details.';

ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS cloak_required BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cloak_signature TEXT,
    ADD COLUMN IF NOT EXISTS cloak_chain_note_hash TEXT;

COMMENT ON COLUMN invoices.cloak_required IS
    'If TRUE the public invoice page hides the standard pay button and requires the buyer to settle via Cloak.';
