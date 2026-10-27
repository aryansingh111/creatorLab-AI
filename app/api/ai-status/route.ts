import { NextResponse } from "next/server";
import { aiConfig } from "@/lib/ai";

export const dynamic = "force-dynamic";
export function GET() {
  const c = aiConfig();
  return NextResponse.json({ mode: c ? "live" : "demo", model: c?.model ?? null, provider: c?.name ?? null }); // never returns the key
}
