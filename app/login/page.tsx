"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = auth.login(email, password);
    if (!result.ok) return setError("Invalid email or password.");
    router.replace("/");
  }

  return <main className="min-h-dvh bg-slate-950 px-4 py-10">
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl lg:grid-cols-[1.05fr_.95fr]">
      <section className="bg-blue-600 p-8 text-white sm:p-12">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-extrabold text-blue-600">N</span>
        <p className="mt-10 text-sm font-semibold uppercase tracking-[.18em] text-blue-100">Northstar People Operations</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Workforce management, clearly connected.</h1>
        <p className="mt-4 max-w-md text-blue-100">Manage attendance, schedules, leave, and workforce operations from one secure workspace.</p>
        <div className="mt-10 rounded-xl border border-white/20 bg-white/10 p-4 text-sm">
          <b>One workspace for your working day</b>
          <p className="mt-1 text-blue-100">Stay aligned with your team, time, and people operations.</p>
        </div>
      </section>
      <section className="flex flex-col justify-center p-8 sm:p-12">
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-500">Sign in to your Northstar workspace.</p>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          <label className="form-field"><span>Email</span><input autoComplete="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} required /></label>
          <label className="form-field"><span>Password</span><input autoComplete="current-password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} required /></label>
          {error && <div className="notice notice-error" role="alert">{error}</div>}
          <button className="btn-primary w-full" type="submit">Sign in</button>
        </form>
      </section>
    </div>
  </main>;
}
