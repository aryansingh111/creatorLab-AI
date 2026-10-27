"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useStore } from "@/lib/store";
import { PLATFORMS, type Project } from "@/lib/types";
import { Button, Card, Field, inputCls } from "./ui";

export const ProjectForm = z.object({ name: z.string().trim().min(2, "Name is required"), niche: z.string().trim().min(2, "Niche is required"), audience: z.string().trim().min(2, "Audience is required"), goal: z.string().trim().min(2, "Goal is required"), platforms: z.array(z.string()).min(1, "Pick at least one platform") });
export const projectReady = (p: Project) => ProjectForm.safeParse(p).success;

export default function ProjectSettings({ project }: { project: Project }) {
  const { update, notify } = useStore();
  const [form, setForm] = useState<Project>(project); const [err, setErr] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => setForm(project), [project.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (p: string) => setForm({ ...form, platforms: form.platforms.includes(p) ? form.platforms.filter((x) => x !== p) : [...form.platforms, p] });
  function save() {
    if (saving) return; const r = ProjectForm.safeParse(form); if (!r.success) return setErr(r.error.issues[0].message);
    setErr(""); setSaving(true); update((d) => ({ ...d, projects: d.projects.map((p) => (p.id === form.id ? form : p)) })); notify("Project saved"); setTimeout(() => setSaving(false), 400);
  }
  return (
    <Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Project name"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Niche — what is it about?"><input className={inputCls} value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} placeholder="e.g. Personal finance" /></Field>
        <Field label="Audience — who is it for?"><input className={inputCls} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} placeholder="e.g. First-job earners, 22–28" /></Field>
        <Field label="Goal — what should happen?"><input className={inputCls} value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="e.g. 30,000 reach in 14 days" /></Field>
        <Field label="Tone"><select className={inputCls} value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}>{["Friendly", "Professional", "Playful", "Authoritative"].map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Deadline"><input type="date" className={inputCls} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
        <fieldset className="sm:col-span-2"><legend className="mb-1 text-sm font-medium">Where will you post?</legend><div className="flex flex-wrap gap-2 text-sm">{PLATFORMS.map((p) => <label key={p} className={`cursor-pointer rounded-full border px-3 py-1.5 ${form.platforms.includes(p) ? "border-brand bg-brand-soft font-medium text-brand" : "border-line"}`}><input type="checkbox" className="sr-only" checked={form.platforms.includes(p)} onChange={() => toggle(p)} />{p}</label>)}</div></fieldset>
      </div>
      {err && <p role="alert" className="mt-3 text-sm text-red-700">{err}</p>}
      <Button className="mt-4" onClick={save} disabled={saving}>Save</Button>
    </Card>
  );
}
