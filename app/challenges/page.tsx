"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, PageHead } from "@/components/ui";

export default function Challenges() {
  const { db } = useStore();
  return (
    <>
      <PageHead title="Challenges" sub="Seeded sample challenges plus any created in the Trainer area." />
      <div className="grid gap-4 md:grid-cols-2">
        {db.challenges.map((c) => (
          <Card key={c.id} className="card-hover">
            <div className="flex items-center gap-2 text-xs"><span className="rounded-full bg-brand-soft px-2 py-0.5 font-medium text-brand">{c.difficulty}</span><span className="text-muted">{c.days} days</span></div>
            <h2 className="mt-2 font-semibold">{c.title}</h2><p className="mt-1 text-sm text-muted">{c.description}</p>
            <Link href={`/challenges/${c.id}`} className="mt-3 inline-block text-sm text-brand underline">View brief</Link>
          </Card>
        ))}
      </div>
    </>
  );
}
