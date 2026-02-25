-- Invoices table: B2B invoice portal for merchant → buyer stablecoin payments

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    merchant_name TEXT NOT NULL,
    merchant_wallet TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    -- Buyer info
    buyer_name TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    buyer_company TEXT,
    -- Amounts
    line_items JSONB NOT NULL DEFAULT '[]',
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(6, 3),
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USDC',
    -- Terms
    memo TEXT,
    terms TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    -- Payment
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),
    payment_signature TEXT,
    payer_wallet TEXT,
    paid_at TIMESTAMPTZ,
    -- Tracking
    view_token TEXT NOT NULL UNIQUE,
    view_count INTEGER NOT NULL DEFAULT 0,
    last_viewed_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_merchant_id ON invoices(merchant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_view_token ON invoices(view_token);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_buyer_email ON invoices(buyer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on invoices"
    ON invoices FOR ALL
    USING (true)
    WITH CHECK (true);
