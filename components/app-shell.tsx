"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, IconName } from "@/components/icons";
const nav: { href: string; label: string; icon: IconName }[] = [{ href: "/", label: "Dashboard", icon: "dashboard" }, { href: "/employees", label: "Employees", icon: "people" }, { href: "/attendance", label: "Mark attendance", icon: "calendar" }, { href: "/records", label: "Records", icon: "records" }, { href: "/monthly", label: "Monthly overview", icon: "chart" }, { href: "/leave", label: "Leave requests", icon: "calendar" }];
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const [open, setOpen] = useState(false);
  return <div className="min-h-dvh bg-slate-50 text-slate-900">
    {open && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-18 items-center gap-3 border-b border-slate-100 px-5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-extrabold text-white">N</span><div><p className="font-bold leading-tight text-slate-950">Northstar</p><p className="text-xs text-slate-500">People Operations</p></div></div>
      <nav aria-label="Main navigation" className="flex-1 space-y-1 p-3">{nav.map((item) => { const active = pathname === item.href; return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`nav-link ${active ? "nav-active" : ""}`} aria-current={active ? "page" : undefined}><Icon name={item.icon} /><span>{item.label}</span></Link>; })}</nav>
      <div className="border-t border-slate-100 p-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">MA</span><div><p className="text-sm font-semibold">Muneeb Ahmed</p><p className="text-xs text-slate-500">Administrator</p></div></div></div>
    </aside>
    <div className="min-w-0 lg:pl-64"><header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"><button className="icon-button lg:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}><Icon name="menu" /></button><div className="hidden sm:block"><p className="text-sm font-semibold">Attendance Management</p><p className="text-xs text-slate-500">Track your team with confidence</p></div><div className="flex items-center gap-2 rounded-full border border-slate-200 py-1.5 pl-1.5 pr-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">MA</span><span className="text-xs font-semibold">Admin</span></div></header><main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main></div>
  </div>;
}
