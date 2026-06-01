-- ============================================================
-- Schema
-- ============================================================

create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text,
  avatar_url  text,
  role        text not null default 'freelancer' check (role in ('freelancer', 'client')),
  created_at  timestamptz not null default now()
);

create table projects (
  id            uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references profiles(id) on delete cascade,
  name          text not null,
  description   text,
  status        text not null default 'planning'
                  check (status in ('planning', 'in_progress', 'review', 'completed', 'archived')),
  due_date      date,
  created_at    timestamptz not null default now()
);

-- Many-to-many: projects ↔ clients
create table project_clients (
  project_id uuid not null references projects(id) on delete cascade,
  client_id  uuid not null references profiles(id) on delete cascade,
  primary key (project_id, client_id)
);

create table milestones (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  completed   boolean not null default false,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

create table files (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  uploaded_by   uuid not null references profiles(id),
  name          text not null,
  storage_path  text not null,
  size_bytes    bigint,
  created_at    timestamptz not null default now()
);

create table comments (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  author_id   uuid not null references profiles(id),
  body        text not null,
  created_at  timestamptz not null default now()
);

create table invoices (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  freelancer_id uuid not null references profiles(id),
  client_id     uuid not null references profiles(id),
  amount_cents  int not null check (amount_cents > 0),
  currency      text not null default 'usd',
  status        text not null default 'draft'
                  check (status in ('draft', 'sent', 'paid', 'overdue')),
  due_date      date,
  created_at    timestamptz not null default now()
);

create table time_entries (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references profiles(id),
  description text,
  minutes     int not null check (minutes > 0),
  logged_at   date not null default current_date,
  created_at  timestamptz not null default now()
);

-- Freelancer-only internal notes per project (never exposed to clients via RLS)
create table project_notes (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null unique references projects(id) on delete cascade,
  body        text not null,
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- Helper: check project membership without triggering RLS cycle
-- (projects policy → project_clients, project_clients policy → projects)
-- ============================================================

create function is_project_client(p_project_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from project_clients
    where project_id = p_project_id
      and client_id = (select auth.uid())
  );
$$;

-- ============================================================
-- Row-level security
-- ============================================================

alter table profiles       enable row level security;
alter table projects       enable row level security;
alter table project_clients enable row level security;
alter table milestones     enable row level security;
alter table files          enable row level security;
alter table comments       enable row level security;
alter table invoices       enable row level security;
alter table time_entries   enable row level security;
alter table project_notes  enable row level security;

-- profiles: users manage only their own row
create policy "profiles: own row" on profiles for all
  using ((select auth.uid()) = id);

-- projects
create policy "projects: select" on projects for select
  using ((select auth.uid()) = freelancer_id or is_project_client(id));
create policy "projects: insert" on projects for insert
  with check ((select auth.uid()) = freelancer_id);
create policy "projects: update" on projects for update
  using ((select auth.uid()) = freelancer_id);
create policy "projects: delete" on projects for delete
  using ((select auth.uid()) = freelancer_id);

-- project_clients
create policy "project_clients: select" on project_clients for select
  using (
    client_id = (select auth.uid())
    or exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid()))
  );
create policy "project_clients: insert" on project_clients for insert
  with check (exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid())));
create policy "project_clients: delete" on project_clients for delete
  using (exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid())));

-- milestones
create policy "milestones: select" on milestones for select
  using (
    exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid()))
    or is_project_client(project_id)
  );
create policy "milestones: insert" on milestones for insert
  with check (exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid())));
create policy "milestones: update" on milestones for update
  using (exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid())));
create policy "milestones: delete" on milestones for delete
  using (exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid())));

-- files
create policy "files: select" on files for select
  using (
    exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid()))
    or is_project_client(project_id)
  );
create policy "files: insert" on files for insert
  with check (exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid())));
create policy "files: update" on files for update
  using (exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid())));
create policy "files: delete" on files for delete
  using (exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid())));

-- comments: both freelancer and project clients can read/write
create policy "comments: all" on comments for all
  using (
    exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid()))
    or is_project_client(project_id)
  );

-- invoices
create policy "invoices: select" on invoices for select
  using ((select auth.uid()) in (freelancer_id, client_id));
create policy "invoices: insert" on invoices for insert
  with check ((select auth.uid()) = freelancer_id);
create policy "invoices: update" on invoices for update
  using ((select auth.uid()) = freelancer_id);
create policy "invoices: delete" on invoices for delete
  using ((select auth.uid()) = freelancer_id);

-- time_entries: freelancer only
create policy "time_entries: all" on time_entries for all
  using (exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid())));

-- project_notes: freelancer only
create policy "project_notes: all" on project_notes for all
  using (exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid())));

-- ============================================================
-- Auto-create profile on signup
-- ============================================================

create function handle_new_user()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Restrict to trigger use only
revoke execute on function handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
