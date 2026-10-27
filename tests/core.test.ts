import { afterEach, describe, expect, it, vi } from "vitest";
import { createLimiter, sameOrigin } from "@/lib/limit";
import { conversionRate, ctr, engagementRate, followerGrowth, forProject, totals, topContent } from "@/lib/metrics";
import { parseCsv, CSV_HEADERS } from "@/lib/csv";
import { canMoveContent, canMoveSubmission } from "@/lib/status";
import { generateContent } from "@/lib/ai";
import type { Metric } from "@/lib/types";

const base: Metric = { id: "a", date: "2026-11-01", contentTitle: "x", platform: "Instagram", source: "Manual" };

describe("metrics", () => {
  it("computes rates", () => {
    const m = { ...base, reach: 1000, likes: 50, comments: 10, shares: 40, impressions: 2000, clicks: 100, conversions: 10 };
    expect(engagementRate(m)).toBe(10); expect(ctr(m)).toBe(5); expect(conversionRate(m)).toBe(10);
  });
  it("guards zero denominators and missing values", () => {
    expect(engagementRate({ ...base, reach: 0, likes: 5 })).toBeNull();
    expect(ctr({ ...base, impressions: 0, clicks: 5 })).toBeNull();
    expect(conversionRate({ ...base, clicks: 10 })).toBeNull();
    expect(followerGrowth(10, 0)).toBeNull(); expect(followerGrowth(110, 100)).toBe(10);
  });
  it("totals ignore rows lacking a denominator", () => {
    const t = totals([{ ...base, reach: 100, likes: 10 }, { ...base, id: "b", likes: 999 }]);
    expect(t.engagementRate).toBe(10);
  });
  it("ranks by chosen metric", () => {
    const r = topContent([{ ...base, id: "1", reach: 100, likes: 5 }, { ...base, id: "2", reach: 100, likes: 50 }], "engagementRate");
    expect(r[0].row.id).toBe("2");
  });
});

describe("csv", () => {
  const h = CSV_HEADERS.join(",");
  it("rejects missing headers", () => expect(parseCsv("date,content_title\n2026-01-01,a").fatal).toMatch(/Missing/));
  it("reports row-level errors and keeps blanks missing", () => {
    const r = parseCsv(`${h}\n2026-13-45,a,IG,1,1,1,1,1,1,1\n2026-01-02,b,IG,-5,1,1,1,1,1,1\n2026-01-03,c,IG,10,,,,,,`);
    expect(r.errors.map((e) => e.line)).toEqual([2, 3]); expect(r.rows[0].reach).toBeUndefined();
  });
  it("skips duplicates and rejects oversized files", () => {
    const row = "2026-01-03,c,IG,10,5,1,1,1,1,1";
    expect(parseCsv(`${h}\n${row}\n${row}`).duplicates).toBe(1);
    expect(parseCsv("x".repeat(300_000)).fatal).toMatch(/too large/);
  });
  it("neutralises formula prefixes", () => expect(parseCsv(`${h}\n2026-01-03,=SUM(A1),IG,1,1,1,1,1,1,1`).rows[0].contentTitle).toBe("SUM(A1)"));
});

describe("status transitions", () => {
  it("content flow", () => { expect(canMoveContent("draft", "needs_review")).toBe(true); expect(canMoveContent("idea", "published")).toBe(false); expect(canMoveContent("published", "draft")).toBe(false); });
  it("submission lifecycle", () => { expect(canMoveSubmission("submitted", "in_review")).toBe(true); expect(canMoveSubmission("draft", "accepted")).toBe(false); });
});

describe("ai adapter", () => {
  const input = { kind: "hook", niche: "finance", audience: "students", platform: "Instagram", tone: "Friendly" };
  const reply = (text: string, ok = true) => vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: async () => ({ content: [{ type: "text", text }] }) });
  afterEach(() => { delete process.env.ANTHROPIC_API_KEY; delete process.env.GEMINI_API_KEY; vi.unstubAllGlobals(); });

  it("returns labelled demo output with no key", async () => { const r = await generateContent(input); expect(r.mode).toBe("demo"); expect(r.draft?.body).toBeTruthy(); });
  it("rejects invalid input", async () => expect((await generateContent({ kind: "nope" })).mode).toBe("unavailable"));
  it("returns live draft and never sends the key in the body", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-test"; const f = reply('{"title":"T","body":"B"}'); vi.stubGlobal("fetch", f);
    const r = await generateContent(input); expect(r.mode).toBe("live"); expect(r.draft?.title).toBe("T");
    expect(f.mock.calls[0][1].headers["x-api-key"]).toBe("sk-test"); expect(f.mock.calls[0][1].body).not.toContain("sk-test");
  });
  it("calls Gemini when GEMINI_API_KEY is set", async () => {
    process.env.GEMINI_API_KEY = "g-test";
    const f = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: '{"title":"G","body":"Hello"}' }] } }] }) }); vi.stubGlobal("fetch", f);
    const r = await generateContent(input); expect(r.mode).toBe("live"); expect(r.draft?.title).toBe("G");
    expect(f.mock.calls[0][0]).toContain("generativelanguage.googleapis.com"); expect(f.mock.calls[0][0]).not.toContain("g-test"); expect(f.mock.calls[0][1].body).not.toContain("g-test");
  });
  it("rejects malformed model output", async () => { process.env.ANTHROPIC_API_KEY = "k"; vi.stubGlobal("fetch", reply('{"nope":1}')); expect((await generateContent(input)).mode).toBe("unavailable"); });
  it("handles provider failure and non-JSON", async () => {
    process.env.ANTHROPIC_API_KEY = "k"; vi.stubGlobal("fetch", reply("", false)); expect((await generateContent(input)).mode).toBe("unavailable");
    vi.stubGlobal("fetch", reply("sorry, no json")); expect((await generateContent(input)).mode).toBe("unavailable");
  });
});

describe("limits and scoping", () => {
  it("enforces per-minute and per-day caps", () => {
    let t = Date.UTC(2026, 10, 1); const l = createLimiter(2, 3, () => t);
    expect(l("a").ok).toBe(true); expect(l("a").ok).toBe(true); expect(l("a").ok).toBe(false);
    t += 61_000; expect(l("a").ok).toBe(true); expect(l("b").ok).toBe(false); // daily cap of 3 reached
    t += 86_400_000; expect(l("b").ok).toBe(true); // new day resets
  });
  it("rejects cross-site origins", () => { expect(sameOrigin("https://evil.com", "app.com")).toBe(false); expect(sameOrigin("https://app.com", "app.com")).toBe(true); expect(sameOrigin(null, "app.com")).toBe(true); });
  it("scopes metrics to a project", () => expect(forProject([{ ...base, projectId: "p1" }, { ...base, id: "z", projectId: "p2" }], "p2")).toHaveLength(1));
});
