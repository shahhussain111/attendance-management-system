import type { Employee } from "@/data/employees";
import type { AttendanceRecord } from "@/lib/attendance";
import type { LeaveRequest } from "@/lib/leave";

export type DemoRole = "admin" | "hr" | "manager" | "employee";
export type DemoUser = { id: string; email: string; password: string; name: string; role: DemoRole; employeeId?: string; teamIds: string[] };
export type DemoSessionUser = Omit<DemoUser, "password">;

export const DEMO_SESSION_KEY = "northstar-demo-session-v1";
export const demoUsers: DemoUser[] = [
  { id: "demo-admin", email: "admin@northstar.test", password: "admin123", name: "Muneeb Ahmed", role: "admin", teamIds: [] },
  { id: "demo-hr", email: "hr@northstar.test", password: "hr123", name: "Zainab Noor", role: "hr", employeeId: "EMP-1005", teamIds: [] },
  { id: "demo-manager", email: "manager@northstar.test", password: "manager123", name: "Usman Tariq", role: "manager", employeeId: "EMP-1007", teamIds: ["EMP-1001", "EMP-1002", "EMP-1003"] },
  { id: "demo-employee", email: "employee@northstar.test", password: "employee123", name: "Ayesha Khan", role: "employee", employeeId: "EMP-1001", teamIds: [] },
];

export const roleLabels: Record<DemoRole, string> = { admin: "Admin", hr: "HR Manager", manager: "Manager", employee: "Employee" };
const routeRoles: { pattern: RegExp; roles: DemoRole[] }[] = [
  { pattern: /^\/$/, roles: ["admin", "hr", "manager", "employee"] },
  { pattern: /^\/employees\/new\/?$/, roles: ["admin", "hr"] },
  { pattern: /^\/employees\/[^/]+\/edit\/?$/, roles: ["admin", "hr"] },
  { pattern: /^\/employees(?:\/[^/]+)?\/?$/, roles: ["admin", "hr", "manager", "employee"] },
  { pattern: /^\/attendance\/?$/, roles: ["admin", "hr", "manager", "employee"] },
  { pattern: /^\/records\/?$/, roles: ["admin", "hr", "manager"] },
  { pattern: /^\/monthly\/?$/, roles: ["admin", "hr", "manager"] },
  { pattern: /^\/leave\/?$/, roles: ["admin", "hr", "manager", "employee"] },
  { pattern: /^\/schedule\/?$/, roles: ["admin", "hr", "manager", "employee"] },
  { pattern: /^\/time-clock\/?$/, roles: ["admin", "hr"] },
  { pattern: /^\/workforce\/?$/, roles: ["admin", "hr", "manager"] },
  { pattern: /^\/timesheets\/?$/, roles: ["admin", "hr", "manager", "employee"] },
  { pattern: /^\/shifts\/?$/, roles: ["admin", "hr"] },
  { pattern: /^\/holidays\/?$/, roles: ["admin"] },
  { pattern: /^\/reports\/?$/, roles: ["admin", "hr", "manager", "employee"] },
  { pattern: /^\/corrections\/?$/, roles: ["admin", "hr", "manager", "employee"] },
  { pattern: /^\/notifications\/?$/, roles: ["admin", "hr", "manager", "employee"] },
  { pattern: /^\/departments\/?$/, roles: ["admin", "hr"] },
  { pattern: /^\/audit\/?$/, roles: ["admin", "hr"] },
  { pattern: /^\/settings\/?$/, roles: ["admin", "hr"] },
  { pattern: /^\/calendar\/?$/, roles: ["admin", "hr", "manager", "employee"] },
  { pattern: /^\/announcements\/?$/, roles: ["admin", "hr", "manager", "employee"] },
  { pattern: /^\/lifecycle\/?$/, roles: ["admin", "hr", "employee"] },
];

export function canAccessRoute(role: DemoRole, pathname: string) { return routeRoles.some(({ pattern, roles }) => pattern.test(pathname) && roles.includes(role)); }
export const canManageEmployees = (role: DemoRole) => role === "admin" || role === "hr";
export const canDeleteEmployees = (role: DemoRole) => role === "admin";
export const canManageAttendance = (role: DemoRole) => role === "admin" || role === "hr";
export const canManageLeave = (role: DemoRole) => role === "admin" || role === "hr" || role === "manager";
export const canManageShifts = (role: DemoRole) => role === "admin" || role === "hr";
export const canManageHolidays = (role: DemoRole) => role === "admin";
export const visibleEmployeeIds = (user: DemoSessionUser) => user.role === "admin" || user.role === "hr" ? null : new Set([...(user.employeeId ? [user.employeeId] : []), ...(user.role === "manager" ? user.teamIds : [])]);
export function getVisibleEmployees<T extends Employee>(items: T[], user: DemoSessionUser) { const ids = visibleEmployeeIds(user); return ids ? items.filter((item) => ids.has(item.id)) : items; }
export function getVisibleAttendance<T extends AttendanceRecord>(items: T[], user: DemoSessionUser) { const ids = visibleEmployeeIds(user); return ids ? items.filter((item) => ids.has(item.employeeId)) : items; }
export function getVisibleLeaveRequests<T extends LeaveRequest>(items: T[], user: DemoSessionUser) { const ids = visibleEmployeeIds(user); return ids ? items.filter((item) => ids.has(item.employeeId)) : items; }
export const canViewEmployee = (user: DemoSessionUser, employeeId: string) => visibleEmployeeIds(user)?.has(employeeId) ?? true;
