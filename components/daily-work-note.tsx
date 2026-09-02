"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useEmployeeSelfService } from "@/components/employee-self-service-provider";
import { getToday } from "@/lib/attendance";

export function DailyWorkNoteCard() {
  const { currentUser } = useAuth(); const { workNotes, saveWorkNote } = useEmployeeSelfService(); const today = getToday();
  const saved = workNotes.find((item) => item.employeeId === currentUser?.employeeId && item.date === today);
  const [draft, setDraft] = useState<string | null>(null); const [message, setMessage] = useState(""); const note = draft ?? saved?.note ?? "";
  const submit = (event: React.FormEvent) => { event.preventDefault(); if (!currentUser?.employeeId) return; const ok = saveWorkNote(currentUser.employeeId, today, note); setMessage(ok ? "Work note saved." : "Enter a work note before saving."); };
  return <form className="panel overflow-hidden" onSubmit={submit}><div className="panel-heading"><div><h2 className="section-title">Today&apos;s Work Note</h2><p className="section-copy">A short summary of what you worked on today.</p></div>{saved && <span className="text-xs font-medium text-emerald-700">Saved</span>}</div><div className="p-5 sm:p-6"><label className="form-field"><span>What did you work on today?</span><textarea maxLength={500} rows={3} value={note} onChange={(event) => { setDraft(event.target.value); setMessage(""); }} placeholder="Add a brief work summary…" /></label><div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="text-xs text-slate-400"><span>{note.length}/500</span>{saved && <span> · Updated {new Date(saved.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}{message && <span className={`ml-2 font-semibold ${message.includes("saved") ? "text-emerald-700" : "text-rose-600"}`}>{message}</span>}</div><button className="btn-primary w-full sm:w-auto" type="submit">{saved ? "Update Note" : "Save Note"}</button></div></div></form>;
}
