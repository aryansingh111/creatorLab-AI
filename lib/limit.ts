/** In-memory limits (reset on restart; use a shared store like Redis/Upstash when running multiple instances). */
export function createLimiter(perMinute: number, perDay: number, now: () => number = Date.now) {
  const hits = new Map<string, number[]>(); let day = ""; let dayCount = 0;
  return function check(id: string): { ok: true } | { ok: false; reason: string } {
    const t = now(); const today = new Date(t).toISOString().slice(0, 10);
    if (today !== day) { day = today; dayCount = 0; }
    if (dayCount >= perDay) return { ok: false, reason: "Daily AI generation limit reached. Try again tomorrow." };
    const recent = (hits.get(id) ?? []).filter((x) => t - x < 60_000);
    if (recent.length >= perMinute) return { ok: false, reason: "Rate limit reached. Try again in a minute." };
    hits.set(id, [...recent, t]); dayCount++;
    return { ok: true };
  };
}

/** Reject cross-site browser requests so other websites can't spend this app's AI quota. */
export function sameOrigin(origin: string | null, host: string | null) {
  if (!origin) return true; // non-browser clients (curl) carry no Origin; they are still rate limited
  try { return new URL(origin).host === host; } catch { return false; }
}
