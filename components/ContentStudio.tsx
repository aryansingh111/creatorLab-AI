"use client";
import { useState } from "react";
import { z } from "zod";
import { useStore, uid } from "@/lib/store";
import { canMoveContent } from "@/lib/status";
import { CONTENT_TYPES, PLATFORMS, STATUSES, type ContentItem, type Project, type Status } from "@/lib/types";
import { Button, Card, DemoBadge, Empty, Field, StatusBadge, inputCls } from "./ui";

const ItemForm = z.object({ title: z.string().trim().min(1, "Title is required").max(120), body: z.string().max(2000), scheduledFor: z.string().optional() });

export default function ContentStudio({ project }: { project: Project }) {
  const { db, update, notify } = useStore();
  const [kind, setKind] = useState("hook"); const [topic, setTopic] = useState(""); const [busy, setBusy] = useState(false);
  const [gen, setGen] = useState<{ mode: string; message?: string } | null>(null);
  const [editing, setEditing] = useState<ContentItem | null>(null); const [err, setErr] = useState("");
  const [fStatus, setFStatus] = useState(""); const [fPlat, setFPlat] = useState("");

  const items = db.content.filter((c) => c.projectId === project.id && (!fStatus || c.status === fStatus) && (!fPlat || c.platform === fPlat));
  const platform = project.platforms[0] || "Instagram";

  async function generate() {
    setBusy(true); setGen(null);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, niche: project.niche || "personal finance", audience: project.audience || "young professionals", platform, tone: project.tone || "Friendly", topic: topic || undefined }) });
      const data = await res.json(); setGen({ mode: data.mode, message: data.message });
      if (data.draft) setEditing({ id: "", projectId: project.id, title: data.draft.title, body: data.draft.body, type: kind, platform, status: "draft" });
    } catch { setGen({ mode: "unavailable", message: "Could not reach the server." }); }
    setBusy(false);
  }
  function save() {
    if (!editing) return;
    const r = ItemForm.safeParse(editing); if (!r.success) return setErr(r.error.issues[0].message);
    setErr("");
    update((d) => ({ ...d, content: editing.id ? d.content.map((c) => (c.id === editing.id ? { ...editing } : c)) : [...d.content, { ...editing, id: uid(), demo: false }] }));
    notify("Draft saved"); setEditing(null); setGen(null);
  }
  function setStatus(c: ContentItem, to: Status) {
    if (!canMoveContent(c.status, to)) return notify(`Can't move from ${c.status} to ${to}`);
    update((d) => ({ ...d, content: d.content.map((x) => (x.id === c.id ? { ...x, status: to, publishedAt: to === "published" ? new Date().toISOString().slice(0, 10) : x.publishedAt } : x)) }));
  }
  const del = (c: ContentItem) => { if (confirm(`Delete "${c.title}"?`)) { update((d) => ({ ...d, content: d.content.filter((x) => x.id !== c.id) })); notify("Deleted"); } };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-semibold">AI content studio</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <Field label="Type"><select className={inputCls} value={kind} onChange={(e) => setKind(e.target.value)}>{["idea", "hook", "caption", "script", "cta"].map((k) => <option key={k}>{k}</option>)}</select></Field>
          <div className="min-w-48 flex-1"><Field label="Topic (optional)"><input className={inputCls} value={topic} maxLength={200} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. emergency fund" /></Field></div>
          <Button onClick={generate} disabled={busy}>{busy ? "Generating…" : "Generate draft"}</Button>
        </div>
        {gen && <p role="status" className={`mt-3 rounded-lg px-3 py-2 text-sm ${gen.mode === "unavailable" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-900"}`}><b>{gen.mode === "demo" ? "Demo mode" : gen.mode === "live" ? "Live AI" : "Unavailable"}:</b> {gen.message}</p>}
        <p className="mt-3 text-xs text-muted">AI output is a draft, not verified truth. Review and fact-check every claim before saving or publishing.</p>
      </Card>

      {editing && (
        <Card>
          <h2 className="font-semibold">{editing.id ? "Edit content" : "Review & save draft"}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Title"><input className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <Field label="Platform"><select className={inputCls} value={editing.platform} onChange={(e) => setEditing({ ...editing, platform: e.target.value })}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select></Field>
            <Field label="Format"><select className={inputCls} value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>{CONTENT_TYPES.map((p) => <option key={p}>{p}</option>)}</select></Field>
            <Field label="Scheduled for"><input type="date" className={inputCls} value={editing.scheduledFor ?? ""} onChange={(e) => setEditing({ ...editing, scheduledFor: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Body"><textarea rows={6} className={inputCls} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></Field></div>
          </div>
          {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
          <p className="mt-2 text-xs text-muted">Human review reminder: check facts, figures, and tone before marking ready.</p>
          <div className="mt-3 flex gap-2"><Button onClick={save}>Save draft</Button><Button variant="ghost" onClick={() => { setEditing(null); setErr(""); }}>Cancel</Button></div>
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Content ({items.length})</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <select aria-label="Filter by status" className={inputCls + " !w-auto"} value={fStatus} onChange={(e) => setFStatus(e.target.value)}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            <select aria-label="Filter by platform" className={inputCls + " !w-auto"} value={fPlat} onChange={(e) => setFPlat(e.target.value)}><option value="">All platforms</option>{PLATFORMS.map((s) => <option key={s}>{s}</option>)}</select>
            <Button variant="ghost" onClick={() => setEditing({ id: "", projectId: project.id, title: "", body: "", type: "idea", platform, status: "idea" })}>+ New item</Button>
          </div>
        </div>
        {items.length === 0 ? <div className="mt-4"><Empty title="No content matches" hint="Generate a draft above or add a new item." /></div> : (
          <ul className="mt-4 divide-y divide-line">
            {items.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0"><p className="font-medium">{c.title} {c.demo && <DemoBadge />}</p><p className="text-xs text-muted">{c.type} · {c.platform}{c.scheduledFor ? ` · ${c.scheduledFor}` : ""}</p></div>
                <div className="flex items-center gap-2">
                  <StatusBadge s={c.status} />
                  <select aria-label={`Status for ${c.title}`} className={inputCls + " !w-auto"} value={c.status} onChange={(e) => setStatus(c, e.target.value as Status)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                  <Button variant="ghost" onClick={() => setEditing(c)}>Edit</Button><Button variant="danger" onClick={() => del(c)}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
