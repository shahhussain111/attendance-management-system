import { employees } from "@/data/employees";
export const attendanceStatuses = ["present", "absent", "late", "leave"] as const;
export type AttendanceStatus = (typeof attendanceStatuses)[number];
export type AttendanceRecord = { employeeId: string; date: string; status: AttendanceStatus; source?: "manual" | "approved-leave"; leaveRequestId?: string };
export function toDateKey(date: Date) { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, "0"); const day = String(date.getDate()).padStart(2, "0"); return `${year}-${month}-${day}`; }
export const getToday = () => toDateKey(new Date());
export const getMonthKey = () => getToday().slice(0, 7);
export const formatLongDate = (date: string) => new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
export const formatShortDate = (date: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
export const recordsForDate = (records: AttendanceRecord[], date: string) => records.filter((record) => record.date === date);
export const percentageFor = (records: AttendanceRecord[], employeeId: string, month?: string) => { const relevant = records.filter((record) => record.employeeId === employeeId && (!month || record.date.startsWith(month))); if (!relevant.length) return 0; return Math.round((relevant.filter((record) => record.status === "present" || record.status === "late").length / relevant.length) * 100); };
export function createPracticeRecords(): AttendanceRecord[] { const records: AttendanceRecord[] = []; const today = new Date(); for (let offset = 12; offset >= 0; offset--) { const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset); if (date.getDay() === 0 || date.getDay() === 6) continue; employees.forEach((employee, index) => { const roll = (index * 3 + offset) % 17; const status: AttendanceStatus = roll === 0 ? "absent" : roll < 3 ? "late" : "present"; records.push({ employeeId: employee.id, date: toDateKey(date), status, source: "manual" }); }); } return records; }
