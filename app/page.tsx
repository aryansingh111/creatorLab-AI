import Link from "next/link";
import { Card, DemoBadge } from "@/components/ui";
import Logo from "@/components/Logo";
import { totals } from "@/lib/metrics";
import { SEED } from "@/lib/seed";

const STEPS = [["Choose", "Pick a challenge"], ["Set up", "Audience & goal"], ["Create", "Draft with AI"], ["Plan", "Schedule posts"], ["Results", "Add your numbers"], ["Submit", "Send for review"], ["Feedback", "Learn & improve"]];

export default function Home() {
  const t = totals(SEED.metrics);
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-soft via-white to-white">
        <div aria-hidden className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="rounded-full border border-brand/20 bg-white px-3 py-1 text-xs font-semibold text-brand">Learn by running a real content experiment</span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">Create content that <span className="bg-gradient-to-r from-brand to-[#4F8BFF] bg-clip-text text-transparent">actually works</span>.</h1>
            <p className="mt-5 max-w-lg text-lg text-muted">Follow seven simple steps — from your first idea to trainer feedback. AI helps you draft; you stay in control.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/journey" className="rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 hover:bg-brand-dark">Start your journey →</Link>
              <Link href="/dashboard" className="rounded-full border border-line bg-white px-7 py-3.5 text-sm font-semibold hover:bg-cream">See a sample project</Link>
            </div>
            <p className="mt-4 text-xs text-muted">No sign-in needed. All sample content is fictional.</p>
          </div>
          <Card className="border-brand/15 shadow-xl shadow-brand/10">
            <div className="flex items-center gap-2"><h2 className="font-semibold">RupeeWise 14-day experiment</h2><DemoBadge /></div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[[String(SEED.content.filter((c) => c.status === "published").length), "Published"], [`${t.engagementRate}%`, "Engagement"], [`${t.ctr}%`, "Click rate"]].map(([v, l]) => <div key={l} className="rounded-xl bg-brand-soft p-4"><p className="text-2xl font-bold text-brand">{v}</p><p className="text-xs text-muted">{l}</p></div>)}
            </div>
            <ul className="mt-5 space-y-2 text-sm">{["SIP myths in 30 seconds", "Emergency fund carousel", "Old vs new tax regime"].map((x) => <li key={x} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-[10px] text-white">✓</span>{x}</li>)}</ul>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16" aria-label="How it works">
        <h2 className="text-center text-3xl font-bold tracking-tight">Seven steps. One clear path.</h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
          {STEPS.map(([a, b], i) => <li key={a} className="rounded-2xl border border-line bg-white p-4 text-center card-hover"><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand font-bold text-white">{i + 1}</span><p className="mt-3 font-semibold">{a}</p><p className="mt-0.5 text-xs text-muted">{b}</p></li>)}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[["Honest numbers", "Rates and charts are calculated from your data. Nothing is invented by AI."], ["AI as a helper", "Drafts are labelled, editable and need your review before you save."], ["Fair reviews", "Trainers score against a clear rubric and leave written feedback."]].map(([t, d]) => <Card key={t} className="card-hover"><h3 className="font-semibold text-brand">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></Card>)}
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#1E3A8A] to-brand py-14 text-center text-white">
        <h2 className="text-3xl font-bold">Ready to try your first challenge?</h2>
        <Link href="/journey" className="mt-6 inline-block rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand hover:bg-brand-soft">Start your journey →</Link>
      </section>
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-muted"><Logo size={24} /><p>Sample data is fictional and labelled “Demo data”.</p></footer>
    </div>
  );
}
