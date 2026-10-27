"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import ProjectPicker from "./ProjectPicker";
import { PLATFORMS } from "@/lib/types";
import { Card, DemoBadge, Empty, PageHead, StatusBadge, inputCls } from "./ui";

export default function CalendarView({ embedded = false }: { embedded?: boolean }) {
  const { db, ready, projectId } = useStore(); const [view, setView] = useState<"list" | "month">("list"); const [plat, setPlat] = useState("");
  if (!ready) return <p role="status" className="text-muted">Loading…</p>;
  const items = db.content.filter((c) => c.projectId === projectId && c.scheduledFor && (!plat || c.platform === plat)).sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!));
  const first = items[0]?.scheduledFor ?? "2026-11-01"; const [y, m] = first.split("-").map(Number);
  const days = new Date(y, m, 0).getDate(); const lead = new Date(y, m - 1, 1).getDay();
  return (
    <>
      <PageHead title={embedded ? "" : "Content calendar"} right={<div className="flex flex-wrap items-center gap-2"><ProjectPicker />
        <select aria-label="Filter by platform" className={inputCls + " !w-auto"} value={plat} onChange={(e) => setPlat(e.target.value)}><option value="">All platforms</option>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select>
        <select aria-label="View" className={inputCls + " !w-auto"} value={view} onChange={(e) => setView(e.target.value as "list" | "month")}><option value="list">List</option><option value="month">Month</option></select></div>} />
      {items.length === 0 ? <Empty title="Nothing scheduled" hint="Set a scheduled date on a content item in your project." /> : view === "list" ? (
        <Card><ul className="divide-y divide-line">{items.map((c) => <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3"><div><p className="font-medium">{c.title} {c.demo && <DemoBadge />}</p><p className="text-xs text-muted">{c.scheduledFor} · {c.platform} · {c.type}</p></div><StatusBadge s={c.status} /></li>)}</ul></Card>
      ) : (
        <div className="grid grid-cols-7 gap-1 text-xs">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="p-1 font-medium text-muted">{d}</div>)}
          {Array.from({ length: lead }, (_, i) => <div key={"l" + i} />)}
          {Array.from({ length: days }, (_, i) => {
            const date = `${y}-${String(m).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`; const day = items.filter((c) => c.scheduledFor === date);
            return <div key={date} className="min-h-20 rounded-lg border border-line bg-white p-1"><p className="text-muted">{i + 1}</p>{day.map((c) => <p key={c.id} className="mt-0.5 truncate rounded bg-cream px-1" title={`${c.title} (${c.status})`}>{c.title}</p>)}</div>;
          })}
        </div>
      )}
    </>
  );
}
