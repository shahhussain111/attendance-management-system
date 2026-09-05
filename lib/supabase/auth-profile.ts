import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AppRole, AppSessionUser } from "@/lib/auth";

const appRoles = new Set<AppRole>(["admin", "hr", "manager", "employee"]);

type MembershipRow = {
  id: string;
  organization_id: string;
  employee_id: string | null;
  role: string;
  status: string;
};

type EmployeeRow = {
  id: string;
  employee_number: string;
  full_name: string;
  email: string;
  manager_id: string | null;
};

export async function resolveAuthenticatedUser(
  client: SupabaseClient,
  user: User,
  organizationId: string,
): Promise<AppSessionUser> {
  const { data: membershipData, error: membershipError } = await client
    .from("organization_members")
    .select("id, organization_id, employee_id, role, status")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) throw membershipError;
  const membership = membershipData as MembershipRow | null;
  if (!membership || !appRoles.has(membership.role as AppRole)) {
    throw new Error("This account does not have an active Northstar membership.");
  }

  const role = membership.role as AppRole;
  let employee: EmployeeRow | null = null;
  let teamIds: string[] = [];

  if (membership.employee_id) {
    const { data: employeeData, error: employeeError } = await client
      .from("employees")
      .select("id, employee_number, full_name, email, manager_id")
      .eq("organization_id", organizationId)
      .eq("id", membership.employee_id)
      .is("deleted_at", null)
      .maybeSingle();

    if (employeeError) throw employeeError;
    employee = employeeData as EmployeeRow | null;
  }

  if ((role === "employee" || role === "manager") && !employee) {
    throw new Error("This account is not linked to an active employee record.");
  }

  if (role === "manager" && employee) {
    const { data: reportsData, error: reportsError } = await client
      .from("employees")
      .select("employee_number")
      .eq("organization_id", organizationId)
      .eq("manager_id", employee.id)
      .is("deleted_at", null);

    if (reportsError) throw reportsError;
    teamIds = (reportsData ?? []).map((report) => String(report.employee_number));
  }

  const metadataName = user.user_metadata.full_name ?? user.user_metadata.name;
  const email = employee?.email || user.email || "";

  return {
    id: user.id,
    email,
    name:
      employee?.full_name ||
      (typeof metadataName === "string" ? metadataName : "") ||
      email ||
      "Northstar user",
    role,
    ...(employee ? { employeeId: employee.employee_number } : {}),
    teamIds,
    organizationId: membership.organization_id,
    authSource: "supabase",
  };
}
