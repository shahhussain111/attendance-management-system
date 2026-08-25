"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { canAccessRoute, canDeleteEmployees, canManageAttendance, canManageEmployees, canManageHolidays, canManageLeave, canManageShifts, DEMO_SESSION_KEY, demoUsers, DemoSessionUser } from "@/lib/auth";

type AuthContextValue = { currentUser: DemoSessionUser | null; role: DemoSessionUser["role"] | null; isAuthenticated: boolean; ready: boolean; login: (email: string, password: string) => { ok: boolean; message: string }; logout: () => void; canAccessRoute: (path: string) => boolean; canManageEmployees: boolean; canDeleteEmployees: boolean; canManageAttendance: boolean; canManageLeave: boolean; canManageShifts: boolean; canManageHolidays: boolean };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<DemoSessionUser | null>(null); const [ready, setReady] = useState(false);
  useEffect(() => { queueMicrotask(() => { try { const raw = window.localStorage.getItem(DEMO_SESSION_KEY); if (raw) { const parsed = JSON.parse(raw) as { id?: string }; const found = demoUsers.find((user) => user.id === parsed.id); if (found) { const { password: _, ...session } = found; void _; setCurrentUser(session); } } } catch { /* Ignore invalid practice sessions. */ } setReady(true); }); }, []);
  const login = useCallback((email: string, password: string) => { const found = demoUsers.find((user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password); if (!found) return { ok: false, message: "Invalid demo email or password. Choose one of the practice accounts below." }; const { password: _, ...session } = found; void _; setCurrentUser(session); window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session)); return { ok: true, message: "Signed in." }; }, []);
  const logout = useCallback(() => { window.localStorage.removeItem(DEMO_SESSION_KEY); setCurrentUser(null); }, []);
  const value = useMemo<AuthContextValue>(() => ({ currentUser, role: currentUser?.role || null, isAuthenticated: !!currentUser, ready, login, logout, canAccessRoute: (path) => !!currentUser && canAccessRoute(currentUser.role, path), canManageEmployees: !!currentUser && canManageEmployees(currentUser.role), canDeleteEmployees: !!currentUser && canDeleteEmployees(currentUser.role), canManageAttendance: !!currentUser && canManageAttendance(currentUser.role), canManageLeave: !!currentUser && canManageLeave(currentUser.role), canManageShifts: !!currentUser && canManageShifts(currentUser.role), canManageHolidays: !!currentUser && canManageHolidays(currentUser.role) }), [currentUser, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used within AuthProvider"); return value; }

