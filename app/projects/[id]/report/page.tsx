"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { conversionRate, ctr, dateRange, engagementRate, forProject, totals } from "@/lib/metrics";
import { Button, DemoBadge } from "@/components/ui";
import Logo from "@/components/Logo";

const n = (v: number | null, s = "") => (v === null ? "n/a" : v.toLocaleString() + s);

export default function Report() {
  const { id } = useParams<{ id: string }>(); const { db, ready } = useStore();
  if (!ready) return <p role="status" className="text-muted">Loading…</p>;
  const p = db.projects.find((x) => x.id === id);
  if (!p) return <p>Project not found.</p>;
  const ch = db.challenges.find((c) => c.id === p.challengeId); const content = db.content.filter((c) => c.projectId === id);
  const rows = forProject(db.metrics, id); const t = totals(rows); const range = dateRange(rows); const sub = db.submissions.find((s) => s.projectId === id);
  const max = ch?.rubric.reduce((a, r) => a + r.max, 0) ?? 100;
  return (
    <article className="mx-auto max-w-3xl space-y-6 text-sm">
      <div className="flex items-center justify-between print:hidden"><Link href={`/projects/${id}`} className="text-brand underline">← Back to project</Link><Button onClick={() => window.print()}>Print / Save as PDF</Button></div>
      <header className="flex items-center justify-between border-b border-line pb-4"><Logo /><span className="text-xs text-muted">Project report</span></header>
      <section><h1 className="text-2xl font-bold">{p.name}</h1><p className="text-muted">{ch?.title}</p>
        <dl className="mt-3 grid grid-cols-[120px_1fr] gap-y-1"><dt className="text-muted">Niche</dt><dd>{p.niche || "—"}</dd><dt className="text-muted">Audience</dt><dd>{p.audience || "—"}</dd><dt className="text-muted">Goal</dt><dd>{p.goal || "—"}</dd><dt className="text-muted">Platforms</dt><dd>{p.platforms.join(", ") || "—"}</dd><dt className="text-muted">Tone / deadline</dt><dd>{p.tone} · {p.deadline || "—"}</dd></dl></section>
      <section><h2 className="mb-2 text-lg font-semibold">Content ({content.length})</h2>
        <table className="w-full text-left"><thead className="text-xs uppercase text-muted"><tr><th>Title</th><th>Platform</th><th>Format</th><th>Status</th></tr></thead><tbody>{content.map((c) => <tr key={c.id} className="border-t border-line"><td className="py-1.5">{c.title}</td><td>{c.platform}</td><td>{c.type}</td><td>{c.status.replace("_", " ")}</td></tr>)}</tbody></table></section>
      <section><h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">Performance {rows.some((r) => r.source === "Demo data") && <DemoBadge />}</h2>
        {rows.length === 0 ? <p className="text-muted">No metrics recorded.</p> : <>
          <p className="text-xs text-muted">Source: {[...new Set(rows.map((r) => r.source))].join(" + ")} · {range?.from} to {range?.to} · {rows.length} rows. Computed in code from the stored values.</p>
          <p className="mt-2">Impressions {n(t.impressions)} · Reach {n(t.reach)} · Engagements {t.engagements.toLocaleString()} · Engagement rate {n(t.engagementRate, "%")} · CTR {n(t.ctr, "%")} · Conversion {n(t.conversionRate, "%")}</p>
          <table className="mt-2 w-full text-left"><thead className="text-xs uppercase text-muted"><tr><th>Post</th><th>Eng. rate</th><th>CTR</th><th>Conv.</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id} className="border-t border-line"><td className="py-1.5">{r.contentTitle}</td><td>{n(engagementRate(r), "%")}</td><td>{n(ctr(r), "%")}</td><td>{n(conversionRate(r), "%")}</td></tr>)}</tbody></table></>}</section>
      <section><h2 className="mb-2 text-lg font-semibold">Submission</h2>
        {sub && sub.status !== "draft" ? <><p className="whitespace-pre-wrap">{sub.summary}</p><p className="mt-1 break-all text-muted">Evidence: {sub.evidenceUrl}</p><p className="mt-1">Status: {sub.status.replace("_", " ")}</p>
          {sub.review && <p className="mt-2 rounded-lg bg-brand-soft p-3"><b>Trainer review: {Object.values(sub.review.scores).reduce((a, b) => a + b, 0)} / {max}.</b> {sub.review.feedback}</p>}</> : <p className="text-muted">Not submitted yet.</p>}</section>
      <footer className="border-t border-line pt-3 text-xs text-muted">AI-assisted drafts were reviewed and edited by the student. Generated claims require verification.</footer>
    </article>
  );
}
