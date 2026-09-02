import type { Metadata } from "next";
import "./globals.css";
import { AttendanceProvider } from "@/components/attendance-provider";
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/components/auth-provider";
import { OperationsProvider } from "@/components/operations-provider";
import { WorkforceProvider } from "@/components/workforce-provider";
import { EmployeeSelfServiceProvider } from "@/components/employee-self-service-provider";

export const metadata: Metadata = {
  title: "Northstar Attendance",
  description: "Employee attendance management dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full"><AuthProvider><AttendanceProvider><OperationsProvider><WorkforceProvider><EmployeeSelfServiceProvider><AppShell>{children}</AppShell></EmployeeSelfServiceProvider></WorkforceProvider></OperationsProvider></AttendanceProvider></AuthProvider></body>
    </html>
  );
}
