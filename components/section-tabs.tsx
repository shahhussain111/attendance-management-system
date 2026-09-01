"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SectionTab = { href: string; label: string };

export function SectionTabs({ items }: { items: SectionTab[] }) {
  const pathname = usePathname();
  return <nav aria-label="Section navigation" className="section-tabs">
    {items.map((item) => <Link className={pathname === item.href ? "active" : ""} href={item.href} key={item.href}>{item.label}</Link>)}
  </nav>;
}
