-- Harden waitlist table access (Supabase alert remediation)
-- Ensures public/anon users cannot read/update/delete waitlist data directly.

-- Keep RLS on and enforce it.
ALTER TABLE IF EXISTS public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.waitlist FORCE ROW LEVEL SECURITY;

-- Remove overly broad policies if they exist.
DROP POLICY IF EXISTS "Allow all for service role" ON public.waitlist;
DROP POLICY IF EXISTS "Allow public waitlist inserts" ON public.waitlist;
DROP POLICY IF EXISTS "Allow service role reads" ON public.waitlist;
DROP POLICY IF EXISTS "Allow service role updates" ON public.waitlist;

-- Revoke table access from client roles.
REVOKE ALL ON TABLE public.waitlist FROM anon;
REVOKE ALL ON TABLE public.waitlist FROM authenticated;

-- Allow only controlled insert path for anon clients (optional public waitlist form).
CREATE POLICY "Allow anon insert waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE policies for anon/authenticated.
-- Server-side APIs should use SUPABASE_SERVICE_ROLE_KEY for admin reads/updates.
