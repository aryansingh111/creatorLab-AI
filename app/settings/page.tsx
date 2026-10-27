"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Card, PageHead } from "@/components/ui";

export default function Settings() {
  const { role, reset, notify } = useStore();
  const [ai, setAi] = useState<{ mode: string; model: string | null; provider?: string | null } | null>(null);
  useEffect(() => { fetch("/api/ai-status").then((r) => r.json()).then(setAi).catch(() => {}); }, []);
  return (
    <>
      <PageHead title="Settings" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card><h2 className="font-semibold">Profile</h2><p className="mt-2 text-sm">Role: <b>{role}</b> (demo switcher in the header)</p><p className="mt-1 text-xs text-muted">Real accounts need Supabase Auth; roles must never be self-assignable.</p></Card>
        <Card><h2 className="font-semibold">AI mode</h2>
          {!ai ? <p className="mt-2 text-sm text-muted">Checking…</p> : ai.mode === "live"
            ? <p className="mt-2 text-sm"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Live</span> {ai.provider === "gemini" ? "Gemini" : "Claude"} ({ai.model}), called server-side. Check your provider’s quota and billing.</p>
            : <p className="mt-2 text-sm"><span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Demo mode</span> Deterministic templates — not a live model.</p>}
          <p className="mt-2 text-xs text-muted">To go live, add GEMINI_API_KEY (or ANTHROPIC_API_KEY) to .env.local and restart. The key never reaches the browser.</p></Card>
        <Card><h2 className="font-semibold">Demo data</h2><p className="mt-1 text-sm text-muted">Stored in this browser only (localStorage).</p><Button variant="danger" className="mt-3" onClick={() => { if (confirm("Reset all demo data?")) { reset(); notify("Demo data reset"); } }}>Reset demo data</Button></Card>
      </div>
    </>
  );
}
