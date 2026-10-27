"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AnalyticsView from "@/components/AnalyticsView";
import CalendarView from "@/components/CalendarView";
import ContentStudio from "@/components/ContentStudio";
import ProjectSettings, { projectReady } from "@/components/ProjectSettings";
import Stepper, { type Step } from "@/components/Stepper";
import SubmissionForm from "@/components/SubmissionForm";
import { Button, Card, StatusBadge } from "@/components/ui";
import { forProject } from "@/lib/metrics";
import { uid, useStore } from "@/lib/store";

const COPY = [
  ["Choose a challenge", "Pick what you want to work on. Read the brief first if you like."],
  ["Set up your project", "Tell us who you are creating for and what you want to achieve."],
  ["Create your content", "Generate a draft with AI, edit it, then save it. Always check the facts before posting."],
  ["Plan your calendar", "See what goes out and when. To change a date, edit the item in the previous step."],
  ["Add your results", "After posting, import a CSV or type in the numbers. All rates are calculated from your data."],
  ["Submit your work", "Write a short summary and link to your evidence."],
  ["Feedback and report", "See your trainer's review and print a report of your project."],
] as const;
const KEY = "creatorlab-journey-step";

export default function Journey() {
  const { db, ready, projectId, setProjectId, update, notify } = useStore();
  const [step, setStep] = useState(0);
  useEffect(() => { try { const n = Number(localStorage.getItem(KEY)); if (n >= 0 && n < COPY.length) setStep(n); } catch {} }, []);
  const go = (n: number) => { setStep(n); try { localStorage.setItem(KEY, String(n)); } catch {} window.scrollTo({ top: 0 }); };

  const project = db.projects.find((p) => p.id === projectId);
  const content = project ? db.content.filter((c) => c.projectId === project.id) : [];
  const metrics = project ? forProject(db.metrics, project.id) : [];
  const sub = project ? db.submissions.find((s) => s.projectId === project.id) : undefined;
  const done = [!!project, !!project && projectReady(project), content.length > 0, content.some((c) => c.scheduledFor), metrics.length > 0, !!sub && sub.status !== "draft", !!sub?.review];
  const steps: Step[] = COPY.map(([title], i) => ({ id: String(i), label: ["Choose", "Set up", "Create", "Plan", "Results", "Submit", "Feedback"][i], done: done[i] }));
  const maxReachable = !done[0] ? 0 : !done[1] ? 1 : COPY.length - 1;

  function pick(challengeId: string) {
    const existing = db.projects.find((p) => p.challengeId === challengeId);
    if (existing) return setProjectId(existing.id);
    const ch = db.challenges.find((c) => c.id === challengeId)!; const pid = uid();
    update((d) => ({ ...d, projects: [...d.projects, { id: pid, challengeId, name: `${ch.title} — my project`, niche: "", audience: "", goal: "", platforms: [], tone: "Friendly", deadline: "" }], submissions: [...d.submissions, { id: uid(), projectId: pid, summary: "", evidenceUrl: "", status: "draft" }] }));
    setProjectId(pid); notify("Project created");
  }
  if (!ready) return <p role="status" className="text-muted">Loading…</p>;
  const last = step === COPY.length - 1;

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="mb-6 px-4 py-5 sm:px-8"><Stepper steps={steps} current={step} onSelect={go} maxReachable={maxReachable} /></Card>
      <p className="text-sm font-medium text-brand">Step {step + 1} of {COPY.length}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{COPY[step][0]}</h1>
      <p className="mb-6 mt-1 text-muted">{COPY[step][1]}</p>

      <div className="min-h-64">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {db.challenges.map((c) => {
              const mine = db.projects.find((p) => p.challengeId === c.id); const on = !!mine && mine.id === projectId;
              return (
                <Card key={c.id} className={`card-hover ${on ? "ring-2 ring-brand" : ""}`}>
                  <div className="flex items-center gap-2 text-xs"><span className="rounded-full bg-brand-soft px-2 py-0.5 font-medium text-brand">{c.difficulty}</span><span className="text-muted">{c.days} days</span></div>
                  <h2 className="mt-2 font-semibold">{c.title}</h2><p className="mt-1 text-sm text-muted">{c.description}</p>
                  <div className="mt-4 flex items-center gap-3"><Button variant={on ? "ghost" : "primary"} onClick={() => pick(c.id)}>{on ? "✓ Selected" : mine ? "Continue this" : "Choose"}</Button><Link href={`/challenges/${c.id}`} className="text-sm text-brand underline">Read brief</Link></div>
                </Card>
              );
            })}
          </div>
        )}
        {step === 1 && project && <ProjectSettings project={project} />}
        {step === 2 && project && <ContentStudio project={project} />}
        {step === 3 && <CalendarView embedded />}
        {step === 4 && <AnalyticsView embedded />}
        {step === 5 && project && <SubmissionForm project={project} />}
        {step === 6 && project && (
          <Card>
            <div className="flex items-center gap-2"><h2 className="font-semibold">Status</h2>{sub && <StatusBadge s={sub.status} />}</div>
            {sub?.review
              ? <div className="mt-3 rounded-lg bg-brand-soft p-4 text-sm"><p className="font-semibold">Score: {Object.values(sub.review.scores).reduce((a, b) => a + b, 0)} / {db.challenges.find((c) => c.id === project.challengeId)?.rubric.reduce((a, r) => a + r.max, 0)}</p><p className="mt-2">{sub.review.feedback}</p></div>
              : <p className="mt-3 text-sm text-muted">{sub && sub.status !== "draft" ? "Your work is waiting for a trainer. To try the reviewer side, switch “Role” in the top bar to Trainer." : "Submit your work in the previous step to receive feedback."}</p>}
            <div className="mt-4 flex flex-wrap gap-3"><Link href={`/projects/${project.id}/report`} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-dark">Open printable report</Link><Link href="/dashboard" className="rounded-lg border border-line px-4 py-2 text-sm font-medium">Go to overview</Link></div>
          </Card>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
        <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>← Back</Button>
        {!last && <div className="flex items-center gap-3">{step <= 1 && !done[step] && <span className="hidden text-xs text-muted sm:inline">{step === 0 ? "Choose a challenge to continue" : "Fill every field and save to continue"}</span>}<Button onClick={() => go(step + 1)} disabled={step + 1 > maxReachable}>Continue →</Button></div>}
      </div>
    </div>
  );
}
