begin;

-- Stable public identifier for Northstar. This is not a secret and is used by
-- the application to select the correct organization membership after login.
insert into public.organizations (id, name, slug)
values (
  '6e6f7274-6873-7461-722d-617474656e64',
  'Northstar',
  'northstar'
)
on conflict do nothing;

insert into public.organization_settings (
  organization_id,
  timezone,
  working_days,
  default_grace_minutes,
  overtime_policy,
  attendance_percentage_rule,
  leave_approval_mode,
  manager_approval_required,
  hr_final_approval_required
)
values (
  '6e6f7274-6873-7461-722d-617474656e64',
  'Asia/Karachi',
  array[1, 2, 3, 4, 5]::smallint[],
  10,
  'After scheduled shift duration',
  'Present, late, half day, and work from home count as attended',
  'manager-and-hr',
  true,
  true
)
on conflict do nothing;

-- Departments are inserted before employees because employees carry a
-- tenant-safe composite foreign key to their department.
insert into public.departments (id, organization_id, name, status)
values
  ('d1000000-0000-4000-8000-000000000001', '6e6f7274-6873-7461-722d-617474656e64', 'Customer Success', 'active'),
  ('d1000000-0000-4000-8000-000000000002', '6e6f7274-6873-7461-722d-617474656e64', 'Design', 'active'),
  ('d1000000-0000-4000-8000-000000000003', '6e6f7274-6873-7461-722d-617474656e64', 'Engineering', 'active'),
  ('d1000000-0000-4000-8000-000000000004', '6e6f7274-6873-7461-722d-617474656e64', 'Finance', 'active'),
  ('d1000000-0000-4000-8000-000000000005', '6e6f7274-6873-7461-722d-617474656e64', 'Marketing', 'active'),
  ('d1000000-0000-4000-8000-000000000006', '6e6f7274-6873-7461-722d-617474656e64', 'Operations', 'active'),
  ('d1000000-0000-4000-8000-000000000007', '6e6f7274-6873-7461-722d-617474656e64', 'People', 'active'),
  ('d1000000-0000-4000-8000-000000000008', '6e6f7274-6873-7461-722d-617474656e64', 'Sales', 'active')
on conflict do nothing;

