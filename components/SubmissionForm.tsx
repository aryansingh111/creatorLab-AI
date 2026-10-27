"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useStore } from "@/lib/store";
import { canMoveSubmission } from "@/lib/status";
import type { Project } from "@/lib/types";
import { Button, Card, Field, StatusBadge, inputCls } from "./ui";

const SubForm = z.object({ summary: z.string().trim().min(20, "Summary needs at least 20 characters"), evidenceUrl: z.string().url("Enter a valid https:// link").refine((u) => u.startsWith("https://"), "Link must start with https://") });

export default function SubmissionForm({ project }: { project: Project }) {
  const { db, update, notify } = useStore();
  const sub = db.submissions.find((s) => s.projectId === project.id); const challenge = db.challenges.find((c) => c.id === project.challengeId);
  const [sum, setSum] = useState(""); const [url, setUrl] = useState(""); const [err, setErr] = useState("");
  useEffect(() => { if (sub) { setSum(sub.summary); setUrl(sub.evidenceUrl); } }, [sub?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  function submit() {
    const r = SubForm.safeParse({ summary: sum, evidenceUrl: url }); if (!r.success) return setErr(r.error.issues[0].message);
    if (!sub || !(sub.status === "draft" || canMoveSubmission(sub.status, "submitted"))) return setErr("This submission can't be resubmitted right now.");
    setErr(""); update((d) => ({ ...d, submissions: d.submissions.map((s) => (s.id === sub.id ? { ...s, summary: sum, evidenceUrl: url, status: "submitted", submittedAt: new Date().toISOString().slice(0, 10) } : s)) })); notify("Submitted for review");
  }
  const locked = !!sub && ["submitted", "in_review", "accepted"].includes(sub.status);
  return (
    <Card>
      <div className="flex items-center gap-2"><h3 className="font-semibold">Your submission</h3>{sub && <StatusBadge s={sub.status} />}</div>
      {sub?.review && <div className="mt-3 rounded-lg bg-brand-soft p-3 text-sm"><p className="font-medium">Trainer feedback — {Object.values(sub.review.scores).reduce((a, b) => a + b, 0)} / {challenge?.rubric.reduce((a, r) => a + r.max, 0)}</p><p className="mt-1">{sub.review.feedback}</p></div>}
      <div className="mt-4 grid gap-4">
        <Field label="What did you do and learn? (summary)"><textarea rows={4} disabled={locked} className={inputCls} value={sum} onChange={(e) => setSum(e.target.value)} /></Field>
        <Field label="Link to your evidence (https://)"><input disabled={locked} className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></Field>
      </div>
      {err && <p role="alert" className="mt-3 text-sm text-red-700">{err}</p>}
      <Button className="mt-4" disabled={locked} onClick={submit}>{sub?.status === "changes_requested" ? "Resubmit" : "Submit for review"}</Button>
    </Card>
  );
}
