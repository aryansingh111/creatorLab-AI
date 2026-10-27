"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { canMoveSubmission } from "@/lib/status";
import { z } from "zod";
import { uid } from "@/lib/store";
import type { Submission } from "@/lib/types";
import Stepper, { type Step } from "@/components/Stepper";
import { Button, Card, Empty, Field, StatusBadge, inputCls } from "@/components/ui";

export default function Trainer() {
  const { db, ready, role, update, notify } = useStore();
  const [ch, setCh] = useState({ title: "", description: "", days: "7", rubric: "Audience and objective:25\nQuality and originality:25\nAnalytics and interpretation:30\nReflection:20" }); const [cerr, setCerr] = useState("");
  const [step, setStep] = useState(0); const [openId, setOpenId] = useState(""); const [scores, setScores] = useState<Record<string, number>>({}); const [fb, setFb] = useState(""); const [err, setErr] = useState("");
  if (!ready) return <p role="status" className="text-muted">Loading…</p>;
  // NOTE: demo-only gate. In production this check must be enforced server-side (RLS + route handlers).
  if (role !== "trainer") return <Card><h1 className="font-semibold">Trainer area</h1><p className="mt-1 text-sm text-muted">Switch “Role” (top bar) to Trainer to review submissions. In a production build this is enforced server-side, not by hiding UI.</p></Card>;

  const queue = db.submissions.filter((s) => s.status !== "draft");
  const sel = queue.find((s) => s.id === openId); const project = sel && db.projects.find((p) => p.id === sel.projectId);
  const rubric = db.challenges.find((c) => c.id === project?.challengeId)?.rubric ?? [];
  const patch = (s: Submission, p: Partial<Submission>) => update((d) => ({ ...d, submissions: d.submissions.map((x) => (x.id === s.id ? { ...x, ...p } : x)) }));
  const open = (s: Submission) => { setOpenId(s.id); setScores(s.review?.scores ?? {}); setFb(s.review?.feedback ?? ""); setErr(""); if (s.status === "submitted" && canMoveSubmission("submitted", "in_review")) patch(s, { status: "in_review" }); };
  const finish = (to: "accepted" | "changes_requested") => {
    if (!sel) return; if (fb.trim().length < 10) return setErr("Feedback needs at least 10 characters.");
    for (const r of rubric) { const v = scores[r.key]; if (v === undefined || v < 0 || v > r.max) return setErr(`Score for "${r.label}" must be 0–${r.max}.`); }
    if (!canMoveSubmission("in_review", to)) return setErr("Submission must be in review first.");
    patch(sel, { status: to, review: { scores, feedback: fb.trim(), reviewedAt: new Date().toISOString().slice(0, 10) } }); setErr(""); notify("Review saved");
  };
  function createChallenge() {
    const rubric = ch.rubric.split("\n").map((l) => l.trim()).filter(Boolean).map((l, i) => { const [label, max] = l.split(":"); return { key: `r${i}`, label: label.trim(), max: Number(max) }; });
    const r = z.object({ title: z.string().trim().min(3, "Title needs 3+ characters"), description: z.string().trim().min(10, "Description needs 10+ characters"), days: z.coerce.number().int().min(1, "Days must be 1–60").max(60, "Days must be 1–60"), rubric: z.array(z.object({ label: z.string().min(1), max: z.number().int().min(1).max(100) })).min(1, "Add rubric lines as Label:points").refine((a) => a.reduce((s, x) => s + x.max, 0) === 100, "Rubric points must total 100") }).safeParse({ ...ch, rubric });
    if (!r.success) return setCerr(r.error.issues[0].message);
    setCerr(""); update((d) => ({ ...d, challenges: [...d.challenges, { id: uid(), title: r.data.title, description: r.data.description, difficulty: "Beginner", days: r.data.days, outcomes: ["Defined by trainer"], deliverables: ["Project summary", "Metrics evidence"], rubric }] }));
    setCh({ ...ch, title: "", description: "" }); notify("Challenge created");
  }
  const total = rubric.reduce((a, r) => a + r.max, 0); const scored = rubric.length > 0 && rubric.every((r) => scores[r.key] !== undefined && scores[r.key] >= 0 && scores[r.key] <= r.max);
  const steps: Step[] = [{ id: "pick", label: "Choose", done: !!sel }, { id: "score", label: "Score", done: scored }, { id: "decide", label: "Decide", done: sel?.status === "accepted" || sel?.status === "changes_requested" }];
  const go = (n: number) => { setStep(n); setErr(""); };
  const copy = [["Choose a submission", "Open the work you want to review."], ["Score the rubric", "Enter points for each criterion. Scores are yours — nothing is graded by AI."], ["Give feedback and decide", "Write constructive feedback, then accept or request changes."]];
  return (
    <>
      <div className="mx-auto max-w-3xl">
        <Card className="mb-6 px-4 py-5 sm:px-8"><Stepper steps={steps} current={step} onSelect={go} maxReachable={sel ? 2 : 0} /></Card>
        <p className="text-sm font-medium text-brand">Step {step + 1} of 3</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{copy[step][0]}</h1><p className="mb-6 mt-1 text-muted">{copy[step][1]}</p>

        {step === 0 && (queue.length === 0 ? <Empty title="No submissions yet" hint="Submit the student project first (switch Role to Student)." /> :
          <ul className="space-y-3">{queue.map((s) => <li key={s.id}><button onClick={() => { open(s); go(1); }} className="card-hover flex w-full items-center justify-between rounded-2xl border border-line bg-white p-4 text-left"><span><span className="font-medium">{db.projects.find((p) => p.id === s.projectId)?.name}</span><span className="block text-xs text-muted">Submitted {s.submittedAt}</span></span><StatusBadge s={s.status} /></button></li>)}</ul>)}

        {step === 1 && sel && <Card>
          <p className="whitespace-pre-wrap text-sm">{sel.summary}</p>
          <a href={sel.evidenceUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block break-all text-sm text-brand underline">{sel.evidenceUrl}</a>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">{rubric.map((r) => <Field key={r.key} label={`${r.label} (max ${r.max})`}><input type="number" min={0} max={r.max} className={inputCls} value={scores[r.key] ?? ""} onChange={(e) => setScores({ ...scores, [r.key]: Number(e.target.value) })} /></Field>)}</div>
          <p className="mt-4 text-lg font-semibold">Total: {Object.values(scores).reduce((a, b) => a + (b || 0), 0)} / {total}</p></Card>}

        {step === 2 && sel && <Card>
          <Field label="Constructive feedback"><textarea rows={5} className={inputCls} value={fb} onChange={(e) => setFb(e.target.value)} /></Field>
          {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
          <div className="mt-4 flex gap-2"><Button disabled={sel.status !== "in_review"} onClick={() => finish("accepted")}>Accept</Button><Button variant="ghost" disabled={sel.status !== "in_review"} onClick={() => finish("changes_requested")}>Request changes</Button></div>
          {sel.review && <p className="mt-3 text-xs text-muted">Last reviewed {sel.review.reviewedAt} · status {sel.status.replace("_", " ")}</p>}</Card>}

        <div className="mt-8 flex justify-between border-t border-line pt-5">
          <Button variant="ghost" disabled={step === 0} onClick={() => go(step - 1)}>← Back</Button>
          {step < 2 && <Button disabled={step === 0 ? !sel : !scored} onClick={() => go(step + 1)}>Continue →</Button>}
        </div>
      </div>

      <Card className="mt-6">
        <h2 className="font-semibold">Create a challenge</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Title"><input className={inputCls} value={ch.title} onChange={(e) => setCh({ ...ch, title: e.target.value })} /></Field>
          <Field label="Duration (days)"><input inputMode="numeric" className={inputCls} value={ch.days} onChange={(e) => setCh({ ...ch, days: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field label="Description"><textarea rows={2} className={inputCls} value={ch.description} onChange={(e) => setCh({ ...ch, description: e.target.value })} /></Field></div>
          <div className="sm:col-span-2"><Field label="Rubric — one “Label:points” per line, total 100"><textarea rows={4} className={inputCls} value={ch.rubric} onChange={(e) => setCh({ ...ch, rubric: e.target.value })} /></Field></div>
        </div>
        {cerr && <p role="alert" className="mt-2 text-sm text-red-700">{cerr}</p>}
        <Button className="mt-3" onClick={createChallenge}>Create challenge</Button>
      </Card>
    </>
  );
}
