"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = auth.login(email, password);
    if (!result.ok) return setError("Invalid email or password.");
    router.replace("/");
  }

  return <main className="login-shell min-h-dvh px-4 py-6 sm:py-10">
    <div className="mx-auto grid min-h-[min(720px,calc(100dvh-5rem))] max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 lg:grid-cols-[1.05fr_.95fr]">
      <section className="login-brand-panel p-8 text-white sm:p-12">
        <div className="flex items-center gap-3"><span className="northstar-mark text-cyan-300">✦</span><b className="text-2xl tracking-tight">Northstar</b></div>
        <p className="mt-14 text-sm font-semibold uppercase tracking-[.18em] text-blue-200">Your workday, connected</p>
        <h1 className="mt-3 max-w-md text-4xl font-bold tracking-tight sm:text-5xl">Everything you need for the day ahead.</h1>
        <p className="mt-5 max-w-md leading-7 text-blue-100">Check in, review your schedule, manage leave, and stay current with your attendance from one secure workspace.</p>
        <div className="mt-12 rounded-xl border border-white/15 bg-white/10 p-5 text-sm backdrop-blur-sm">
          <b>Personal, clear, and always up to date</b>
          <p className="mt-1.5 text-blue-100">Northstar keeps your time, schedule, and requests together.</p>
        </div>
      </section>
      <section className="flex flex-col justify-center p-8 sm:p-12">
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-500">Sign in to your Northstar workspace.</p>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          <label className="form-field"><span>Email</span><input autoComplete="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} required /></label>
          <label className="form-field"><span>Password</span><span className="password-field"><input autoComplete="current-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} required /><button type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Hide" : "Show"}</button></span></label>
          {error && <div className="notice notice-error" role="alert">{error}</div>}
          <button className="btn-primary w-full" type="submit">Sign in</button>
        </form>
      </section>
    </div>
  </main>;
}
