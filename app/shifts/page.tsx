"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useAttendance } from "@/components/attendance-provider";
import { EmptyState, EmployeeStatusBadge, PageHeading } from "@/components/ui";
import { Shift, formatMinutes, shiftArrangement, shiftArrangements, shiftDuration, weekDays } from "@/lib/scheduling";

type Values = Omit<Shift, "id" | "deletedAt">;
const blank: Values = { name: "", startTime: "09:00", endTime: "17:00", graceMinutes: 10, workingDays: [1, 2, 3, 4, 5], status: "Active", workArrangement: "Office" };

export default function ShiftsPage() {
  const { shifts, assignments, workingDays, setWorkingDays, addShift, updateShift, deleteShift, setShiftActive } = useAttendance();
  const formRef = useRef<HTMLFormElement>(null); const nameRef = useRef<HTMLInputElement>(null);
  const [formOpen, setFormOpen] = useState(false); const [editingId, setEditingId] = useState<string>(); const [values, setValues] = useState<Values>(blank); const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (!formOpen) return; formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); nameRef.current?.focus({ preventScroll: true }); }, [formOpen, editingId]);
  const openAdd = () => { setValues(blank); setEditingId(undefined); setErrors({}); setFormOpen(true); };
  const openEdit = (shift: Shift) => { setValues({ name: shift.name, startTime: shift.startTime, endTime: shift.endTime, graceMinutes: shift.graceMinutes, workingDays: [...shift.workingDays], status: shift.status, workArrangement: shiftArrangement(shift) }); setEditingId(shift.id); setErrors({}); setFormOpen(true); };
  const close = () => { setFormOpen(false); setEditingId(undefined); setValues(blank); setErrors({}); };
  const toggleDay = (day: number) => setValues((current) => ({ ...current, workingDays: current.workingDays.includes(day) ? current.workingDays.filter((item) => item !== day) : [...current.workingDays, day] }));

  function submit(event: FormEvent) {
    event.preventDefault(); const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = "Shift name is required."; if (!values.startTime) next.startTime = "Start time is required."; if (!values.endTime) next.endTime = "End time is required."; if (values.graceMinutes < 0 || values.graceMinutes > 180) next.graceMinutes = "Use a grace period between 0 and 180 minutes."; if (!values.workingDays.length) next.workingDays = "Select at least one working day.";
    setErrors(next); if (Object.keys(next).length) return;
    const normalized = { ...values, name: values.name.trim() }; if (editingId) updateShift(editingId, normalized); else addShift(normalized); close();
  }

  const remove = (shift: Shift) => { const assigned = Object.values(assignments).filter((id) => id === shift.id).length; if (window.confirm(`Delete ${shift.name}? ${assigned ? `${assigned} employee assignment(s) will need a new shift.` : ""}`)) deleteShift(shift.id); };
  const toggleOrganizationDay = (day: number) => setWorkingDays(workingDays.includes(day) ? workingDays.filter((item) => item !== day) : [...workingDays, day]);

  return <div className="space-y-6">
    <PageHeading title="Shift management" description="Configure schedules, grace periods, and organization working days." action={<button className="btn-primary" onClick={() => formOpen ? close() : openAdd()}>{formOpen ? "Close form" : "Add shift"}</button>} />
    <section className="panel p-5"><h2 className="section-title">Organization working days</h2><p className="section-copy">Non-working days are excluded from expected attendance and percentages.</p><div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Organization working days">{weekDays.map((day) => <button key={day.value} className={`day-toggle ${workingDays.includes(day.value) ? "selected" : ""}`} aria-pressed={workingDays.includes(day.value)} onClick={() => toggleOrganizationDay(day.value)}>{day.short}</button>)}</div></section>

    {formOpen && <form ref={formRef} className="panel scroll-mt-24" onSubmit={submit} noValidate>
      <div className="panel-heading"><div><h2 className="section-title">{editingId ? "Edit shift" : "New shift"}</h2><p className="section-copy">{editingId ? "Update this schedule without affecting its assignments." : "Create a schedule for employee assignment."}</p></div></div>
      <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-6">
        <label className="form-field"><span>Shift name *</span><input ref={nameRef} value={values.name} aria-invalid={!!errors.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} />{errors.name && <small role="alert">{errors.name}</small>}</label>
        <label className="form-field"><span>Start time *</span><input type="time" value={values.startTime} aria-invalid={!!errors.startTime} onChange={(event) => setValues((current) => ({ ...current, startTime: event.target.value }))} /></label>
        <label className="form-field"><span>End time *</span><input type="time" value={values.endTime} aria-invalid={!!errors.endTime} onChange={(event) => setValues((current) => ({ ...current, endTime: event.target.value }))} /></label>
        <label className="form-field"><span>Grace period *</span><input type="number" min="0" max="180" value={values.graceMinutes} aria-invalid={!!errors.graceMinutes} onChange={(event) => setValues((current) => ({ ...current, graceMinutes: Number(event.target.value) }))} />{errors.graceMinutes && <small role="alert">{errors.graceMinutes}</small>}</label>
        <label className="form-field"><span>Work arrangement</span><select value={values.workArrangement} onChange={(event) => setValues((current) => ({ ...current, workArrangement: event.target.value as Shift["workArrangement"] }))}>{shiftArrangements.map((arrangement) => <option key={arrangement}>{arrangement}</option>)}</select></label>
        <label className="form-field"><span>Status</span><select value={values.status} onChange={(event) => setValues((current) => ({ ...current, status: event.target.value as Shift["status"] }))}><option>Active</option><option>Inactive</option></select></label>
        <fieldset className="sm:col-span-2 lg:col-span-6"><legend className="text-sm font-semibold text-slate-700">Working days *</legend><div className="mt-2 flex flex-wrap gap-2">{weekDays.map((day) => <button type="button" key={day.value} className={`day-toggle ${values.workingDays.includes(day.value) ? "selected" : ""}`} aria-pressed={values.workingDays.includes(day.value)} onClick={() => toggleDay(day.value)}>{day.short}</button>)}</div>{errors.workingDays && <p className="mt-1 text-xs text-rose-600" role="alert">{errors.workingDays}</p>}</fieldset>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-100 p-5"><button type="button" className="btn-secondary" onClick={close}>Cancel</button><button type="submit" className="btn-primary">{editingId ? "Save changes" : "Create shift"}</button></div>
    </form>}

    <section className="panel overflow-hidden"><div className="panel-heading"><div><h2 className="section-title">Shifts</h2><p className="section-copy">{shifts.length} configured schedules</p></div></div>{shifts.length === 0 ? <EmptyState title="No shifts configured" description="Create a shift to assign employees and enable check-in." /> : <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">{shifts.map((shift) => <article className="rounded-xl border border-slate-200 p-4" key={shift.id}><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-900">{shift.name}</h3><p className="mt-1 text-sm text-slate-500">{shift.startTime} – {shift.endTime} · {formatMinutes(shiftDuration(shift))}</p></div><EmployeeStatusBadge status={shift.status} /></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-slate-500">Arrangement</dt><dd className="font-semibold">{shiftArrangement(shift)}</dd></div><div><dt className="text-xs text-slate-500">Grace period</dt><dd className="font-semibold">{shift.graceMinutes} minutes</dd></div><div><dt className="text-xs text-slate-500">Assigned</dt><dd className="font-semibold">{Object.values(assignments).filter((id) => id === shift.id).length} employees</dd></div></dl><p className="mt-3 text-xs text-slate-500">{weekDays.filter((day) => shift.workingDays.includes(day.value)).map((day) => day.short).join(", ")}</p><div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3"><button className="table-action" onClick={() => openEdit(shift)}>Edit</button><button className="table-action" onClick={() => setShiftActive(shift.id, shift.status !== "Active")}>{shift.status === "Active" ? "Deactivate" : "Activate"}</button><button className="table-action text-rose-600" onClick={() => remove(shift)}>Delete</button></div></article>)}</div>}</section>
  </div>;
}
