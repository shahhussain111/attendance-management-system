import type { AttendanceRecord } from "@/lib/attendance";
import type { Shift } from "@/lib/scheduling";

export const WORKFORCE_KEYS = { schedules: "northstar-schedule-instances-v1", timesheets: "northstar-timesheet-approvals-v1" } as const;
export type ScheduleInstance = { id: string; employeeId: string; date: string; shiftId: string; startTime: string; endTime: string; status: "Scheduled" | "Changed"; createdAt: string; updatedAt: string };
export type TimesheetStatus = "Pending" | "Approved" | "Rejected";
export type TimesheetDecision = { id: string; employeeId: string; date: string; status: TimesheetStatus; note: string; reviewedBy: string; reviewedAt: string };
export type TimesheetApproval = { employeeId: string; date: string; status: TimesheetStatus; note?: string; reviewedBy?: string; reviewedAt?: string; history: TimesheetDecision[] };
export const demoPins: Record<string, string> = { "EMP-1001": "1101", "EMP-1002": "1102", "EMP-1003": "1103", "EMP-1004": "1104", "EMP-1005": "1105", "EMP-1006": "1106", "EMP-1007": "1107", "EMP-1008": "1108", "EMP-1009": "1109", "EMP-1010": "1110" };
export const scheduleKey = (employeeId: string, date: string) => `${employeeId}:${date}`;
export const approvalFor = (approvals: TimesheetApproval[], employeeId: string, date: string) => approvals.find((item) => item.employeeId === employeeId && item.date === date) || { employeeId, date, status: "Pending" as const, history: [] };
export const resolvedSchedule = (instances: ScheduleInstance[], employeeId: string, date: string, assignment: string | undefined, shifts: Shift[]) => instances.find((item) => item.employeeId === employeeId && item.date === date) || (() => { const shift = shifts.find((item) => item.id === assignment); return shift ? { id: `template:${employeeId}:${date}`, employeeId, date, shiftId: shift.id, startTime: shift.startTime, endTime: shift.endTime, status: "Scheduled" as const, createdAt: "", updatedAt: "" } : undefined; })();
export const grossMinutesFor = (record?: AttendanceRecord) => record?.checkIn && record.checkOut ? Math.max(0, minutes(record.checkOut) - minutes(record.checkIn)) : 0;
const minutes = (time: string) => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };
