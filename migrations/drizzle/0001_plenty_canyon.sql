-- Business-logic SQL functions matching the current Drizzle schema.
-- The original functions lived in Supabase migrations and were lost when the
-- migrations were regenerated for Neon (0000_yummy_quasar only creates tables).
-- All ids are text (crypto.randomUUID), the user table is "user" with column "name".
--
-- IMPORTANT: These functions are required at runtime by the app and must be
-- preserved. They are defined here in SQL only (not in Drizzle's schema), so a
-- fresh `drizzle-kit push` will NOT create them — a fresh database must be set
-- up by running `drizzle-kit migrate` so this migration is applied. Do not
-- delete or "regenerate away" this file.

--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_user_id text)
RETURNS TABLE (
	active_projects bigint,
	completed_projects bigint,
	review_projects bigint,
	revenue_mtd bigint,
	total_invoices bigint,
	total_clients bigint
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
	WITH my_projects AS (
		SELECT id, status FROM public.project WHERE freelancer_id = p_user_id
	)
	SELECT
		COUNT(*) FILTER (WHERE status NOT IN ('completed', 'archived')) AS active_projects,
		COUNT(*) FILTER (WHERE status = 'completed') AS completed_projects,
		COUNT(*) FILTER (WHERE status = 'review') AS review_projects,
		(SELECT COALESCE(SUM(amount_cents), 0) FROM public.invoice
		 WHERE freelancer_id = p_user_id AND status = 'paid')::BIGINT AS revenue_mtd,
		(SELECT COUNT(*) FROM public.invoice
		 WHERE freelancer_id = p_user_id)::BIGINT AS total_invoices,
		(SELECT COUNT(DISTINCT client_id) FROM public.project_client
		 WHERE project_id IN (SELECT id FROM my_projects))::BIGINT AS total_clients
	FROM my_projects;
$$;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.get_activity_feed(p_user_id text, p_limit integer DEFAULT 5)
RETURNS TABLE (
	body text,
	created_at timestamptz,
	author_name text,
	project_id text,
	project_name text
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
	SELECT c.body, c.created_at, u.name AS author_name, p.id AS project_id, p.name AS project_name
	FROM public.comment c
	JOIN public.project p ON p.id = c.project_id
	JOIN public."user" u ON u.id = c.author_id
	WHERE p.freelancer_id = p_user_id
	ORDER BY c.created_at DESC
	LIMIT p_limit;
$$;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.get_unread_comments(p_user_id text)
RETURNS TABLE (
	id text,
	body text,
	created_at timestamptz,
	author_name text,
	project_id text,
	project_name text
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
	SELECT c.id, c.body, c.created_at, u.name AS author_name,
		p.id AS project_id, p.name AS project_name
	FROM public.comment c
	JOIN public.project p ON p.id = c.project_id
	JOIN public."user" u ON u.id = c.author_id
	CROSS JOIN (
		SELECT COALESCE(last_read_comments_at, '-infinity'::timestamptz) AS since
		FROM public."user" WHERE id = p_user_id
	) r
	WHERE p.freelancer_id = p_user_id
		AND c.author_id <> p_user_id
		AND c.created_at > r.since
	ORDER BY c.created_at DESC;
$$;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.mark_comments_read(p_user_id text)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
	UPDATE public."user" SET last_read_comments_at = NOW() WHERE id = p_user_id;
END;
$$;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.get_freelancer_clients(p_user_id text)
RETURNS TABLE (
	client_id text,
	name text,
	projects text[]
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
	SELECT u.id AS client_id, u.name,
		ARRAY_AGG(p.name ORDER BY p.name) AS projects
	FROM public.project_client pc
	JOIN public.project p ON p.id = pc.project_id
	JOIN public."user" u ON u.id = pc.client_id
	WHERE p.freelancer_id = p_user_id
	GROUP BY u.id, u.name;
$$;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.approve_project(
	p_project_id text,
	p_user_id text,
	p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM public.project_client
		WHERE project_id = p_project_id AND client_id = p_user_id
	) THEN
		RAISE EXCEPTION 'Not authorized';
	END IF;

	INSERT INTO public.comment (project_id, author_id, body)
	VALUES (p_project_id, p_user_id,
		CASE WHEN p_note IS NOT NULL AND p_note <> ''
			THEN 'Approved - ' || p_note
			ELSE 'Approved'
		END
	);

	UPDATE public.project SET status = 'completed' WHERE id = p_project_id;
END;
$$;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.request_revision(
	p_project_id text,
	p_user_id text,
	p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM public.project_client
		WHERE project_id = p_project_id AND client_id = p_user_id
	) THEN
		RAISE EXCEPTION 'Not authorized';
	END IF;

	INSERT INTO public.comment (project_id, author_id, body)
	VALUES (p_project_id, p_user_id,
		CASE WHEN p_note IS NOT NULL AND p_note <> ''
			THEN 'Revision requested - ' || p_note
			ELSE 'Revision requested'
		END
	);

	UPDATE public.project SET status = 'review' WHERE id = p_project_id;
END;
$$;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.add_milestone(p_project_id text, p_name text)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
	v_position integer;
BEGIN
	SELECT COALESCE(MAX(position), -1) + 1 INTO v_position
	FROM public.milestone
	WHERE project_id = p_project_id;

	INSERT INTO public.milestone (project_id, name, position)
	VALUES (p_project_id, p_name, v_position);
END;
$$;
