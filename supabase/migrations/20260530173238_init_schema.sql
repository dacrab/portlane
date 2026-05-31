-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'freelancer' check (role in ('freelancer', 'client')),
  created_at timestamptz default now()
);

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'planning' check (status in ('planning', 'in_progress', 'review', 'completed', 'archived')),
  due_date date,
  created_at timestamptz default now()
);

-- Project clients (many-to-many: a project can have multiple clients)
create table project_clients (
  project_id uuid references projects(id) on delete cascade,
  client_id uuid references profiles(id) on delete cascade,
  primary key (project_id, client_id)
);

-- Milestones
create table milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  completed boolean not null default false,
  position int not null default 0,
  created_at timestamptz default now()
);

-- Files
create table files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  uploaded_by uuid not null references profiles(id),
  name text not null,
  storage_path text not null,
  size_bytes bigint,
  created_at timestamptz default now()
);

-- Comments
create table comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  author_id uuid not null references profiles(id),
  body text not null,
  created_at timestamptz default now()
);

-- Invoices
create table invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  freelancer_id uuid not null references profiles(id),
  client_id uuid not null references profiles(id),
  amount_cents int not null,
  currency text not null default 'usd',
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  due_date date,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_clients enable row level security;
alter table milestones enable row level security;
alter table files enable row level security;
alter table comments enable row level security;
alter table invoices enable row level security;

-- profiles
create policy "own profile" on profiles for all
  using ((select auth.uid()) = id);

-- projects: single SELECT policy for both freelancer and client
create policy "project select" on projects for select
  using (
    (select auth.uid()) = freelancer_id
    or exists (
      select 1 from project_clients
      where project_id = projects.id and client_id = (select auth.uid())
    )
  );
create policy "freelancer insert project" on projects for insert
  with check ((select auth.uid()) = freelancer_id);
create policy "freelancer update project" on projects for update
  using ((select auth.uid()) = freelancer_id);
create policy "freelancer delete project" on projects for delete
  using ((select auth.uid()) = freelancer_id);

-- project_clients
create policy "project_clients select" on project_clients for select
  using (
    client_id = (select auth.uid())
    or exists (
      select 1 from projects where id = project_id and freelancer_id = (select auth.uid())
    )
  );
create policy "freelancer insert project_clients" on project_clients for insert
  with check (exists (
    select 1 from projects where id = project_id and freelancer_id = (select auth.uid())
  ));
create policy "freelancer delete project_clients" on project_clients for delete
  using (exists (
    select 1 from projects where id = project_id and freelancer_id = (select auth.uid())
  ));

-- milestones
create policy "milestones select" on milestones for select
  using (
    exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid()))
    or exists (select 1 from project_clients where project_id = milestones.project_id and client_id = (select auth.uid()))
  );
create policy "freelancer insert milestones" on milestones for insert
  with check (exists (
    select 1 from projects where id = project_id and freelancer_id = (select auth.uid())
  ));
create policy "freelancer update milestones" on milestones for update
  using (exists (
    select 1 from projects where id = project_id and freelancer_id = (select auth.uid())
  ));
create policy "freelancer delete milestones" on milestones for delete
  using (exists (
    select 1 from projects where id = project_id and freelancer_id = (select auth.uid())
  ));

-- files
create policy "files select" on files for select
  using (
    exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid()))
    or exists (select 1 from project_clients where project_id = files.project_id and client_id = (select auth.uid()))
  );
create policy "freelancer insert files" on files for insert
  with check (exists (
    select 1 from projects where id = project_id and freelancer_id = (select auth.uid())
  ));
create policy "freelancer update files" on files for update
  using (exists (
    select 1 from projects where id = project_id and freelancer_id = (select auth.uid())
  ));
create policy "freelancer delete files" on files for delete
  using (exists (
    select 1 from projects where id = project_id and freelancer_id = (select auth.uid())
  ));

-- comments
create policy "project members manage comments" on comments for all
  using (
    exists (select 1 from projects where id = project_id and freelancer_id = (select auth.uid()))
    or exists (select 1 from project_clients where project_id = comments.project_id and client_id = (select auth.uid()))
  );

-- invoices
create policy "invoices select" on invoices for select
  using (
    (select auth.uid()) = freelancer_id
    or (select auth.uid()) = client_id
  );
create policy "freelancer insert invoices" on invoices for insert
  with check ((select auth.uid()) = freelancer_id);
create policy "freelancer update invoices" on invoices for update
  using ((select auth.uid()) = freelancer_id);
create policy "freelancer delete invoices" on invoices for delete
  using ((select auth.uid()) = freelancer_id);

-- Auto-create profile on signup
-- set search_path = '' prevents search path injection; use fully-qualified names inside
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Trigger-only function; revoke REST API access
revoke execute on function handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
