"use client";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useStore, uid } from "@/lib/store";
import { parseCsv, CSV_HEADERS, SAMPLE_CSV, type CsvResult } from "@/lib/csv";
import ProjectPicker from "./ProjectPicker";
import { conversionRate, ctr, dateRange, followerGrowth, forProject, engagementRate, engagements, topContent, totals, trend, type RankBy } from "@/lib/metrics";
import { Button, Card, DemoBadge, Empty, Field, PageHead, Stat, inputCls } from "./ui";

const fmt = (v: number | null, s = "") => (v === null ? "n/a" : v.toLocaleString() + s);

export default function AnalyticsView({ embedded = false }: { embedded?: boolean }) {
  const { db, ready, update, notify, projectId } = useStore();
  const [fg, setFg] = useState({ cur: "", prev: "" });
  const [rank, setRank] = useState<RankBy>("engagementRate"); const [csv, setCsv] = useState<CsvResult | null>(null); const [source, setSource] = useState("");
  const [m, setM] = useState({ date: "", contentTitle: "", platform: "Instagram", impressions: "", reach: "", likes: "", comments: "", shares: "", clicks: "", conversions: "" }); const [merr, setMerr] = useState("");
  if (!ready) return <p role="status" className="text-muted">Loading…</p>;

  const rows = forProject(db.metrics, projectId); const t = totals(rows); const range = dateRange(rows);
  const sources = [...new Set(rows.map((r) => r.source))].join(" + ");
  const onFile = async (f?: File) => {
    if (!f) return; setSource(f.name);
    if (!f.name.toLowerCase().endsWith(".csv")) return setCsv({ rows: [], errors: [], fatal: "Only .csv files are accepted.", duplicates: 0 });
    setCsv(parseCsv(await f.text()));
  };
  const importRows = () => {
    if (!csv?.rows.length) return;
    update((d) => { const ids = new Set(d.metrics.map((x) => x.id)); const add = csv.rows.map((r) => ({ ...r, projectId, id: `${projectId}-${r.id}` })).filter((r) => !ids.has(r.id)); return { ...d, metrics: [...d.metrics, ...add] }; });
    notify("Metrics imported"); setCsv(null);
  };
  const addManual = () => {
    const text = [CSV_HEADERS.join(","), [m.date, m.contentTitle, m.platform, m.impressions, m.reach, m.likes, m.comments, m.shares, m.clicks, m.conversions].join(",")].join("\n");
    const r = parseCsv(text); if (r.errors.length || r.fatal) return setMerr(r.fatal ?? r.errors[0].message);
    setMerr(""); update((d) => ({ ...d, metrics: [...d.metrics, { ...r.rows[0], id: uid(), projectId, source: "Manual" }] })); notify("Metric added");
  };
  const top = topContent(rows, rank);

  return (
    <>
      <PageHead title={embedded ? "" : "Analytics"} sub="Calculated from stored or imported values with plain code — never by a language model." right={<ProjectPicker />} />
      {rows.length === 0 ? <Empty title="No metrics yet" hint="Import a CSV or add a row manually below." /> : <>
        <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted">Source: {sources} · Range: {range?.from} to {range?.to} · {rows.length} rows {rows.some((r) => r.source === "Demo data") && <DemoBadge />}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Impressions" value={fmt(t.impressions)} /><Stat label="Reach" value={fmt(t.reach)} /><Stat label="Engagements" value={t.engagements.toLocaleString()} note="Likes + comments + shares" />
          <Stat label="Engagement rate" value={fmt(t.engagementRate, "%")} note="Engagements / reach × 100" /><Stat label="CTR · Conv. rate" value={`${fmt(t.ctr, "%")} · ${fmt(t.conversionRate, "%")}`} note="Clicks/impr. · Conv./clicks" />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card><h2 className="mb-2 font-semibold">Reach and engagements by day</h2><div className="h-64" role="img" aria-label="Line chart of reach and engagements by day"><ResponsiveContainer><LineChart data={trend(rows)}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Legend /><Line dataKey="reach" stroke="#1D4ED8" /><Line dataKey="engagements" stroke="#0F1E4A" /></LineChart></ResponsiveContainer></div></Card>
          <Card><h2 className="mb-2 font-semibold">Engagement by post</h2><div className="h-64" role="img" aria-label="Bar chart of engagements per post"><ResponsiveContainer><BarChart data={rows.map((r) => ({ name: r.contentTitle.slice(0, 18), engagements: engagements(r) ?? 0 }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="engagements" fill="#1D4ED8" /></BarChart></ResponsiveContainer></div></Card>
        </div>
        <Card className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">Best-performing content</h2>
            <select aria-label="Rank by" className={inputCls + " !w-auto"} value={rank} onChange={(e) => setRank(e.target.value as RankBy)}><option value="engagementRate">Engagement rate</option><option value="engagements">Engagements</option><option value="ctr">CTR</option><option value="reach">Reach</option></select></div>
          <div className="overflow-x-auto"><table className="mt-3 w-full text-left text-sm"><thead className="text-xs uppercase text-muted"><tr><th className="py-1">Title</th><th>Platform</th><th>Eng. rate</th><th>CTR</th><th>Conv. rate</th><th>Source</th></tr></thead>
            <tbody>{top.map(({ row: r }) => <tr key={r.id} className="border-t border-line"><td className="py-2">{r.contentTitle}</td><td>{r.platform}</td><td>{fmt(engagementRate(r), "%")}</td><td>{fmt(ctr(r), "%")}</td><td>{fmt(conversionRate(r), "%")}</td><td>{r.source}</td></tr>)}</tbody></table></div>
        </Card></>}

      <Card className="mt-6">
        <h2 className="font-semibold">Follower growth</h2>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <Field label="Previous followers"><input inputMode="numeric" className={inputCls} value={fg.prev} onChange={(e) => setFg({ ...fg, prev: e.target.value })} /></Field>
          <Field label="Current followers"><input inputMode="numeric" className={inputCls} value={fg.cur} onChange={(e) => setFg({ ...fg, cur: e.target.value })} /></Field>
          <p className="pb-2 text-sm" aria-live="polite">{fg.prev === "" || fg.cur === "" ? "Enter both values." : (() => { const g = followerGrowth(Number(fg.cur), Number(fg.prev)); return g === null ? "n/a (previous followers must be above 0)" : `Growth: ${g}%`; })()}</p>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Import CSV</h2>
          <p className="mt-1 text-xs text-muted">Columns: {CSV_HEADERS.join(", ")}. Max 200 KB / 1000 rows. Leave a cell empty if unknown.</p>
          <input type="file" accept=".csv" aria-label="CSV file" className="mt-3 text-sm" onChange={(e) => onFile(e.target.files?.[0])} />
          <button className="ml-2 text-xs text-brand underline" onClick={() => { setSource("sample.csv"); setCsv(parseCsv(SAMPLE_CSV)); }}>Use sample CSV</button>
          {csv && <div role="status" className="mt-3 text-sm">
            {csv.fatal ? <p className="text-red-700">{csv.fatal}</p> : <>
              <p>{source}: {csv.rows.length} valid row(s){csv.duplicates ? `, ${csv.duplicates} duplicate(s) skipped` : ""}, {csv.errors.length} rejected.</p>
              {csv.errors.length > 0 && <ul className="mt-1 list-disc pl-5 text-red-700">{csv.errors.map((e) => <li key={e.line}>Line {e.line}: {e.message}</li>)}</ul>}
              <Button className="mt-2" disabled={!csv.rows.length} onClick={importRows}>Import {csv.rows.length} valid row(s)</Button></>}
          </div>}
        </Card>
        <Card>
          <h2 className="font-semibold">Add metrics manually</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Field label="Date"><input type="date" className={inputCls} value={m.date} onChange={(e) => setM({ ...m, date: e.target.value })} /></Field>
            <Field label="Content title"><input className={inputCls} value={m.contentTitle} onChange={(e) => setM({ ...m, contentTitle: e.target.value })} /></Field>
            {(["impressions", "reach", "likes", "comments", "shares", "clicks", "conversions"] as const).map((k) => <Field key={k} label={k}><input inputMode="numeric" className={inputCls} value={m[k]} onChange={(e) => setM({ ...m, [k]: e.target.value })} /></Field>)}
          </div>
          {merr && <p role="alert" className="mt-2 text-sm text-red-700">{merr}</p>}
          <Button className="mt-3" onClick={addManual}>Add row</Button>
        </Card>
      </div>
    </>
  );
}
