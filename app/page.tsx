"use client";
import Link from "next/link";
import { useAttendance } from "@/components/attendance-provider";
import { Avatar, PageHeading, ProgressBar, StatCard, StatusBadge } from "@/components/ui";
import { formatLongDate, getToday, percentageFor, recordsForDate } from "@/lib/attendance";

export default function DashboardPage() {
  const { records, employees, leaveRequests } = useAttendance();
  const today = getToday();
  const todayRecords = recordsForDate(records, today).filter((record) => employees.some((employee) => employee.id === record.employeeId && employee.status === "Active"));
  const counts = { present: 0, absent: 0, late: 0, leave: 0 };
  todayRecords.forEach((record) => counts[record.status]++);
  const attendanceRate = todayRecords.length ? Math.round(((counts.present + counts.late) / todayRecords.length) * 100) : 0;
  const activeCount = employees.filter((employee) => employee.status === "Active").length; const pending = leaveRequests.filter((request) => request.status === "Pending").length; const onLeave = new Set(leaveRequests.filter((request) => request.status === "Approved" && request.startDate <= today && request.endDate >= today).map((request) => request.employeeId)).size;
  return <div className="space-y-6">
    <PageHeading eyebrow={formatLongDate(today)} title="Dashboard" description="A clear view of your team's attendance today." action={<Link className="btn-primary" href="/attendance">Mark attendance</Link>} />
    <section aria-label="Attendance summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Total employees" value={employees.length} tone="blue" icon="people" />
      <StatCard label="Present today" value={counts.present} tone="green" icon="check" />
      <StatCard label="Absent today" value={counts.absent} tone="red" icon="x" />
      <StatCard label="Late today" value={counts.late} tone="amber" icon="clock" />
      <StatCard label="Attendance" value={`${attendanceRate}%`} tone="violet" icon="chart" />
    </section>
    <section aria-label="Workforce summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4"><StatCard label="Active employees" value={activeCount} tone="green" icon="people" /><StatCard label="Inactive employees" value={employees.length - activeCount} tone="red" icon="people" /><StatCard label="On leave today" value={onLeave} tone="blue" icon="calendar" /><StatCard label="Pending leave" value={pending} tone="amber" icon="clock" /></section>
    <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
      <div className="panel overflow-hidden">
        <div className="panel-heading"><div><h2 className="section-title">Today&apos;s attendance</h2><p className="section-copy">Live status for {formatLongDate(today)}</p></div><Link className="text-link" href="/records">View records</Link></div>
        {todayRecords.length === 0 ? <div className="empty-state"><div className="empty-icon">✓</div><h3>No attendance marked yet</h3><p>Start marking today&apos;s attendance to populate this overview.</p><Link className="btn-secondary mt-4" href="/attendance">Mark attendance</Link></div> :
          <div className="divide-y divide-slate-100">{todayRecords.slice(0, 6).map((record) => { const employee = employees.find((item) => item.id === record.employeeId)!; return <div key={record.employeeId} className="flex items-center gap-3 px-5 py-3.5"><Avatar initials={employee.initials} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{employee.name}</p><p className="truncate text-xs text-slate-500">{employee.department} · {employee.role}</p></div><StatusBadge status={record.status} /></div>; })}</div>}
      </div>
      <div className="panel p-5"><div className="mb-5"><h2 className="section-title">Team attendance</h2><p className="section-copy">Based on all available records</p></div><div className="space-y-4">{employees.slice(0, 6).map((employee) => { const pct = percentageFor(records, employee.id); return <div key={employee.id}><div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="truncate font-medium text-slate-700">{employee.name}</span><span className="font-semibold text-slate-900">{pct}%</span></div><ProgressBar value={pct} /></div>; })}</div><Link className="btn-secondary mt-6 w-full" href="/monthly">View monthly overview</Link></div>
    </section>
  </div>;
}
