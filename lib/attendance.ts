import { employees } from "@/data/employees";
export const attendanceStatuses = ["present", "absent", "late", "leave"] as const;
export type AttendanceStatus = (typeof attendanceStatuses)[number];
export type AttendanceSource = "manual" | "approved-leave" | "check-in";
export type AttendanceStatusSource = "manual" | "automatic" | "approved-leave";
export type BreakSession = { id: string; start: string; end?: string };
export type AttendanceRecord = { employeeId: string; date: string; status: AttendanceStatus; source?: AttendanceSource; statusSource?: AttendanceStatusSource; leaveRequestId?: string; shiftId?: string; scheduledStart?: string; scheduledEnd?: string; checkIn?: string; checkOut?: string; breaks?: BreakSession[]; workedMinutes?: number; overtimeMinutes?: number; earlyDepartureMinutes?: number };
const validTime = (time: unknown): time is string => typeof time === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time);
export const breakMinutesFor = (record?: AttendanceRecord, now?: string) => (record?.breaks || []).reduce((total, item) => { const end = item.end || now; return validTime(item.start) && validTime(end) ? total + Math.max(0, timeValue(end) - timeValue(item.start)) : total; }, 0);
const timeValue = (time: string) => { const [hours, minutes] = time.split(":").map(Number); return hours * 60 + minutes; };
export function toDateKey(date: Date) { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, "0"); const day = String(date.getDate()).padStart(2, "0"); return `${year}-${month}-${day}`; }
export const getToday = () => toDateKey(new Date());
export const getMonthKey = () => getToday().slice(0, 7);
export const formatLongDate = (date: string) => new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
export const formatShortDate = (date: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
export const recordsForDate = (records: AttendanceRecord[], date: string) => records.filter((record) => record.date === date);
export const percentageFor = (records: AttendanceRecord[], employeeId: string, month?: string, isScheduled: (date: string) => boolean = () => true) => { const relevant = records.filter((record) => record.employeeId === employeeId && (!month || record.date.startsWith(month)) && isScheduled(record.date)); if (!relevant.length) return 0; return Math.round((relevant.filter((record) => record.status === "present" || record.status === "late").length / relevant.length) * 100); };
export function normalizeAttendanceRecords(records: AttendanceRecord[]) {
  let changed = false; const canonical = new Map<string, AttendanceRecord>();
  records.forEach((stored) => {
    let record = stored; const breaks = Array.isArray(record.breaks) ? record.breaks.filter((item) => item && typeof item.id === "string" && validTime(item.start) && (item.end == null || validTime(item.end))) : []; if (breaks.length !== (record.breaks?.length || 0) || !Array.isArray(record.breaks)) { changed = true; record = { ...record, breaks }; }
    if ((record.checkIn && !validTime(record.checkIn)) || (record.checkOut && !validTime(record.checkOut))) { changed = true; record = { ...record, checkIn: validTime(record.checkIn) ? record.checkIn : undefined, checkOut: validTime(record.checkOut) ? record.checkOut : undefined, workedMinutes: undefined, overtimeMinutes: undefined, earlyDepartureMinutes: undefined }; }
    if ((record.scheduledStart && !validTime(record.scheduledStart)) || (record.scheduledEnd && !validTime(record.scheduledEnd))) { changed = true; record = { ...record, scheduledStart: undefined, scheduledEnd: undefined }; }
    if (record.source === "manual" && record.checkIn) { changed = true; record = { ...record, source: "check-in", statusSource: "manual" }; }
    else if (!record.statusSource) { changed = true; record = { ...record, statusSource: record.source === "check-in" ? "automatic" : record.source === "approved-leave" ? "approved-leave" : "manual" }; }
    const key = `${record.employeeId}:${record.date}`; const previous = canonical.get(key);
    if (!previous) { canonical.set(key, record); return; }
    changed = true; const approved = record.source === "approved-leave"; const hasClock = !!(previous.checkIn || record.checkIn);
    canonical.set(key, { ...previous, ...record, source: approved ? "approved-leave" : hasClock ? "check-in" : record.source || previous.source || "manual", statusSource: approved ? "approved-leave" : record.statusSource || "manual" });
  });
  return changed ? [...canonical.values()] : records;
}
export function applyManualAttendanceStatus(records: AttendanceRecord[], employeeId: string, date: string, status: AttendanceStatus) {
  const existing = records.find((record) => record.employeeId === employeeId && record.date === date);
  if (existing?.source === "approved-leave") return records;
  const next: AttendanceRecord = existing ? { ...existing, status, source: existing.source || (existing.checkIn ? "check-in" : "manual"), statusSource: "manual" } : { employeeId, date, status, source: "manual", statusSource: "manual" };
  return [...records.filter((record) => !(record.employeeId === employeeId && record.date === date)), next];
}
export function createPracticeRecords(): AttendanceRecord[] { const records: AttendanceRecord[] = []; const today = new Date(); for (let offset = 12; offset >= 0; offset--) { const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset); if (date.getDay() === 0 || date.getDay() === 6) continue; employees.forEach((employee, index) => { const roll = (index * 3 + offset) % 17; const status: AttendanceStatus = roll === 0 ? "absent" : roll < 3 ? "late" : "present"; records.push({ employeeId: employee.id, date: toDateKey(date), status, source: "manual", statusSource: "manual" }); }); } return records; }
