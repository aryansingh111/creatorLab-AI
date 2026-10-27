"use client";
import type { ReactNode, ButtonHTMLAttributes } from "react";

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) =>
  <div className={`rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgb(16_33_58/.04)] ${className}`}>{children}</div>;

export function Button({ variant = "primary", className = "", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const v = { primary: "bg-brand text-white hover:bg-brand-dark", ghost: "border border-line bg-white text-navy hover:bg-cream", danger: "border border-red-300 text-red-700 hover:bg-red-50" }[variant];
  return <button {...p} className={`rounded-lg px-3.5 py-2 text-sm font-medium shadow-sm transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${v} ${className}`} />;
}
export const DemoBadge = ({ label = "Demo data" }: { label?: string }) =>
  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">{label}</span>;

const TONE: Record<string, string> = { idea: "bg-slate-100 text-slate-700", draft: "bg-blue-100 text-blue-800", needs_review: "bg-amber-100 text-amber-800", ready: "bg-emerald-100 text-emerald-800", published: "bg-brand text-white", submitted: "bg-blue-100 text-blue-800", in_review: "bg-amber-100 text-amber-800", changes_requested: "bg-red-100 text-red-800", accepted: "bg-brand text-white" };
export const StatusBadge = ({ s }: { s: string }) =>
  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE[s] ?? TONE.idea}`}>{s.replace("_", " ")}</span>;

export const Empty = ({ title, hint }: { title: string; hint?: string }) =>
  <div className="rounded-2xl border border-dashed border-line bg-white/60 p-10 text-center"><p aria-hidden className="mb-2 text-2xl">✦</p><p className="font-medium">{title}</p>{hint && <p className="mt-1 text-sm text-muted">{hint}</p>}</div>;

export const PageHead = ({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) =>
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">{title ? <div><h1 className="text-3xl font-bold tracking-tight">{title}</h1>{sub && <p className="mt-1 text-sm text-muted">{sub}</p>}</div> : <span />}{right}</div>;

export const Field = ({ label, children }: { label: string; children: ReactNode }) =>
  <label className="block text-sm"><span className="mb-1 block font-medium">{label}</span>{children}</label>;
export const inputCls = "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm placeholder:text-muted/60";

export const Stat = ({ label, value, note }: { label: string; value: ReactNode; note?: string }) =>
  <Card className="border-l-4 border-l-brand"><p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p>{note && <p className="mt-1 text-xs text-muted">{note}</p>}</Card>;
export const Progress = ({ value }: { value: number }) =>
  <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} className="h-2 w-full overflow-hidden rounded-full bg-brand-soft"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${value}%` }} /></div>;
