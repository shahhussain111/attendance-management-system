import { EmployeeForm } from "@/components/employee-form"; import { PageHeading } from "@/components/ui";
export default function NewEmployeePage() { return <div className="space-y-6"><PageHeading title="Add employee" description="Create a new employee profile for your organization." /><EmployeeForm /></div>; }
