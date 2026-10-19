-- The application now expresses every one of these operations with Drizzle
-- queries, so the hand-written functions from 0001_plenty_canyon are no longer
-- called at runtime. This migration drops them, along with the stale
-- Supabase-era functions that reference the old plural table names
-- ("projects", "comments", "invoices") which do not exist in this schema.

--> statement-breakpoint
DROP FUNCTION IF EXISTS public.get_dashboard_stats(text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.get_activity_feed(text, integer);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.get_unread_comments(text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.mark_comments_read(text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.get_freelancer_clients(text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.approve_project(text, text, text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.request_revision(text, text, text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.create_invoice(uuid, uuid, numeric, uuid, date);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.delete_invoice(uuid);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.get_unread_comment_count(uuid);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.update_invoice_status(uuid, text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.add_milestone(text, text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.show_db_tree();
