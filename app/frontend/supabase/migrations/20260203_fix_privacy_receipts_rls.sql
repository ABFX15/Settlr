-- Fix RLS policies for privacy_receipts table
-- The API server needs to INSERT privacy receipts

-- Allow the service role (API server) to insert privacy receipts
CREATE POLICY "Service can insert privacy receipts" ON privacy_receipts
    FOR INSERT
    WITH CHECK (true);

-- Allow the service role to update privacy receipts
CREATE POLICY "Service can update privacy receipts" ON privacy_receipts
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Comment for clarity
COMMENT ON TABLE privacy_receipts IS 'Stores encrypted payment receipt handles for Inco Lightning FHE integration. RLS allows service role full access.';
