-- ============================================================
-- Business logic functions
-- ============================================================

-- ------------------------------------------------------------
-- approve_project: client approves → add comment + set completed
-- SECURITY DEFINER so client can update project status
-- ------------------------------------------------------------
create or replace function public.approve_project(p_project_id uuid, p_note text default null)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.project_clients
    where project_id = p_project_id and client_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  insert into public.comments (project_id, author_id, body)
  values (p_project_id, auth.uid(),
    case when p_note is not null and p_note <> ''
      then '✅ Approved — ' || p_note
      else '✅ Approved'
    end
  );

  update public.projects set status = 'completed'
  where id = p_project_id;
end;
$$;

revoke execute on function public.approve_project(uuid, text) from anon, public;

-- ------------------------------------------------------------
-- request_revision: client requests changes → add comment + set review
-- SECURITY DEFINER so client can update project status
-- ------------------------------------------------------------
create or replace function public.request_revision(p_project_id uuid, p_note text default null)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.project_clients
    where project_id = p_project_id and client_id = auth.uid()
  ) then
    raise exception 'Not authorized';
  end if;

  insert into public.comments (project_id, author_id, body)
  values (p_project_id, auth.uid(),
    case when p_note is not null and p_note <> ''
      then '🔄 Revision requested — ' || p_note
      else '🔄 Revision requested'
    end
  );

  update public.projects set status = 'review'
  where id = p_project_id;
end;
$$;

revoke execute on function public.request_revision(uuid, text) from anon, public;

-- ------------------------------------------------------------
-- add_milestone: auto-compute position (SECURITY INVOKER → RLS applies)
-- ------------------------------------------------------------
create or replace function public.add_milestone(p_project_id uuid, p_name text)
returns void
language plpgsql security invoker
set search_path = ''
as $$
declare
  v_position int;
begin
  select coalesce(max(position), -1) + 1 into v_position
  from public.milestones
  where project_id = p_project_id;

  insert into public.milestones (project_id, name, position)
  values (p_project_id, p_name, v_position);
end;
$$;

-- ------------------------------------------------------------
-- create_invoice: handles dollars→cents, sets freelancer_id
-- (SECURITY INVOKER → RLS ensures caller is freelancer)
-- ------------------------------------------------------------
create or replace function public.create_invoice(
  p_project_id uuid,
  p_client_id uuid,
  p_amount_dollars numeric,
  p_due_date date default null
)
returns uuid
language plpgsql security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.invoices (project_id, client_id, freelancer_id, amount_cents, due_date)
  values (p_project_id, p_client_id, auth.uid(), (p_amount_dollars * 100)::int, p_due_date)
  returning id into v_id;

  return v_id;
end;
$$;

-- ------------------------------------------------------------
-- update_invoice_status
-- ------------------------------------------------------------
create or replace function public.update_invoice_status(p_invoice_id uuid, p_status text)
returns void
language plpgsql security invoker
set search_path = ''
as $$
begin
  update public.invoices set status = p_status
  where id = p_invoice_id;
end;
$$;

-- ------------------------------------------------------------
-- delete_invoice
-- ------------------------------------------------------------
create or replace function public.delete_invoice(p_invoice_id uuid)
returns void
language plpgsql security invoker
set search_path = ''
as $$
begin
  delete from public.invoices where id = p_invoice_id;
end;
$$;

-- ------------------------------------------------------------
-- mark_comments_read: update profile timestamp
-- ------------------------------------------------------------
create or replace function public.mark_comments_read()
returns void
language plpgsql security invoker
set search_path = ''
as $$
begin
  update public.profiles
  set last_read_comments_at = now()
  where id = auth.uid();
end;
$$;
