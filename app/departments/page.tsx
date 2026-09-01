"use client";
import { FormEvent, useState } from "react";
import { useAttendance } from "@/components/attendance-provider";
import { useOperations } from "@/components/operations-provider";
import { Avatar, EmptyState, EmployeeStatusBadge, PageHeading } from "@/components/ui";

export default function DepartmentsPage() {
  const { employees } = useAttendance(); const { departments, addDepartment, updateDepartment } = useOperations(); const [name, setName] = useState(""); const [managerEmployeeId, setManager] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); if (!name.trim()) return; addDepartment({ name: name.trim(), managerEmployeeId, status: "Active" }); setName(""); setManager(""); }
  return <div className="space-y-6"><PageHeading eyebrow="People" title="Departments" description="Organize employees into clear teams and reporting groups." />
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="panel overflow-hidden"><div className="panel-heading"><div><h2 className="section-title">Department directory</h2><p className="section-copy">{departments.length} departments</p></div></div>{departments.length ? <div className="table-wrap"><table className="min-w-[720px]"><thead><tr><th>Department</th><th>Manager</th><th>Employees</th><th>Status</th><th>Action</th></tr></thead><tbody>{departments.map((item) => { const manager = employees.find((employee) => employee.id === item.managerEmployeeId); const employeeCount = employees.filter((employee) => employee.department === item.name).length; return <tr key={item.id}><td className="font-semibold text-slate-900">{item.name}</td><td>{manager ? <span className="flex items-center gap-2"><Avatar initials={manager.initials} /><span>{manager.name}</span></span> : <span className="text-slate-400">Unassigned</span>}</td><td><b className="text-slate-900">{employeeCount}</b> {employeeCount === 1 ? "employee" : "employees"}</td><td><EmployeeStatusBadge status={item.status} /></td><td><button className="table-action" onClick={() => updateDepartment(item.id, { ...item, status: item.status === "Active" ? "Inactive" : "Active" })}>{item.status === "Active" ? "Deactivate" : "Activate"}</button></td></tr>; })}</tbody></table></div> : <EmptyState title="No departments" description="Create the first department." />}</div>
      <form className="panel h-fit overflow-hidden" onSubmit={submit}><div className="panel-heading"><div><h2 className="section-title">Add department</h2><p className="section-copy">Create a new workforce group.</p></div></div><div className="space-y-4 p-5"><label className="form-field"><span>Department name</span><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Engineering" /></label><label className="form-field"><span>Manager</span><select value={managerEmployeeId} onChange={(event) => setManager(event.target.value)}><option value="">Unassigned</option>{employees.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button className="btn-primary w-full">Add department</button></div></form>
    </section>
  </div>;
}
