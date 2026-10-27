"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import Logo from "./Logo";

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const { role, setRole, toast } = useStore();
  const [ai, setAi] = useState<{ mode: string; model: string | null } | null>(null);
  useEffect(() => { fetch("/api/ai-status").then((r) => r.json()).then(setAi).catch(() => {}); }, []);
  const nav = [["/journey", "My journey"], ["/dashboard", "Overview"], ...(role === "trainer" ? [["/trainer", "Trainer"]] : []), ["/settings", "Settings"]];
  const landing = path === "/";
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-white/85 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/" aria-label="CreatorLab AI home"><Logo size={32} /></Link>
          {!landing && (
            <nav aria-label="Main" className="order-last flex w-full gap-1 overflow-x-auto text-sm sm:order-none sm:w-auto sm:flex-1">
              {nav.map(([h, l]) => { const on = path.startsWith(h); return <Link key={h} href={h} aria-current={on ? "page" : undefined} className={`whitespace-nowrap rounded-full px-4 py-1.5 font-medium transition ${on ? "bg-brand-soft text-brand" : "text-navy/70 hover:bg-cream"}`}>{l}</Link>; })}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-3 text-xs text-muted">
            {ai && <span className="hidden items-center gap-1.5 sm:flex"><span className={`h-2 w-2 rounded-full ${ai.mode === "live" ? "bg-emerald-500" : "bg-amber-500"}`} />AI {ai.mode === "live" ? "live" : "demo"}</span>}
            <label className="flex items-center gap-1.5">Role
              <select value={role} onChange={(e) => setRole(e.target.value as "student" | "trainer")} className="rounded-full border border-line bg-white px-2.5 py-1 text-sm text-navy"><option value="student">Student</option><option value="trainer">Trainer</option></select></label>
            {landing && <Link href="/journey" className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">Start</Link>}
          </div>
        </div>
      </header>
      <main className={landing ? "" : "mx-auto max-w-5xl px-4 py-8 sm:px-8"}>{children}</main>
      <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-4 left-1/2 z-30 -translate-x-1/2">
        {toast && <div className="rounded-lg bg-navy px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}
      </div>
    </div>
  );
}
