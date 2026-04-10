-- Purchase orders table for B2B order management
CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id),
  merchant_wallet TEXT NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_company TEXT,
  buyer_wallet TEXT,
  line_items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2),
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USDC',
  notes TEXT,
  terms TEXT,
  expected_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft',
  invoice_id TEXT,
  payment_id TEXT,
  tx_signature TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_purchase_orders_merchant ON purchase_orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created ON purchase_orders(created_at DESC);

-- RLS
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (service role key)
CREATE POLICY "Allow all purchase_orders operations"
  ON purchase_orders FOR ALL
  USING (true)
  WITH CHECK (true);
