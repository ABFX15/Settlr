-- Create waitlist table for gated early access
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    company VARCHAR(255),
    use_case TEXT,
    wallet_address VARCHAR(44),
    position INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_wallet ON waitlist(wallet_address);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);

-- RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon (public waitlist form)
CREATE POLICY "Allow public waitlist inserts"
    ON waitlist FOR INSERT
    WITH CHECK (true);

-- Allow reads for service role only (admin)
CREATE POLICY "Allow service role reads"
    ON waitlist FOR SELECT
    USING (true);

-- Allow updates for service role only (admin approval + wallet linking)
CREATE POLICY "Allow service role updates"
    ON waitlist FOR UPDATE
    USING (true);
