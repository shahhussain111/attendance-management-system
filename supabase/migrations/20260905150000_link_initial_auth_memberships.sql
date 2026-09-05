begin;

-- This migration must run only after the four users below have been created
-- through Supabase Auth. It reads auth.users but never inserts or updates it.
do $$
declare
  matching_auth_users integer;
  matching_employees integer;
begin
  select count(*) into matching_auth_users
  from auth.users
  where lower(email) in (
    'muneeb.ahmed@northstar.co',
    'zainab.noor@northstar.co',
    'usman.tariq@northstar.co',
    'ayesha.khan@northstar.co'
  );

  if matching_auth_users <> 4 then
    raise exception 'Expected exactly four initial Northstar Auth users, found %', matching_auth_users;
  end if;

  select count(*) into matching_employees
  from public.employees
  where organization_id = '6e6f7274-6873-7461-722d-617474656e64'
    and employee_number in ('EMP-1011', 'EMP-1005', 'EMP-1012', 'EMP-1001')
    and deleted_at is null;

  if matching_employees <> 4 then
    raise exception 'Expected exactly four active-linkable Northstar employee records, found %', matching_employees;
  end if;
end;
$$;

insert into public.organization_members (
  id,
  organization_id,
  user_id,
  employee_id,
  role,
  status
)
select
  mapping.membership_id,
  '6e6f7274-6873-7461-722d-617474656e64'::uuid,
  auth_user.id,
  employee.id,
  mapping.member_role::public.organization_member_role,
  'active'::public.organization_member_status
from (
  values
    ('a1000000-0000-4000-8000-000000000001'::uuid, 'muneeb.ahmed@northstar.co', 'EMP-1011', 'admin'),
    ('a1000000-0000-4000-8000-000000000002'::uuid, 'zainab.noor@northstar.co', 'EMP-1005', 'hr'),
    ('a1000000-0000-4000-8000-000000000003'::uuid, 'usman.tariq@northstar.co', 'EMP-1012', 'manager'),
    ('a1000000-0000-4000-8000-000000000004'::uuid, 'ayesha.khan@northstar.co', 'EMP-1001', 'employee')
) as mapping(membership_id, email, employee_number, member_role)
join auth.users as auth_user on lower(auth_user.email) = mapping.email
join public.employees as employee
  on employee.organization_id = '6e6f7274-6873-7461-722d-617474656e64'
  and employee.employee_number = mapping.employee_number
  and employee.deleted_at is null
on conflict do nothing;

-- Fail closed if a pre-existing membership conflicts with any proposed link.
do $$
declare
  valid_links integer;
begin
  select count(*) into valid_links
  from public.organization_members as membership
  join auth.users as auth_user on auth_user.id = membership.user_id
  join public.employees as employee on employee.id = membership.employee_id
  join (
    values
      ('muneeb.ahmed@northstar.co', 'EMP-1011', 'admin'),
      ('zainab.noor@northstar.co', 'EMP-1005', 'hr'),
      ('usman.tariq@northstar.co', 'EMP-1012', 'manager'),
      ('ayesha.khan@northstar.co', 'EMP-1001', 'employee')
  ) as expected(email, employee_number, member_role)
    on expected.email = lower(auth_user.email)
    and expected.employee_number = employee.employee_number
    and expected.member_role = membership.role::text
  where membership.organization_id = '6e6f7274-6873-7461-722d-617474656e64'
    and membership.status = 'active';

  if valid_links <> 4 then
    raise exception 'Initial Northstar memberships do not exactly match the approved role and employee links';
  end if;
end;
$$;

commit;
