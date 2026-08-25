"use client";
import Link from "next/link";
import { useAttendance } from "@/components/attendance-provider";
import { Avatar, PageHeading, ProgressBar, StatCard, StatusBadge } from "@/components/ui";
import { formatLongDate, getToday, percentageFor, recordsForDate } from "@/lib/attendance";
import { formatMinutes, isScheduledDate } from "@/lib/scheduling";
import { useAuth } from "@/components/auth-provider";

export default function DashboardPage() {
  const { role } = useAuth();
  const { records, employees, leaveRequests, shifts, assignments, holidays, workingDays } = useAttendance();
  const today = getToday();
  const todayRecords = recordsForDate(records, today).filter((record) => employees.some((employee) => employee.id === record.employeeId && employee.status === "Active"));
  const counts = { present: 0, absent: 0, late: 0, leave: 0 };
  todayRecords.forEach((record) => counts[record.status]++);
  const attendanceRate = todayRecords.length ? Math.round(((counts.present + counts.late) / todayRecords.length) * 100) : 0;
  const activeCount = employees.filter((employee) => employee.status === "Active").length; const pending = leaveRequests.filter((request) => request.status === "Pending").length; const onLeave = new Set(leaveRequests.filter((request) => request.status === "Approved" && request.startDate <= today && request.endDate >= today).map((request) => request.employeeId)).size; const checkedIn = todayRecords.filter((record) => record.checkIn).length; const checkedOut = todayRecords.filter((record) => record.checkOut).length; const currentlyWorking = todayRecords.filter((record) => record.checkIn && !record.checkOut).length; const overtime = todayRecords.reduce((total, record) => total + (record.overtimeMinutes || 0), 0); const todayHoliday = holidays.find((holiday) => holiday.date === today); const workingToday = isScheduledDate(today, workingDays, holidays); const upcomingHoliday = [...holidays].filter((holiday) => holiday.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
  const trend = Array.from({ length: 7 }, (_, offset) => { const date = new Date(); date.setDate(date.getDate() - (6 - offset)); const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; const day = records.filter((record) => record.date === key); return { label: date.toLocaleDateString("en-US", { weekday: "short" }), value: day.length ? Math.round(day.filter((record) => record.status === "present" || record.status === "late").length / day.length * 100) : 0 }; });
  return <div className="space-y-6">
    <PageHeading eyebrow={formatLongDate(today)} title={role === "employee" ? "My dashboard" : role === "manager" ? "Manager dashboard" : "Dashboard"} description={role === "employee" ? "Your personal attendance and schedule at a glance." : role === "manager" ? "A scoped view of your assigned team's attendance." : "A clear organization-wide attendance view."} action={<Link className="btn-primary" href="/attendance">{role === "employee" ? "My attendance" : role === "manager" ? "Team attendance" : "Mark attendance"}</Link>} />
    <section aria-label="Attendance summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Total employees" value={employees.length} tone="blue" icon="people" />
      <StatCard label="Present today" value={counts.present} tone="green" icon="check" />
      <StatCard label="Absent today" value={counts.absent} tone="red" icon="x" />
      <StatCard label="Late today" value={counts.late} tone="amber" icon="clock" />
      <StatCard label="Attendance" value={workingToday ? `${attendanceRate}%` : "N/A"} tone="violet" icon="chart" />
    </section>
    <section aria-label="Workforce summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4"><StatCard label="Active employees" value={activeCount} tone="green" icon="people" /><StatCard label="Inactive employees" value={employees.length - activeCount} tone="red" icon="people" /><StatCard label="On leave today" value={onLeave} tone="blue" icon="calendar" /><StatCard label="Pending leave" value={pending} tone="amber" icon="clock" /></section>
    <section aria-label="Live attendance summary" className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6"><StatCard label="Checked in" value={checkedIn} tone="blue" icon="check" /><StatCard label="Checked out" value={checkedOut} tone="green" icon="check" /><StatCard label="Late arrivals" value={counts.late} tone="amber" icon="clock" /><StatCard label="Overtime today" value={formatMinutes(overtime)} tone="violet" icon="chart" /><StatCard label="Currently working" value={currentlyWorking} tone="green" icon="people" /><article className="panel p-4"><p className="text-sm font-medium text-slate-500">Today&apos;s schedule</p><p className="mt-1 text-sm font-bold text-slate-900">{todayHoliday?.name || (workingToday ? "Working day" : "Non-working day")}</p><p className="mt-1 truncate text-xs text-slate-500">{upcomingHoliday ? `Next: ${upcomingHoliday.name}` : "No upcoming holiday"}</p></article></section>
    <section className="panel p-5"><div className="flex items-start justify-between"><div><h2 className="section-title">Attendance trend</h2><p className="section-copy">Authorized attendance rate over the last seven days</p></div><span className="text-xs font-semibold text-slate-500">7 days</span></div><div className="mt-6 grid h-40 grid-cols-7 items-end gap-2 sm:gap-4" role="img" aria-label="Seven day attendance trend">{trend.map((item) => <div className="flex h-full flex-col justify-end gap-2 text-center" key={item.label}><span className="text-[10px] font-semibold text-slate-500">{item.value}%</span><div className="mx-auto w-full max-w-12 rounded-t-md bg-blue-600/85" style={{ height: `${Math.max(4, item.value)}%` }} /><span className="text-[10px] font-medium text-slate-400">{item.label}</span></div>)}</div></section>
    <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
      <div className="panel overflow-hidden">
        <div className="panel-heading"><div><h2 className="section-title">Today&apos;s attendance</h2><p className="section-copy">Live status for {formatLongDate(today)}</p></div><Link className="text-link" href="/records">View records</Link></div>
        {todayRecords.length === 0 ? <div className="empty-state"><div className="empty-icon">✓</div><h3>No attendance marked yet</h3><p>Start marking today&apos;s attendance to populate this overview.</p><Link className="btn-secondary mt-4" href="/attendance">Mark attendance</Link></div> :
          <div className="divide-y divide-slate-100">{todayRecords.slice(0, 6).map((record) => { const employee = employees.find((item) => item.id === record.employeeId)!; return <div key={record.employeeId} className="flex items-center gap-3 px-5 py-3.5"><Avatar initials={employee.initials} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{employee.name}</p><p className="truncate text-xs text-slate-500">{employee.department} · {employee.role}</p></div><StatusBadge status={record.status} /></div>; })}</div>}
      </div>
      <div className="panel p-5"><div className="mb-5"><h2 className="section-title">Team attendance</h2><p className="section-copy">Scheduled working days only</p></div><div className="space-y-4">{employees.slice(0, 6).map((employee) => { const shift = shifts.find((item) => item.id === assignments[employee.id]); const pct = percentageFor(records, employee.id, undefined, (date) => isScheduledDate(date, workingDays, holidays, shift)); return <div key={employee.id}><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="truncate font-medium text-slate-700">{employee.name}</span><span className="font-semibold text-slate-900">{pct}%</span></div><ProgressBar value={pct} /></div>; })}</div><Link className="btn-secondary mt-6 w-full" href="/monthly">View monthly overview</Link></div>
    </section>
  </div>;
}
