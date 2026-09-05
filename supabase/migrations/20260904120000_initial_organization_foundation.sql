begin;

create schema if not exists private;
revoke all on schema private from public;

create type public.organization_member_role as enum ('admin', 'hr', 'manager', 'employee');
create type public.organization_member_status as enum ('active', 'invited', 'suspended');
create type public.department_status as enum ('active', 'inactive');
create type public.employee_status as enum ('active', 'inactive', 'terminated');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  timezone text not null default 'Asia/Karachi' check (char_length(btrim(timezone)) > 0),
  working_days smallint[] not null default array[1, 2, 3, 4, 5]::smallint[],
  default_grace_minutes integer not null default 10 check (default_grace_minutes between 0 and 1440),
  overtime_policy text not null default 'After scheduled shift duration',
  attendance_percentage_rule text not null default 'Present, late, half day, and work from home count as attended',
  leave_approval_mode text not null default 'manager-and-hr' check (leave_approval_mode in ('manager-and-hr', 'hr-only')),
  manager_approval_required boolean not null default true,
  hr_final_approval_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_settings_working_days_valid check (
    cardinality(working_days) between 1 and 7
    and working_days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]
  )
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  status public.department_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, name)
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_number text not null check (char_length(btrim(employee_number)) between 1 and 50),
  full_name text not null check (char_length(btrim(full_name)) between 1 and 160),
  department_id uuid,
  job_title text not null default '',
  email text not null check (email = lower(email) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text not null default '',
  status public.employee_status not null default 'active',
  initials text not null default '' check (char_length(initials) <= 8),
  joining_date date,
  manager_id uuid,
  location text not null default '',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, employee_number),
  unique (organization_id, email),
  constraint employees_department_fk foreign key (organization_id, department_id)
    references public.departments(organization_id, id) on delete set null (department_id),
  constraint employees_manager_fk foreign key (organization_id, manager_id)
    references public.employees(organization_id, id) on delete set null (manager_id),
  constraint employees_manager_not_self check (manager_id is null or manager_id <> id),
  constraint employees_deleted_status check (deleted_at is null or status = 'terminated')
);

alter table public.departments
  add column manager_employee_id uuid,
  add constraint departments_manager_fk foreign key (organization_id, manager_employee_id)
    references public.employees(organization_id, id) on delete set null (manager_employee_id);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  employee_id uuid,
  role public.organization_member_role not null default 'employee',
  status public.organization_member_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id),
  unique (organization_id, employee_id),
  constraint organization_members_employee_fk foreign key (organization_id, employee_id)
    references public.employees(organization_id, id) on delete set null (employee_id)
);

create index departments_organization_status_idx on public.departments (organization_id, status);
create index employees_organization_department_idx on public.employees (organization_id, department_id) where deleted_at is null;
create index employees_organization_manager_idx on public.employees (organization_id, manager_id) where deleted_at is null;
create index employees_organization_status_idx on public.employees (organization_id, status) where deleted_at is null;
create index organization_members_user_idx on public.organization_members (user_id, organization_id) where status = 'active';
create index organization_members_employee_idx on public.organization_members (employee_id) where employee_id is not null;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at before update on public.organizations
for each row execute function private.set_updated_at();
create trigger organization_settings_set_updated_at before update on public.organization_settings
for each row execute function private.set_updated_at();
create trigger departments_set_updated_at before update on public.departments
for each row execute function private.set_updated_at();
create trigger employees_set_updated_at before update on public.employees
for each row execute function private.set_updated_at();
create trigger organization_members_set_updated_at before update on public.organization_members
for each row execute function private.set_updated_at();

create function private.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = (select auth.uid())
      and status = 'active'
  );
$$;

create function private.organization_role(target_organization_id uuid)
returns public.organization_member_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.organization_members
  where organization_id = target_organization_id
    and user_id = (select auth.uid())
    and status = 'active'
  limit 1;
$$;

create function private.has_organization_role(
  target_organization_id uuid,
  allowed_roles public.organization_member_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.organization_role(target_organization_id) = any(allowed_roles), false);
$$;

