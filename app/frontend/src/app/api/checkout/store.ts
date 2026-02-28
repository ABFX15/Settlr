/**
 * Legacy in-memory checkout session store.
 * Shared between checkout routes for backwards compatibility during Supabase migration.
 * TODO: Remove after full migration to Supabase.
 */
import type { CheckoutSession } from "@/lib/db";

export const checkoutSessions = new Map<string, CheckoutSession>();
