-- ============================================================
-- Dashboard stats function
-- Returns all aggregate stats for the freelancer dashboard
-- in a single round-trip instead of 6 separate queries.
-- ============================================================
create or replace function get_dashboard_stats(p_user_id uuid, p_month_start timestamptz)
returns table (
  active_projects   bigint,
  completed_projects bigint,
  review_projects   bigint,
  revenue_mtd       bigint,
  total_invoices    bigint,
  total_clients     bigint
)
language sql security definer stable
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
       and status = 'paid'
       and created_at >= p_month_start)::bigint                     as revenue_mtd,
    (select count(*)
     from public.invoices
     where freelancer_id = p_user_id)::bigint                       as total_invoices,
    (select count(distinct client_id)
     from public.project_clients
     where project_id in (select id from my_projects))::bigint      as total_clients
  from my_projects;
$$;

-- ============================================================
-- Unread comments count for sidebar badge
-- Single query replacing: profile lookup + project ids + count
-- ============================================================
create or replace function get_unread_comment_count(p_user_id uuid)
returns bigint
language sql security definer stable
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

-- ============================================================
-- Recent activity feed (replaces broken joined-table filter)
-- ============================================================
create or replace function get_activity_feed(p_user_id uuid, p_limit int default 5)
returns table (
  body        text,
  created_at  timestamptz,
  author_name text,
  project_id  uuid,
  project_name text
)
language sql security definer stable
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

-- ============================================================
-- Clients list with project names aggregated in DB
-- Replaces 2 sequential queries + client-side Map aggregation
-- ============================================================
create or replace function get_freelancer_clients(p_user_id uuid)
returns table (
  client_id   uuid,
  full_name   text,
  projects    text[]
)
language sql security definer stable
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

-- ============================================================
-- Unread comments detail (for dashboard notification panel)
-- ============================================================
create or replace function get_unread_comments(p_user_id uuid)
returns table (
  id           uuid,
  body         text,
  created_at   timestamptz,
  author_name  text,
  project_id   uuid,
  project_name text
)
language sql security definer stable
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
