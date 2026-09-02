export const EMPLOYEE_SELF_SERVICE_KEYS = {
  workNotes: "northstar-employee-work-notes-v1",
  requests: "northstar-employee-requests-v1",
} as const;

export type DailyWorkNote = {
  id: string;
  employeeId: string;
  date: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeRequestKind = "request" | "issue";
export type EmployeeRequestStatus = "Pending" | "Approved" | "Rejected" | "Resolved";
export type EmployeeRequestType = "Shift Change" | "Work From Home" | "Schedule Adjustment" | "Other";
export type EmployeeIssueType = "Attendance Issue" | "Shift/Schedule Issue" | "Workplace Issue" | "Other";

export type EmployeeRequest = {
  id: string;
  employeeId: string;
  kind: EmployeeRequestKind;
  requestType: EmployeeRequestType | EmployeeIssueType;
  date: string;
  details: string;
  status: EmployeeRequestStatus;
  createdAt: string;
  updatedAt: string;
};