revoke all on function private.set_updated_at() from public;
revoke all on function private.is_organization_member(uuid) from public;
revoke all on function private.organization_role(uuid) from public;
revoke all on function private.has_organization_role(uuid, public.organization_member_role[]) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_organization_member(uuid) to authenticated;
grant execute on function private.organization_role(uuid) to authenticated;
grant execute on function private.has_organization_role(uuid, public.organization_member_role[]) to authenticated;

alter table public.organizations enable row level security;
alter table public.organization_settings enable row level security;
alter table public.departments enable row level security;
alter table public.employees enable row level security;
alter table public.organization_members enable row level security;

revoke all on table public.organizations from anon, authenticated;
revoke all on table public.organization_settings from anon, authenticated;
revoke all on table public.departments from anon, authenticated;
revoke all on table public.employees from anon, authenticated;
revoke all on table public.organization_members from anon, authenticated;
grant select, update on table public.organizations to authenticated;
grant select, insert, update on table public.organization_settings to authenticated;
grant select, insert, update, delete on table public.departments to authenticated;
grant select, insert, update, delete on table public.employees to authenticated;
grant select, insert, update, delete on table public.organization_members to authenticated;

create policy organizations_select_members on public.organizations for select to authenticated
using ((select private.is_organization_member(id)));
create policy organizations_update_admins on public.organizations for update to authenticated
using ((select private.has_organization_role(id, array['admin']::public.organization_member_role[])))
with check ((select private.has_organization_role(id, array['admin']::public.organization_member_role[])));

create policy organization_settings_select_members on public.organization_settings for select to authenticated
using ((select private.is_organization_member(organization_id)));
create policy organization_settings_insert_admin_hr on public.organization_settings for insert to authenticated
with check ((select private.has_organization_role(organization_id, array['admin', 'hr']::public.organization_member_role[])));
create policy organization_settings_update_admin_hr on public.organization_settings for update to authenticated
using ((select private.has_organization_role(organization_id, array['admin', 'hr']::public.organization_member_role[])))
with check ((select private.has_organization_role(organization_id, array['admin', 'hr']::public.organization_member_role[])));

create policy departments_select_members on public.departments for select to authenticated
using ((select private.is_organization_member(organization_id)));
create policy departments_insert_admin_hr on public.departments for insert to authenticated
with check ((select private.has_organization_role(organization_id, array['admin', 'hr']::public.organization_member_role[])));
create policy departments_update_admin_hr on public.departments for update to authenticated
using ((select private.has_organization_role(organization_id, array['admin', 'hr']::public.organization_member_role[])))
with check ((select private.has_organization_role(organization_id, array['admin', 'hr']::public.organization_member_role[])));
create policy departments_delete_admin_hr on public.departments for delete to authenticated
using ((select private.has_organization_role(organization_id, array['admin', 'hr']::public.organization_member_role[])));

create policy employees_select_members on public.employees for select to authenticated
using ((select private.is_organization_member(organization_id)));
create policy employees_insert_admin_hr on public.employees for insert to authenticated
with check ((select private.has_organization_role(organization_id, array['admin', 'hr']::public.organization_member_role[])));
create policy employees_update_admin_hr on public.employees for update to authenticated
using ((select private.has_organization_role(organization_id, array['admin', 'hr']::public.organization_member_role[])))
with check ((select private.has_organization_role(organization_id, array['admin', 'hr']::public.organization_member_role[])));
create policy employees_delete_admins on public.employees for delete to authenticated
using ((select private.has_organization_role(organization_id, array['admin']::public.organization_member_role[])));

create policy organization_members_select_members on public.organization_members for select to authenticated
using ((select private.is_organization_member(organization_id)));
create policy organization_members_insert_admins on public.organization_members for insert to authenticated
with check ((select private.has_organization_role(organization_id, array['admin']::public.organization_member_role[])));
create policy organization_members_update_admins on public.organization_members for update to authenticated
using ((select private.has_organization_role(organization_id, array['admin']::public.organization_member_role[])))
with check ((select private.has_organization_role(organization_id, array['admin']::public.organization_member_role[])));
create policy organization_members_delete_admins on public.organization_members for delete to authenticated
using ((select private.has_organization_role(organization_id, array['admin']::public.organization_member_role[])));

commit;
