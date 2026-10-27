"use client";
import { useParams, useRouter } from "next/navigation";
import { useStore, uid } from "@/lib/store";
import { Button, Card, PageHead } from "@/components/ui";

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const { db, update, notify, setProjectId } = useStore();
  const c = db.challenges.find((x) => x.id === id);
  if (!c) return <p>Challenge not found.</p>;
  const existing = db.projects.find((p) => p.challengeId === c.id);
  const start = () => {
    if (existing) { setProjectId(existing.id); return router.push("/journey"); }
    const pid = uid();
    update((d) => ({ ...d, projects: [...d.projects, { id: pid, challengeId: c.id, name: `${c.title} — my project`, niche: "", audience: "", goal: "", platforms: [], tone: "Friendly", deadline: "" }], submissions: [...d.submissions, { id: uid(), projectId: pid, summary: "", evidenceUrl: "", status: "draft" }] }));
    setProjectId(pid); notify("Project created"); router.push("/journey");
  };
  return (
    <>
      <PageHead title={c.title} sub={`${c.difficulty} · ${c.days} days`} right={<Button onClick={start}>{existing ? "Continue this challenge" : "Start this challenge"}</Button>} />
      <p className="mb-6 max-w-2xl">{c.description}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><h2 className="font-semibold">Learning outcomes</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{c.outcomes.map((o) => <li key={o}>{o}</li>)}</ul></Card>
        <Card><h2 className="font-semibold">Deliverables</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{c.deliverables.map((o) => <li key={o}>{o}</li>)}</ul></Card>
        <Card className="md:col-span-2"><h2 className="font-semibold">Rubric ({c.rubric.reduce((a, r) => a + r.max, 0)} points)</h2>
          <table className="mt-2 w-full text-sm"><tbody>{c.rubric.map((r) => <tr key={r.key} className="border-t border-line"><td className="py-1.5">{r.label}</td><td className="py-1.5 text-right">{r.max}</td></tr>)}</tbody></table></Card>
      </div>
    </>
  );
}
