"use client";
import { useStore } from "@/lib/store";
import { inputCls } from "./ui";

export default function ProjectPicker() {
  const { db, projectId, setProjectId } = useStore();
  if (db.projects.length < 2) return null;
  return (
    <label className="flex items-center gap-2 text-sm text-muted">Project
      <select className={inputCls + " !w-auto text-navy"} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
        {db.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </label>
  );
}
