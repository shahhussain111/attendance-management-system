"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import {
  canAccessRoute,
  canDeleteEmployees,
  canManageAttendance,
  canManageEmployees,
  canManageHolidays,
  canManageLeave,
  canManageShifts,
  createDemoSession,
  DEMO_SESSION_KEY,
  demoUsers,
  verifyDemoPassword,
  type DemoSessionUser,
} from "@/lib/auth";
import { resolveAuthenticatedUser } from "@/lib/supabase/auth-profile";
import { createClient } from "@/lib/supabase/client";
import { getSupabasePublicConfig, isSupabaseAuthEnabled } from "@/lib/supabase/config";

type AuthResult = { ok: boolean; message: string };
type AuthContextValue = {
  currentUser: DemoSessionUser | null;
  role: DemoSessionUser["role"] | null;
  authMode: "demo" | "supabase";
  isAuthenticated: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  canAccessRoute: (path: string) => boolean;
  canManageEmployees: boolean;
  canDeleteEmployees: boolean;
  canManageAttendance: boolean;
  canManageLeave: boolean;
  canManageShifts: boolean;
  canManageHolidays: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authMode = isSupabaseAuthEnabled() ? "supabase" : "demo";
  const [currentUser, setCurrentUser] = useState<DemoSessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (authMode === "demo") {
      queueMicrotask(() => {
        try {
          const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as { id?: string };
            const found = demoUsers.find((user) => user.id === parsed.id);
            if (found) setCurrentUser(createDemoSession(found));
          }
        } catch {
          // Ignore invalid practice sessions.
        }
        setReady(true);
      });
      return;
    }

    let active = true;
    const supabase = createClient();
    const { organizationId } = getSupabasePublicConfig();

    const refreshUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data.user) {
        setCurrentUser(null);
        setReady(true);
        return;
      }

      try {
        const user = await resolveAuthenticatedUser(supabase, data.user, organizationId);
        if (active) setCurrentUser(user);
      } catch {
        if (active) setCurrentUser(null);
      } finally {
        if (active) setReady(true);
      }
    };

    void refreshUser();
    const { data } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        setReady(true);
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        setTimeout(() => void refreshUser(), 0);
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [authMode]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (authMode === "demo") {
      const found = demoUsers.find(
        (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (!found || !(await verifyDemoPassword(found, password))) {
        return { ok: false, message: "Invalid demo email or password." };
      }

      const session = createDemoSession(found);
      setCurrentUser(session);
      window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
      return { ok: true, message: "Signed in." };
    }

    try {
      const supabase = createClient();
      const { organizationId } = getSupabasePublicConfig();
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.user) return { ok: false, message: "Invalid email or password." };

      try {
        const user = await resolveAuthenticatedUser(supabase, data.user, organizationId);
        setCurrentUser(user);
        return { ok: true, message: "Signed in." };
      } catch {
        await supabase.auth.signOut();
        return { ok: false, message: "This account is not assigned to the Northstar organization." };
      }
    } catch {
      return { ok: false, message: "Supabase Auth is not configured correctly." };
    }
  }, [authMode]);

  const logout = useCallback(async () => {
    if (authMode === "supabase") {
      try {
        await createClient().auth.signOut();
      } finally {
        setCurrentUser(null);
      }
      return;
    }

    window.localStorage.removeItem(DEMO_SESSION_KEY);
    setCurrentUser(null);
  }, [authMode]);

  const value = useMemo<AuthContextValue>(() => ({
    currentUser,
    role: currentUser?.role || null,
    authMode,
    isAuthenticated: !!currentUser,
    ready,
    login,
    logout,
    canAccessRoute: (path) => !!currentUser && canAccessRoute(currentUser.role, path),
    canManageEmployees: !!currentUser && canManageEmployees(currentUser.role),
    canDeleteEmployees: !!currentUser && canDeleteEmployees(currentUser.role),
    canManageAttendance: !!currentUser && canManageAttendance(currentUser.role),
    canManageLeave: !!currentUser && canManageLeave(currentUser.role),
    canManageShifts: !!currentUser && canManageShifts(currentUser.role),
    canManageHolidays: !!currentUser && canManageHolidays(currentUser.role),
  }), [authMode, currentUser, ready, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
