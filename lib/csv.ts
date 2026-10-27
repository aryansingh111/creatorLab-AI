import type { Metric } from "./types";

export const CSV_HEADERS = ["date", "content_title", "platform", "impressions", "reach", "likes", "comments", "shares", "clicks", "conversions"];
const NUM = ["impressions", "reach", "likes", "comments", "shares", "clicks", "conversions"] as const;
export const MAX_BYTES = 200_000;
export const MAX_ROWS = 1000;

export interface CsvResult { rows: Metric[]; errors: { line: number; message: string }[]; fatal?: string; duplicates: number }

function splitLine(line: string) {
  const out: string[] = []; let cur = ""; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (c === "," && !q) { out.push(cur); cur = ""; } else cur += c;
  }
  return [...out, cur].map((s) => s.trim());
}
// Neutralise spreadsheet-formula injection and strip markup characters from imported text.
export const clean = (s: string) => s.replace(/[<>]/g, "").replace(/^[=+\-@]+/, "").slice(0, 200);

export function parseCsv(text: string): CsvResult {
  const fail = (fatal: string): CsvResult => ({ rows: [], errors: [], fatal, duplicates: 0 });
  if (text.length > MAX_BYTES) return fail(`File too large (max ${MAX_BYTES / 1000} KB).`);
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return fail("CSV needs a header row and at least one data row.");
  if (lines.length - 1 > MAX_ROWS) return fail(`Too many rows (max ${MAX_ROWS}).`);
  const header = splitLine(lines[0]).map((h) => h.toLowerCase());
  const missing = CSV_HEADERS.filter((h) => !header.includes(h));
  if (missing.length) return fail(`Missing required headers: ${missing.join(", ")}.`);

  const rows: Metric[] = []; const errors: CsvResult["errors"] = []; const seen = new Set<string>(); let duplicates = 0;
  lines.slice(1).forEach((line, i) => {
    const ln = i + 2; const cells = splitLine(line);
    const get = (k: string) => cells[header.indexOf(k)] ?? "";
    const date = get("date");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return void errors.push({ line: ln, message: `Invalid date "${date}" (use YYYY-MM-DD).` });
    const title = clean(get("content_title"));
    if (!title) return void errors.push({ line: ln, message: "content_title is empty." });
    const m: Metric = { id: `csv-${date}-${title}-${get("platform")}`, date, contentTitle: title, platform: clean(get("platform")) || "Unknown", source: "CSV" };
    for (const k of NUM) {
      const raw = get(k);
      if (raw === "") continue; // missing stays missing — never fabricated
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return void errors.push({ line: ln, message: `${k} must be a non-negative whole number (got "${raw}").` });
      m[k] = n;
    }
    if (seen.has(m.id)) return void duplicates++;
    seen.add(m.id); rows.push(m);
  });
  return { rows, errors, duplicates };
}

export const SAMPLE_CSV = `date,content_title,platform,impressions,reach,likes,comments,shares,clicks,conversions
2026-11-03,SIP myths in 30 seconds,Instagram,5400,4100,320,41,58,96,12
2026-11-05,Emergency fund carousel,Instagram,3900,3000,210,22,35,70,
2026-11-08,Old vs new tax regime,YouTube Shorts,8800,7200,540,88,120,210,31`;
