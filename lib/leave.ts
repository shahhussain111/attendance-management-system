export const leaveTypes = ["Annual Leave", "Sick Leave", "Casual Leave", "Unpaid Leave"] as const;
export const leaveStatuses = ["Pending", "Approved", "Rejected"] as const;
export type LeaveType = (typeof leaveTypes)[number]; export type LeaveStatus = (typeof leaveStatuses)[number];
export type LeaveRequest = { id: string; employeeId: string; type: LeaveType; startDate: string; endDate: string; days: number; reason: string; requestDate: string; status: LeaveStatus };
export type LeaveBalance = { annualAllowance: number; annualUsed: number; sickAllowance: number; sickUsed: number };
export const defaultBalance = (): LeaveBalance => ({ annualAllowance: 20, annualUsed: 0, sickAllowance: 10, sickUsed: 0 });
export function deriveLeaveBalances(employeeIds: string[], stored: Record<string, LeaveBalance>, requests: LeaveRequest[]) {
  const balances: Record<string, LeaveBalance> = {};
  employeeIds.forEach((employeeId) => {
    const prior = stored[employeeId];
    balances[employeeId] = {
      annualAllowance: Number.isFinite(prior?.annualAllowance) ? prior.annualAllowance : 20,
      annualUsed: 0,
      sickAllowance: Number.isFinite(prior?.sickAllowance) ? prior.sickAllowance : 10,
      sickUsed: 0,
    };
  });
  requests.forEach((request) => {
    if (request.status !== "Approved") return;
    const balance = balances[request.employeeId] || defaultBalance();
    if (request.type === "Annual Leave") balance.annualUsed += request.days;
    if (request.type === "Sick Leave") balance.sickUsed += request.days;
    balances[request.employeeId] = balance;
  });
  return balances;
}
export function daysInclusive(start: string, end: string) { if (!start || !end || end < start) return 0; return Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) + 1; }
export function datesInclusive(start: string, end: string) { const dates: string[] = []; const cursor = new Date(`${start}T00:00:00Z`); const last = new Date(`${end}T00:00:00Z`); while (cursor <= last) { dates.push(cursor.toISOString().slice(0, 10)); cursor.setUTCDate(cursor.getUTCDate() + 1); } return dates; }
