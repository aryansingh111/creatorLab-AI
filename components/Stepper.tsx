"use client";

export interface Step { id: string; label: string; done: boolean }

export default function Stepper({ steps, current, onSelect, maxReachable }: { steps: Step[]; current: number; onSelect: (i: number) => void; maxReachable: number }) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-start">
        {steps.map((s, i) => {
          const active = i === current; const locked = i > maxReachable;
          return (
            <li key={s.id} className="relative flex flex-1 flex-col items-center">
              {i > 0 && <span aria-hidden className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${steps[i - 1].done ? "bg-brand" : "bg-line"}`} />}
              <button type="button" disabled={locked} onClick={() => onSelect(i)} aria-current={active ? "step" : undefined} aria-label={`Step ${i + 1}: ${s.label}${s.done ? " (done)" : ""}`}
                className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-sm font-semibold transition ${active ? "border-brand bg-brand text-white ring-4 ring-brand/20" : s.done ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-muted"} ${locked ? "cursor-not-allowed opacity-60" : "hover:border-brand"}`}>
                {s.done && !active ? "✓" : i + 1}
              </button>
              <span className={`mt-2 hidden text-center text-xs sm:block ${active ? "font-semibold text-brand" : "text-muted"}`}>{s.label}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-center text-sm font-semibold text-brand sm:hidden">{steps[current].label}</p>
    </nav>
  );
}
