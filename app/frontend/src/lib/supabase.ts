import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Supabase client
// Set these environment variables to enable Supabase:
// NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const isServer = typeof window === "undefined";

// Server routes should use service role so RLS can stay strict for anon/auth users.
const supabaseKey = isServer
    ? (supabaseServiceRoleKey || supabaseAnonKey)
    : supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
    console.error(
        "[Settlr] FATAL: Supabase not configured. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and " +
        (isServer ? "SUPABASE_SERVICE_ROLE_KEY" : "NEXT_PUBLIC_SUPABASE_ANON_KEY") +
        ". " +
        "The app will fall back to in-memory storage which LOSES DATA on restart."
    );
}

if (isServer && supabaseUrl && !supabaseServiceRoleKey) {
    console.warn(
        "[Settlr] WARNING: SUPABASE_SERVICE_ROLE_KEY missing on server; using anon key. " +
        "Admin and waitlist operations should use service role in production."
    );
}

// Create client (with placeholder URL if not configured - won't be used anyway)
export const supabase: SupabaseClient = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseKey || "placeholder-key"
);

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
    return Boolean(supabaseUrl && supabaseKey);
}
