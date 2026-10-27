import { NextResponse } from "next/server";
import { generateContent } from "@/lib/ai";
import { createLimiter, sameOrigin } from "@/lib/limit";

export const runtime = "nodejs";
const limiter = createLimiter(10, Number(process.env.AI_DAILY_LIMIT) || 100);
const fail = (message: string, status: number) => NextResponse.json({ mode: "unavailable", message }, { status });

export async function POST(req: Request) {
  if (!sameOrigin(req.headers.get("origin"), req.headers.get("host"))) return fail("Cross-site requests are not allowed.", 403);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const gate = limiter(ip); if (!gate.ok) return fail(gate.reason, 429);
  const text = await req.text();
  if (text.length > 4000) return fail("Request too large.", 413);
  let body: unknown; try { body = JSON.parse(text); } catch { return fail("Invalid JSON.", 400); }
  const r = await generateContent(body);
  return NextResponse.json(r, { status: r.mode === "unavailable" ? 400 : 200 });
}
