import { Shift } from "@/lib/scheduling";
export const seedShifts: Shift[] = [
  { id: "shift-morning", name: "Morning Shift", startTime: "09:00", endTime: "17:00", graceMinutes: 10, workingDays: [1, 2, 3, 4, 5], status: "Active", workArrangement: "Office" },
  { id: "shift-evening", name: "Evening Shift", startTime: "14:00", endTime: "22:00", graceMinutes: 10, workingDays: [1, 2, 3, 4, 5], status: "Active", workArrangement: "Office" },
  { id: "shift-night", name: "Night Shift", startTime: "22:00", endTime: "06:00", graceMinutes: 15, workingDays: [1, 2, 3, 4, 5], status: "Active", workArrangement: "Office" },
];
