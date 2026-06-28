-- Restore checkout_sessions columns the app writes but that drifted out of the
-- deployed schema (createCheckoutSession was 500ing: "Could not find the
-- 'is_delegated' column of 'checkout_sessions'"). Idempotent — safe to re-run.

alter table public.checkout_sessions
  add column if not exists is_private    boolean not null default false,
  add column if not exists is_delegated  boolean not null default false,
  add column if not exists session_status text;
