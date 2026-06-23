create extension if not exists pg_net cascade;

alter table invoices add column if not exists last_reminder_sent_at timestamptz;

select cron.schedule('flag-overdue', '0 6 * * *', $$
  update invoices set status = 'overdue'
  where status = 'sent' and due_date < current_date;
$$);