-- Supporting managers are included so every manager named by the ten demo
-- employees resolves to a real employee row. No Auth identities are implied.
insert into public.employees (
  id,
  organization_id,
  employee_number,
  full_name,
  department_id,
  job_title,
  email,
  phone,
  status,
  initials,
  joining_date,
  manager_id,
  location
)
values
  ('e1000000-0000-4000-8000-000000001011', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1011', 'Muneeb Ahmed', 'd1000000-0000-4000-8000-000000000006', 'Managing Director', 'muneeb.ahmed@northstar.co', '', 'active', 'MA', null, null, 'Lahore HQ'),
  ('e1000000-0000-4000-8000-000000001012', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1012', 'Usman Tariq', 'd1000000-0000-4000-8000-000000000003', 'Engineering Manager', 'usman.tariq@northstar.co', '', 'active', 'UT', null, null, 'Lahore HQ'),
  ('e1000000-0000-4000-8000-000000001013', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1013', 'Nadia Saeed', 'd1000000-0000-4000-8000-000000000002', 'Design Manager', 'nadia.saeed@northstar.co', '', 'active', 'NS', null, null, 'Karachi Office'),
  ('e1000000-0000-4000-8000-000000001014', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1014', 'Fatima Raza', 'd1000000-0000-4000-8000-000000000005', 'Marketing Director', 'fatima.raza@northstar.co', '', 'active', 'FR', null, null, 'Lahore HQ'),
  ('e1000000-0000-4000-8000-000000001015', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1015', 'Saad Mirza', 'd1000000-0000-4000-8000-000000000004', 'Finance Manager', 'saad.mirza@northstar.co', '', 'active', 'SM', null, null, 'Islamabad Office'),
  ('e1000000-0000-4000-8000-000000001016', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1016', 'Faraz Sheikh', 'd1000000-0000-4000-8000-000000000008', 'Commercial Director', 'faraz.sheikh@northstar.co', '', 'active', 'FS', null, null, 'Karachi Office'),
  ('e1000000-0000-4000-8000-000000001001', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1001', 'Ayesha Khan', 'd1000000-0000-4000-8000-000000000003', 'Frontend Engineer', 'ayesha.khan@northstar.co', '+92 300 123 4501', 'active', 'AK', '2023-02-13', 'e1000000-0000-4000-8000-000000001012', 'Lahore HQ'),
  ('e1000000-0000-4000-8000-000000001002', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1002', 'Bilal Ahmed', 'd1000000-0000-4000-8000-000000000003', 'Backend Engineer', 'bilal.ahmed@northstar.co', '+92 301 445 7812', 'active', 'BA', '2022-08-01', 'e1000000-0000-4000-8000-000000001012', 'Remote'),
  ('e1000000-0000-4000-8000-000000001003', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1003', 'Sara Malik', 'd1000000-0000-4000-8000-000000000002', 'Product Designer', 'sara.malik@northstar.co', '+92 333 908 1120', 'active', 'SM', '2023-05-22', 'e1000000-0000-4000-8000-000000001013', 'Karachi Office'),
  ('e1000000-0000-4000-8000-000000001004', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1004', 'Hamza Ali', 'd1000000-0000-4000-8000-000000000005', 'Growth Manager', 'hamza.ali@northstar.co', '+92 321 771 8834', 'active', 'HA', '2021-11-15', 'e1000000-0000-4000-8000-000000001014', 'Lahore HQ'),
  ('e1000000-0000-4000-8000-000000001005', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1005', 'Zainab Noor', 'd1000000-0000-4000-8000-000000000007', 'HR Specialist', 'zainab.noor@northstar.co', '+92 305 662 1903', 'active', 'ZN', '2024-01-08', 'e1000000-0000-4000-8000-000000001007', 'Lahore HQ'),
  ('e1000000-0000-4000-8000-000000001006', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1006', 'Omar Farooq', 'd1000000-0000-4000-8000-000000000004', 'Financial Analyst', 'omar.farooq@northstar.co', '+92 312 591 7720', 'active', 'OF', '2022-04-18', 'e1000000-0000-4000-8000-000000001015', 'Islamabad Office'),
  ('e1000000-0000-4000-8000-000000001007', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1007', 'Mariam Siddiqui', 'd1000000-0000-4000-8000-000000000006', 'Operations Lead', 'mariam.siddiqui@northstar.co', '+92 315 227 6801', 'active', 'MS', '2020-09-07', 'e1000000-0000-4000-8000-000000001011', 'Lahore HQ'),
  ('e1000000-0000-4000-8000-000000001008', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1008', 'Daniyal Shah', 'd1000000-0000-4000-8000-000000000008', 'Account Executive', 'daniyal.shah@northstar.co', '+92 322 440 9156', 'active', 'DS', '2024-03-11', 'e1000000-0000-4000-8000-000000001016', 'Karachi Office'),
  ('e1000000-0000-4000-8000-000000001009', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1009', 'Hira Qureshi', 'd1000000-0000-4000-8000-000000000001', 'Success Manager', 'hira.qureshi@northstar.co', '+92 304 881 2370', 'active', 'HQ', '2023-07-03', 'e1000000-0000-4000-8000-000000001016', 'Remote'),
  ('e1000000-0000-4000-8000-000000001010', '6e6f7274-6873-7461-722d-617474656e64', 'EMP-1010', 'Raza Hussain', 'd1000000-0000-4000-8000-000000000003', 'QA Engineer', 'raza.hussain@northstar.co', '+92 316 734 5002', 'inactive', 'RH', '2022-12-05', 'e1000000-0000-4000-8000-000000001012', 'Lahore HQ')
on conflict do nothing;

-- Department ownership is assigned only after all referenced employees exist.
update public.departments
set manager_employee_id = case id
  when 'd1000000-0000-4000-8000-000000000001' then 'e1000000-0000-4000-8000-000000001016'::uuid
  when 'd1000000-0000-4000-8000-000000000002' then 'e1000000-0000-4000-8000-000000001013'::uuid
  when 'd1000000-0000-4000-8000-000000000003' then 'e1000000-0000-4000-8000-000000001012'::uuid
  when 'd1000000-0000-4000-8000-000000000004' then 'e1000000-0000-4000-8000-000000001015'::uuid
  when 'd1000000-0000-4000-8000-000000000005' then 'e1000000-0000-4000-8000-000000001014'::uuid
  when 'd1000000-0000-4000-8000-000000000006' then 'e1000000-0000-4000-8000-000000001011'::uuid
  when 'd1000000-0000-4000-8000-000000000007' then 'e1000000-0000-4000-8000-000000001007'::uuid
  when 'd1000000-0000-4000-8000-000000000008' then 'e1000000-0000-4000-8000-000000001016'::uuid
end
where organization_id = '6e6f7274-6873-7461-722d-617474656e64'
  and manager_employee_id is null
  and id in (
    'd1000000-0000-4000-8000-000000000001',
    'd1000000-0000-4000-8000-000000000002',
    'd1000000-0000-4000-8000-000000000003',
    'd1000000-0000-4000-8000-000000000004',
    'd1000000-0000-4000-8000-000000000005',
    'd1000000-0000-4000-8000-000000000006',
    'd1000000-0000-4000-8000-000000000007',
    'd1000000-0000-4000-8000-000000000008'
  );

commit;
