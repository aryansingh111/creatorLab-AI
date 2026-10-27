import type { Metric } from "./types";

const pct = (n: number, d?: number) => (d && d > 0 ? Math.round((n / d) * 10000) / 100 : null);
const sum = (rows: Metric[], k: keyof Metric) => rows.reduce((a, r) => a + (typeof r[k] === "number" ? (r[k] as number) : 0), 0);
const has = (rows: Metric[], k: keyof Metric) => rows.some((r) => typeof r[k] === "number");

export const engagements = (m: Metric) =>
  m.likes === undefined && m.comments === undefined && m.shares === undefined ? null : (m.likes ?? 0) + (m.comments ?? 0) + (m.shares ?? 0);

export function engagementRate(m: Metric) {
  const e = engagements(m);
  return e === null || m.reach === undefined ? null : pct(e, m.reach);
}
export const ctr = (m: Metric) => (m.clicks === undefined || m.impressions === undefined ? null : pct(m.clicks, m.impressions));
export const conversionRate = (m: Metric) => (m.conversions === undefined || m.clicks === undefined ? null : pct(m.conversions, m.clicks));

export function followerGrowth(current: number, previous: number) {
  return previous > 0 ? Math.round(((current - previous) / previous) * 10000) / 100 : null;
}

export function totals(rows: Metric[]) {
  const e = rows.reduce((a, r) => a + (engagements(r) ?? 0), 0);
  const reachRows = rows.filter((r) => r.reach !== undefined && engagements(r) !== null);
  const clickRows = rows.filter((r) => r.clicks !== undefined && r.impressions !== undefined);
  const convRows = rows.filter((r) => r.conversions !== undefined && r.clicks !== undefined);
  return {
    impressions: has(rows, "impressions") ? sum(rows, "impressions") : null,
    reach: has(rows, "reach") ? sum(rows, "reach") : null,
    engagements: e,
    engagementRate: pct(reachRows.reduce((a, r) => a + (engagements(r) ?? 0), 0), reachRows.reduce((a, r) => a + (r.reach ?? 0), 0)),
    ctr: pct(sum(clickRows, "clicks"), sum(clickRows, "impressions")),
    conversionRate: pct(sum(convRows, "conversions"), sum(convRows, "clicks")),
  };
}

export function dateRange(rows: Metric[]) {
  if (!rows.length) return null;
  const d = rows.map((r) => r.date).sort();
  return { from: d[0], to: d[d.length - 1] };
}

export type RankBy = "engagements" | "engagementRate" | "ctr" | "reach";
export function topContent(rows: Metric[], by: RankBy, n = 5) {
  const val = (r: Metric) => (by === "engagements" ? engagements(r) : by === "engagementRate" ? engagementRate(r) : by === "ctr" ? ctr(r) : r.reach ?? null);
  return rows.map((r) => ({ row: r, value: val(r) })).filter((x) => x.value !== null)
    .sort((a, b) => (b.value as number) - (a.value as number)).slice(0, n);
}

/** Daily trend, grouped by date. */
export function trend(rows: Metric[]) {
  const by = new Map<string, Metric[]>();
  rows.forEach((r) => by.set(r.date, [...(by.get(r.date) ?? []), r]));
  return [...by.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, g]) => ({ date, reach: sum(g, "reach"), engagements: totals(g).engagements }));
}

export const forProject = (rows: Metric[], projectId: string) => rows.filter((r) => r.projectId === projectId);
