export const employeeStatuses = ["Active", "Inactive", "Terminated"] as const;
export type EmployeeStatus = (typeof employeeStatuses)[number];
export type Employee = { id: string; name: string; department: string; role: string; email: string; phone: string; status: EmployeeStatus; initials: string; joiningDate: string; manager: string; location: string; deletedAt?: string };
export const employees: Employee[] = [
  { id: "EMP-1001", name: "Ayesha Khan", department: "Engineering", role: "Frontend Engineer", email: "ayesha.khan@northstar.co", phone: "+92 300 123 4501", status: "Active", initials: "AK", joiningDate: "2023-02-13", manager: "Usman Tariq", location: "Lahore HQ" },
  { id: "EMP-1002", name: "Bilal Ahmed", department: "Engineering", role: "Backend Engineer", email: "bilal.ahmed@northstar.co", phone: "+92 301 445 7812", status: "Active", initials: "BA", joiningDate: "2022-08-01", manager: "Usman Tariq", location: "Remote" },
  { id: "EMP-1003", name: "Sara Malik", department: "Design", role: "Product Designer", email: "sara.malik@northstar.co", phone: "+92 333 908 1120", status: "Active", initials: "SM", joiningDate: "2023-05-22", manager: "Nadia Saeed", location: "Karachi Office" },
  { id: "EMP-1004", name: "Hamza Ali", department: "Marketing", role: "Growth Manager", email: "hamza.ali@northstar.co", phone: "+92 321 771 8834", status: "Active", initials: "HA", joiningDate: "2021-11-15", manager: "Fatima Raza", location: "Lahore HQ" },
  { id: "EMP-1005", name: "Zainab Noor", department: "People", role: "HR Specialist", email: "zainab.noor@northstar.co", phone: "+92 305 662 1903", status: "Active", initials: "ZN", joiningDate: "2024-01-08", manager: "Mariam Siddiqui", location: "Lahore HQ" },
  { id: "EMP-1006", name: "Omar Farooq", department: "Finance", role: "Financial Analyst", email: "omar.farooq@northstar.co", phone: "+92 312 591 7720", status: "Active", initials: "OF", joiningDate: "2022-04-18", manager: "Saad Mirza", location: "Islamabad Office" },
  { id: "EMP-1007", name: "Mariam Siddiqui", department: "Operations", role: "Operations Lead", email: "mariam.siddiqui@northstar.co", phone: "+92 315 227 6801", status: "Active", initials: "MS", joiningDate: "2020-09-07", manager: "Muneeb Ahmed", location: "Lahore HQ" },
  { id: "EMP-1008", name: "Daniyal Shah", department: "Sales", role: "Account Executive", email: "daniyal.shah@northstar.co", phone: "+92 322 440 9156", status: "Active", initials: "DS", joiningDate: "2024-03-11", manager: "Faraz Sheikh", location: "Karachi Office" },
  { id: "EMP-1009", name: "Hira Qureshi", department: "Customer Success", role: "Success Manager", email: "hira.qureshi@northstar.co", phone: "+92 304 881 2370", status: "Active", initials: "HQ", joiningDate: "2023-07-03", manager: "Faraz Sheikh", location: "Remote" },
  { id: "EMP-1010", name: "Raza Hussain", department: "Engineering", role: "QA Engineer", email: "raza.hussain@northstar.co", phone: "+92 316 734 5002", status: "Inactive", initials: "RH", joiningDate: "2022-12-05", manager: "Usman Tariq", location: "Lahore HQ" },
];
export const defaultDepartments = [...new Set(employees.map((employee) => employee.department))].sort();
