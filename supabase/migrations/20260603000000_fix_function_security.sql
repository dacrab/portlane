-- ============================================================
-- Fix security linter warnings
-- 1. is_project_client: add SET search_path + revoke public execute
-- 2. Dashboard functions: switch SECURITY DEFINER → SECURITY INVOKER
--    so RLS applies naturally and anon/authenticated warnings disappear
-- ============================================================

-- ------------------------------------------------------------
-- 1. is_project_client
--    • stays SECURITY DEFINER (needed to break RLS recursion)
--    • add SET search_path = '' (fixes function_search_path_mutable)
--    • revoke direct execution from anon/authenticated
--      (only ever called internally by RLS policies)
-- ------------------------------------------------------------
create or replace function public.is_project_client(p_project_id uuid)
returns boolean
language sql security definer stable
set search_path = ''
as $$
  select exists (
    select 1 from public.project_clients
    where project_id = p_project_id
      and client_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_project_client(uuid) from PUBLIC, anon, authenticated;

-- ------------------------------------------------------------
-- 2. get_dashboard_stats → SECURITY INVOKER
-- ------------------------------------------------------------
create or replace function public.get_dashboard_stats(p_user_id uuid)
returns table (
  active_projects    bigint,
  completed_projects bigint,
  review_projects    bigint,
  revenue_mtd        bigint,
  total_invoices     bigint,
  total_clients      bigint
)
language sql security invoker stable
set search_path = ''
as $$
  with my_projects as (
    select id, status from public.projects
    where freelancer_id = p_user_id
  )
  select
    count(*) filter (where status not in ('completed','archived'))  as active_projects,
    count(*) filter (where status = 'completed')                    as completed_projects,
    count(*) filter (where status = 'review')                       as review_projects,
    (select coalesce(sum(amount_cents), 0)
     from public.invoices
     where freelancer_id = p_user_id
       and status = 'paid')::bigint                                 as revenue_mtd,
    (select count(*)
     from public.invoices
     where freelancer_id = p_user_id)::bigint                       as total_invoices,
    (select count(distinct client_id)
     from public.project_clients
     where project_id in (select id from my_projects))::bigint      as total_clients
  from my_projects;
$$;

-- ------------------------------------------------------------
-- 3. get_unread_comment_count → SECURITY INVOKER
-- ------------------------------------------------------------
create or replace function public.get_unread_comment_count(p_user_id uuid)
returns bigint
language sql security invoker stable
set search_path = ''
as $$
  select count(*)
  from public.comments c
  join public.projects p on p.id = c.project_id
  cross join (
    select coalesce(last_read_comments_at, '-infinity'::timestamptz) as since
    from public.profiles where id = p_user_id
  ) r
  where p.freelancer_id = p_user_id
    and c.author_id <> p_user_id
    and c.created_at > r.since;
$$;

-- ------------------------------------------------------------
-- 4. get_activity_feed → SECURITY INVOKER
-- ------------------------------------------------------------
create or replace function public.get_activity_feed(p_user_id uuid, p_limit int default 5)
returns table (
  body         text,
  created_at   timestamptz,
  author_name  text,
  project_id   uuid,
  project_name text
)
language sql security invoker stable
set search_path = ''
as $$
  select
    c.body,
    c.created_at,
    pr.full_name as author_name,
    p.id         as project_id,
    p.name       as project_name
  from public.comments c
  join public.projects p  on p.id  = c.project_id
  join public.profiles pr on pr.id = c.author_id
  where p.freelancer_id = p_user_id
  order by c.created_at desc
  limit p_limit;
$$;

-- ------------------------------------------------------------
-- 5. get_freelancer_clients → SECURITY INVOKER
-- ------------------------------------------------------------
create or replace function public.get_freelancer_clients(p_user_id uuid)
returns table (
  client_id  uuid,
  full_name  text,
  projects   text[]
)
language sql security invoker stable
set search_path = ''
as $$
  select
    pr.id               as client_id,
    pr.full_name,
    array_agg(p.name order by p.name) as projects
  from public.project_clients pc
  join public.projects  p  on p.id  = pc.project_id
  join public.profiles  pr on pr.id = pc.client_id
  where p.freelancer_id = p_user_id
  group by pr.id, pr.full_name;
$$;

-- ------------------------------------------------------------
-- 6. get_unread_comments → SECURITY INVOKER
-- ------------------------------------------------------------
create or replace function public.get_unread_comments(p_user_id uuid)
returns table (
  id           uuid,
  body         text,
  created_at   timestamptz,
  author_name  text,
  project_id   uuid,
  project_name text
)
language sql security invoker stable
set search_path = ''
as $$
  select
    c.id,
    c.body,
    c.created_at,
    pr.full_name as author_name,
    p.id         as project_id,
    p.name       as project_name
  from public.comments c
  join public.projects p  on p.id  = c.project_id
  join public.profiles pr on pr.id = c.author_id
  cross join (
    select coalesce(last_read_comments_at, '-infinity'::timestamptz) as since
    from public.profiles where id = p_user_id
  ) r
  where p.freelancer_id = p_user_id
    and c.author_id <> p_user_id
    and c.created_at > r.since
  order by c.created_at desc;
$$;
