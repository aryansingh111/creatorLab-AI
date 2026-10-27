"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { forProject, totals } from "@/lib/metrics";
import ProjectPicker from "@/components/ProjectPicker";
import { Card, DemoBadge, Empty, PageHead, Progress, Stat, StatusBadge } from "@/components/ui";

export default function Dashboard() {
  const { db, ready, projectId } = useStore();
  if (!ready) return <p role="status" className="text-muted">Loading…</p>;
  const p = db.projects.find((x) => x.id === projectId);
  if (!p) return <Empty title="No projects yet" hint="Start your journey to create your first project." />;
  const content = db.content.filter((c) => c.projectId === p.id);
  const metrics = forProject(db.metrics, p.id); const t = totals(metrics); const sub = db.submissions.find((s) => s.projectId === p.id);
  const published = content.filter((c) => c.status === "published" || c.publishedAt).length;
  const steps = [["Set audience and goal", !!p.audience && !!p.goal], ["Draft at least 5 items", content.length >= 5], ["Publish 3+ posts", published >= 3], ["Add metrics", metrics.length > 0], ["Submit summary", !!sub && sub.status !== "draft"]] as const;
  const upcoming = content.filter((c) => c.status !== "published" && c.scheduledFor).sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!));
  return (
    <>
      <PageHead title="Dashboard" sub={p.name} right={<div className="flex items-center gap-3"><ProjectPicker />{metrics.some((m) => m.source === "Demo data") && <DemoBadge />}</div>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Posts published" value={published} />
        <Stat label="Engagements" value={t.engagements.toLocaleString()} />
        <Stat label="Engagement rate" value={t.engagementRate === null ? "n/a" : t.engagementRate + "%"} note="Engagements / reach" />
        <Stat label="Click-through rate" value={t.ctr === null ? "n/a" : t.ctr + "%"} note="Clicks / impressions" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card><h2 className="font-semibold">Progress checklist</h2><div className="mt-3 flex items-center gap-3 text-xs text-muted"><Progress value={Math.round((steps.filter((x) => x[1]).length / steps.length) * 100)} />{steps.filter((x) => x[1]).length}/{steps.length}</div><ul className="mt-4 space-y-2 text-sm">{steps.map(([l, ok]) => <li key={l}><span aria-hidden>{ok ? "✅" : "⬜"}</span> <span className="sr-only">{ok ? "Done: " : "To do: "}</span>{l}</li>)}</ul></Card>
        <Card><h2 className="font-semibold">Upcoming content</h2>
          {upcoming.length === 0 ? <p className="mt-3 text-sm text-muted">Nothing scheduled.</p> : <ul className="mt-3 space-y-2 text-sm">{upcoming.map((c) => <li key={c.id} className="flex justify-between gap-2"><span>{c.title}</span><span className="flex items-center gap-2 text-muted">{c.scheduledFor}<StatusBadge s={c.status} /></span></li>)}</ul>}
        </Card>
        <Card><h2 className="font-semibold">Recent feedback</h2>
          {sub?.review ? <><p className="mt-3 text-sm">{sub.review.feedback}</p><p className="mt-1 text-xs text-muted">Reviewed {sub.review.reviewedAt}</p></> : <p className="mt-3 text-sm text-muted">No feedback yet. Submit your project to get a rubric review.</p>}
        </Card>
      </div>
      <Link href="/journey" className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark">Continue your journey →</Link>
    </>
  );
}
