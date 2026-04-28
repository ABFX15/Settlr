-- Real receipt encryption (NaCl box).
-- Adds the columns required to store ciphertext, nonce, ephemeral
-- sender pubkey and a SHA-256 hash for on-chain anchoring.
-- Adds the merchant's long-lived X25519 receipt-decryption pubkey to
-- the merchants table so customers can encrypt to it at checkout.

-- ─── privacy_receipts: encrypted payload columns ────────────────
ALTER TABLE privacy_receipts
    ADD COLUMN IF NOT EXISTS ciphertext TEXT,           -- base64
    ADD COLUMN IF NOT EXISTS encryption_nonce TEXT,     -- base64 (24 bytes)
    ADD COLUMN IF NOT EXISTS ephemeral_pubkey TEXT,     -- base58 (32 bytes)
    ADD COLUMN IF NOT EXISTS recipient_pubkey TEXT,     -- base58 (32 bytes) — merchant X25519 pk
    ADD COLUMN IF NOT EXISTS payload_hash TEXT,         -- base58 SHA-256 of ciphertext
    ADD COLUMN IF NOT EXISTS tx_signature TEXT,         -- on-chain signature this receipt anchors to
    ADD COLUMN IF NOT EXISTS encryption_scheme INTEGER DEFAULT 1;

-- For lookup by tx
CREATE INDEX IF NOT EXISTS idx_privacy_receipts_tx_signature
    ON privacy_receipts(tx_signature);
CREATE INDEX IF NOT EXISTS idx_privacy_receipts_payload_hash
    ON privacy_receipts(payload_hash);

COMMENT ON COLUMN privacy_receipts.ciphertext IS
    'NaCl-box ciphertext, base64. Decrypts to ReceiptPlaintext. Only the merchant whose recipient_pubkey matches can decrypt.';
COMMENT ON COLUMN privacy_receipts.encryption_nonce IS
    'NaCl-box 24-byte nonce, base64.';
COMMENT ON COLUMN privacy_receipts.ephemeral_pubkey IS
    'Ephemeral sender X25519 public key (base58). Required for decrypt.';
COMMENT ON COLUMN privacy_receipts.recipient_pubkey IS
    'Merchant''s long-lived X25519 public key (base58). Set by merchant on first dashboard visit.';
COMMENT ON COLUMN privacy_receipts.payload_hash IS
    'SHA-256(canonical(encrypted_receipt)), base58. Anchored on-chain via issue_private_receipt.';

-- ─── merchants: receipt-decryption pubkey ──────────────────────
ALTER TABLE merchants
    ADD COLUMN IF NOT EXISTS receipt_pubkey TEXT,       -- base58 X25519 pk
    ADD COLUMN IF NOT EXISTS receipt_pubkey_set_at TIMESTAMPTZ;

COMMENT ON COLUMN merchants.receipt_pubkey IS
    'Long-lived X25519 public key the merchant publishes for customers to encrypt private receipts against. Derived deterministically from a wallet signature.';
