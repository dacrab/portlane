-- Time tracking
create table time_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id),
  description text,
  minutes int not null check (minutes > 0),
  logged_at date not null default current_date,
  created_at timestamptz default now()
);

alter table time_entries enable row level security;

create policy "freelancer manages time_entries" on time_entries for all
  using (exists (
    select 1 from projects where id = project_id and freelancer_id = (select auth.uid())
  ));

-- Internal project notes (freelancer-only, not visible to clients)
create table project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  body text not null,
  updated_at timestamptz default now()
);

alter table project_notes enable row level security;

create policy "freelancer manages project_notes" on project_notes for all
  using (exists (
    select 1 from projects where id = project_id and freelancer_id = (select auth.uid())
  ));
