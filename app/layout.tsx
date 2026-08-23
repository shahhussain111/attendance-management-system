import type { Metadata } from "next";
import "./globals.css";
import { AttendanceProvider } from "@/components/attendance-provider";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Northstar Attendance",
  description: "Employee attendance management dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full"><AttendanceProvider><AppShell>{children}</AppShell></AttendanceProvider></body>
    </html>
  );
}
