alter table invoices add column if not exists stripe_payment_intent_id text;
alter table invoices add column if not exists stripe_session_id text;
