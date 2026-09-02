"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useOperations } from "@/components/operations-provider";
import { DailyWorkNote, EMPLOYEE_SELF_SERVICE_KEYS, EmployeeRequest } from "@/lib/employee-self-service";

type RequestInput = Pick<EmployeeRequest, "employeeId" | "kind" | "requestType" | "date" | "details">;
type Value = {
  workNotes: DailyWorkNote[];
  requests: EmployeeRequest[];
  saveWorkNote: (employeeId: string, date: string, note: string) => boolean;
  submitRequest: (input: RequestInput) => boolean;
  reviewRequest: (id: string, status: "Approved" | "Rejected" | "Resolved") => boolean;
};

const Context = createContext<Value | null>(null);
const readArray = <T,>(key: string): T[] => {
  try { const parsed: unknown = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(parsed) ? parsed as T[] : []; }
  catch { return []; }
};

export function EmployeeSelfServiceProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { addAudit } = useOperations();
  const [workNotes, setWorkNotes] = useState<DailyWorkNote[]>([]);
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => { queueMicrotask(() => { setWorkNotes(readArray<DailyWorkNote>(EMPLOYEE_SELF_SERVICE_KEYS.workNotes)); setRequests(readArray<EmployeeRequest>(EMPLOYEE_SELF_SERVICE_KEYS.requests)); setReady(true); }); }, []);
  useEffect(() => { if (ready) localStorage.setItem(EMPLOYEE_SELF_SERVICE_KEYS.workNotes, JSON.stringify(workNotes)); }, [ready, workNotes]);
  useEffect(() => { if (ready) localStorage.setItem(EMPLOYEE_SELF_SERVICE_KEYS.requests, JSON.stringify(requests)); }, [ready, requests]);

  const owns = useCallback((employeeId: string) => currentUser?.role === "employee" && currentUser.employeeId === employeeId, [currentUser]);
  const saveWorkNote = useCallback((employeeId: string, date: string, rawNote: string) => {
    const note = rawNote.trim().slice(0, 500); if (!owns(employeeId) || !date || !note) return false;
    const now = new Date().toISOString();
    setWorkNotes((items) => { const existing = items.find((item) => item.employeeId === employeeId && item.date === date); return existing ? items.map((item) => item.id === existing.id ? { ...item, note, updatedAt: now } : item) : [{ id: crypto.randomUUID(), employeeId, date, note, createdAt: now, updatedAt: now }, ...items]; });
    return true;
  }, [owns]);
  const submitRequest = useCallback((input: RequestInput) => {
    const details = input.details.trim().slice(0, 500); if (!owns(input.employeeId) || !input.requestType || !input.date || !details) return false;
    const now = new Date().toISOString(); setRequests((items) => [{ ...input, details, id: crypto.randomUUID(), status: "Pending", createdAt: now, updatedAt: now }, ...items]); return true;
  }, [owns]);
  const reviewRequest = useCallback((id: string, status: "Approved" | "Rejected" | "Resolved") => {
    if (currentUser?.role !== "admin" && currentUser?.role !== "hr") return false;
    const item = requests.find((entry) => entry.id === id); if (!item || item.status !== "Pending" || (item.kind === "issue" ? status !== "Resolved" : status === "Resolved")) return false;
    const now = new Date().toISOString(); setRequests((items) => items.map((entry) => entry.id === id ? { ...entry, status, updatedAt: now } : entry));
    addAudit(status.toLowerCase(), "employee request", `${item.employeeId}:${item.id}`, `Your ${item.requestType} ${item.kind === "issue" ? "issue was marked resolved" : `request was ${status.toLowerCase()}`}.`);
    return true;
  }, [currentUser, requests, addAudit]);

  const visibleNotes = useMemo(() => currentUser?.role === "employee" ? workNotes.filter((item) => item.employeeId === currentUser.employeeId) : workNotes, [currentUser, workNotes]);
  const visibleRequests = useMemo(() => currentUser?.role === "employee" ? requests.filter((item) => item.employeeId === currentUser.employeeId) : requests, [currentUser, requests]);
  const value = useMemo<Value>(() => ({ workNotes: visibleNotes, requests: visibleRequests, saveWorkNote, submitRequest, reviewRequest }), [visibleNotes, visibleRequests, saveWorkNote, submitRequest, reviewRequest]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useEmployeeSelfService() { const value = useContext(Context); if (!value) throw new Error("useEmployeeSelfService must be used within EmployeeSelfServiceProvider"); return value; }
