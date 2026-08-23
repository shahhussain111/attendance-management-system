export const weekDays = [
  { value: 1, short: "Mon", label: "Monday" }, { value: 2, short: "Tue", label: "Tuesday" },
  { value: 3, short: "Wed", label: "Wednesday" }, { value: 4, short: "Thu", label: "Thursday" },
  { value: 5, short: "Fri", label: "Friday" }, { value: 6, short: "Sat", label: "Saturday" },
  { value: 0, short: "Sun", label: "Sunday" },
] as const;
export const holidayTypes = ["Public Holiday", "Company Holiday", "Optional Holiday"] as const;
export type HolidayType = (typeof holidayTypes)[number];
export type Shift = { id: string; name: string; startTime: string; endTime: string; graceMinutes: number; workingDays: number[]; status: "Active" | "Inactive"; deletedAt?: string };
export type Holiday = { id: string; name: string; date: string; type: HolidayType };
export type TimeMetrics = { workedMinutes: number; overtimeMinutes: number; earlyDepartureMinutes: number };
export const defaultWorkingDays = [1, 2, 3, 4, 5];
export const timeToMinutes = (time: string) => { const [hours, minutes] = time.split(":").map(Number); return hours * 60 + minutes; };
export const shiftDuration = (shift: Shift) => { const start = timeToMinutes(shift.startTime); let end = timeToMinutes(shift.endTime); if (end <= start) end += 1440; return end - start; };
export const isLateCheckIn = (time: string, shift: Shift) => timeToMinutes(time) > timeToMinutes(shift.startTime) + shift.graceMinutes;
export function calculateTimeMetrics(checkIn: string, checkOut: string, shift: Shift): TimeMetrics {
  const start = timeToMinutes(checkIn); const end = timeToMinutes(checkOut); const workedMinutes = Math.max(0, end - start); const duration = shiftDuration(shift); let scheduledEnd = timeToMinutes(shift.endTime); if (scheduledEnd <= timeToMinutes(shift.startTime)) scheduledEnd += 1440;
  return { workedMinutes, overtimeMinutes: Math.max(0, workedMinutes - duration), earlyDepartureMinutes: Math.max(0, Math.min(duration, scheduledEnd - end)) };
}
export const formatMinutes = (minutes = 0) => `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
export const isHolidayDate = (date: string, holidays: Holiday[]) => holidays.some((holiday) => holiday.date === date);
export function isScheduledDate(date: string, workingDays: number[], holidays: Holiday[], shift?: Shift) { const day = new Date(`${date}T00:00:00Z`).getUTCDay(); const allowedDays = shift?.workingDays.length ? shift.workingDays : workingDays; return workingDays.includes(day) && allowedDays.includes(day) && !isHolidayDate(date, holidays); }
export function reconcileClockStatuses(records: AttendanceRecord[], assignments: Record<string, string>, shifts: Shift[], workingDays: number[], holidays: Holiday[]) {
  let changed = false;
  const next = records.map((record) => {
    if (record.source !== "check-in" || record.statusSource === "manual" || !record.checkIn) return record;
    const shift = shifts.find((item) => item.id === (record.shiftId || assignments[record.employeeId]));
    if (!shift || !isScheduledDate(record.date, workingDays, holidays, shift)) return record;
    const status = isLateCheckIn(record.checkIn, shift) ? "late" : "present";
    if (record.status === status) return record;
    changed = true;
    return { ...record, status } as AttendanceRecord;
  });
  return changed ? next : records;
}
import type { AttendanceRecord } from "@/lib/attendance";
