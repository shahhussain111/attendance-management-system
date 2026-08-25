import type { DemoRole } from "@/lib/auth";
import type { AttendanceStatus } from "@/lib/attendance";

export const OPERATIONS_KEYS = { corrections: "northstar-attendance-corrections-v1", audit: "northstar-audit-logs-v1", notificationReads: "northstar-notification-reads-v1", departments: "northstar-departments-v1", settings: "northstar-organization-settings-v1" } as const;
export type CorrectionStatus = "Pending" | "Approved" | "Rejected";
export type CorrectionRequest = { id: string; employeeId: string; attendanceDate: string; requestedStatus?: AttendanceStatus; requestedCheckIn?: string; requestedCheckOut?: string; reason: string; requestDate: string; status: CorrectionStatus; reviewedBy?: string; reviewNote?: string };
export type AuditEntry = { id: string; timestamp: string; actorId: string; actorName: string; role: DemoRole; action: string; entityType: string; entityId: string; description: string; before?: string; after?: string };
export type Department = { id: string; name: string; managerEmployeeId: string; status: "Active" | "Inactive" };
export type OrganizationSettings = { organizationName: string; timezone: string; workingDays: number[]; defaultGraceMinutes: number; overtimePolicy: string; attendancePercentageRule: string; leaveApprovalMode: "manager-and-hr" | "hr-only"; managerApprovalRequired: boolean; hrFinalApprovalRequired: boolean };
export const defaultSettings: OrganizationSettings = { organizationName: "Northstar", timezone: "Asia/Karachi", workingDays: [1, 2, 3, 4, 5], defaultGraceMinutes: 10, overtimePolicy: "After scheduled shift duration", attendancePercentageRule: "Present and late count as attended", leaveApprovalMode: "manager-and-hr", managerApprovalRequired: true, hrFinalApprovalRequired: true };

export function escapeCsv(value: unknown) { const text = String(value ?? ""); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }
export function downloadCsv(filename: string, rows: unknown[][]) { const content = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n"); const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }

