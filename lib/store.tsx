"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { SEED } from "./seed";
import type { DB } from "./types";

// Temporary demo adapter: browser localStorage. Not production persistence (see README).
const KEY = "creatorlab-demo-v1";
type Role = "student" | "trainer";
interface Ctx { projectId: string; setProjectId: (id: string) => void; db: DB; ready: boolean; role: Role; setRole: (r: Role) => void; update: (fn: (d: DB) => DB) => void; reset: () => void; toast: string; notify: (m: string) => void }
const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(SEED);
  const [ready, setReady] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [role, setRoleState] = useState<Role>("student");
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const d = JSON.parse(raw); setDb({ ...SEED, ...d, metrics: (d.metrics ?? []).map((m: DB["metrics"][number]) => ({ ...m, projectId: m.projectId ?? d.projects?.[0]?.id })) }); }
      if (localStorage.getItem(KEY + "-role") === "trainer") setRoleState("trainer");
    } catch {}
    setReady(true);
  }, []);
  const persist = (d: DB) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} };
  const update = useCallback((fn: (d: DB) => DB) => setDb((d) => { const n = fn(d); persist(n); return n; }), []);
  const reset = useCallback(() => { setDb(SEED); persist(SEED); }, []);
  const setRole = (r: Role) => { setRoleState(r); try { localStorage.setItem(KEY + "-role", r); } catch {} };
  const notify = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); }, []);
  return <C.Provider value={{ projectId: projectId && db.projects.some((p) => p.id === projectId) ? projectId : db.projects[0]?.id ?? "", setProjectId, db, ready, role, setRole, update, reset, toast, notify }}>{children}</C.Provider>;
}
export const useStore = () => { const c = useContext(C); if (!c) throw new Error("StoreProvider missing"); return c; };
export const uid = () => Math.random().toString(36).slice(2, 10);
