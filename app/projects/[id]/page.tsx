"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import ContentStudio from "@/components/ContentStudio";
import ProjectSettings from "@/components/ProjectSettings";
import SubmissionForm from "@/components/SubmissionForm";
import { useStore } from "@/lib/store";
import { PageHead } from "@/components/ui";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>(); const { db, ready } = useStore();
  const project = db.projects.find((p) => p.id === id);
  if (!ready) return <p role="status" className="text-muted">Loading…</p>;
  if (!project) return <p>Project not found. <Link href="/journey" className="text-brand underline">Start a journey</Link></p>;
  return (
    <>
      <PageHead title={project.name} sub={db.challenges.find((c) => c.id === project.challengeId)?.title} right={<Link href={`/projects/${project.id}/report`} className="rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-medium shadow-sm">Printable report</Link>} />
      <div className="space-y-6"><ProjectSettings project={project} /><ContentStudio project={project} /><SubmissionForm project={project} /></div>
    </>
  );
}
