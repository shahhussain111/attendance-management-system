import { EmployeeForm } from "@/components/employee-form"; import { PageHeading } from "@/components/ui";
export default function NewEmployeePage() { return <div className="mx-auto max-w-5xl space-y-6"><PageHeading eyebrow="People / Employees" title="Add employee" description="Create a new employee profile for your organization." /><EmployeeForm /></div>; }
