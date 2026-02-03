-- Fix RLS policies for api_keys table
-- The anon key needs to be able to insert and query API keys

-- Drop existing policy
DROP POLICY IF EXISTS "Allow all for service role" ON api_keys;

-- Allow INSERT for anyone (API key creation)
CREATE POLICY "Allow insert api_keys" ON api_keys
    FOR INSERT
    WITH CHECK (true);

-- Allow SELECT for anyone (API key validation)  
CREATE POLICY "Allow select api_keys" ON api_keys
    FOR SELECT
    USING (true);

-- Allow UPDATE for anyone (updating last_used_at, request_count)
CREATE POLICY "Allow update api_keys" ON api_keys
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow DELETE for anyone (revoking keys)
CREATE POLICY "Allow delete api_keys" ON api_keys
    FOR DELETE
    USING (true);
