begin;

create function private.current_employee_id(target_organization_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select employee_id
  from public.organization_members
  where organization_id = target_organization_id
    and user_id = (select auth.uid())
    and status = 'active'
  limit 1;
$$;

revoke all on function private.current_employee_id(uuid) from public;
grant execute on function private.current_employee_id(uuid) to authenticated;

drop policy employees_select_members on public.employees;
create policy employees_select_by_role on public.employees for select to authenticated
using (
  (select private.has_organization_role(
    organization_id,
    array['admin', 'hr']::public.organization_member_role[]
  ))
  or id = (select private.current_employee_id(organization_id))
  or (
    (select private.organization_role(organization_id)) = 'manager'
    and manager_id = (select private.current_employee_id(organization_id))
  )
);

drop policy organization_members_select_members on public.organization_members;
create policy organization_members_select_self_or_admin on public.organization_members for select to authenticated
using (
  user_id = (select auth.uid())
  or (select private.has_organization_role(
    organization_id,
    array['admin']::public.organization_member_role[]
  ))
);

commit;
