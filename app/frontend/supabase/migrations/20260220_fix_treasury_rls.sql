-- Fix treasury RLS policies: allow anon key access (matching all other tables)
-- The original migration only allowed service_role, but the app uses the anon key.

-- Drop the restrictive service_role-only policies
DROP POLICY IF EXISTS "Service role full access on merchant_balances" ON merchant_balances;
DROP POLICY IF EXISTS "Service role full access on treasury_transactions" ON treasury_transactions;

-- Add permissive policies (matches merchants, checkout_sessions, payments, etc.)
CREATE POLICY IF NOT EXISTS "Allow all for service role" ON merchant_balances FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for service role" ON treasury_transactions FOR ALL USING (true);
