# CreatorLab AI

Plan, create, test, and improve a content project with AI — while learning the process.
A demo-first MVP built from the *AI Creator Challenge Platform* guide. **It runs with no accounts, API keys, or cost.**

## Quick start

**Requirements:** Node.js 20.9 or newer (the repo pins Node 22 in `.nvmrc`) and npm.

```bash
cd creatorlab-ai
nvm use            # or: fnm use   — picks Node 22 from .nvmrc
npm install
npm run dev
```

Open **http://localhost:3000** and click **Try the demo**. Sample data is preloaded and labelled "Demo data".

### Other commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload (http://localhost:3000) |
| `npm run build` then `npm start` | Production build and server |
| `npm test` | Unit tests (metrics, CSV, status rules, AI adapter, limits) |
| `npm run typecheck` | TypeScript check |

Port 3000 busy? Run `npx next dev -p 3001`.

## Enable live AI (optional)

Without a key, the AI studio returns clearly labelled **Demo mode** templates. To use a real model:

1. Copy the example file: `cp .env.example .env.local`
2. Add **one** key to `.env.local`:
   - `GEMINI_API_KEY` — get it at https://aistudio.google.com/apikey (free tier with limits), or
   - `ANTHROPIC_API_KEY` — paid, from https://console.anthropic.com
3. Restart `npm run dev`.

**Settings** and the sidebar then show "Live" with the model name.

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | – | Gemini key (used first if both keys are set) |
| `GEMINI_MODEL` | `gemini-3.5-flash` | Override if Google retires a model (404 error) |
| `ANTHROPIC_API_KEY` | – | Claude key |
| `AI_MODEL` | `claude-haiku-5-5` | Claude model override |
| `AI_DAILY_LIMIT` | `100` | Max generations per day across the whole server |

Keys are used on the server only and never reach the browser. **Never commit `.env.local`** (it is git-ignored). Provider terms apply: on free tiers, prompts may be used by the provider, so don't enter private data.

## Try the main flow (about 5 minutes)

1. **Challenges** → open the 14-day finance challenge → *Start this challenge* (or open the sample project).
2. **Project** → fill niche, audience, goal, platforms → *Save project*.
3. **AI studio** → pick a type → *Generate draft* → edit → *Save draft*. Change status (idea → draft → needs review → ready → published).
4. **Calendar** → list or month view, filter by platform.
5. **Analytics** → *Use sample CSV* → *Import*. Charts, engagement rate, CTR and conversion rate are calculated in code.
6. **Project** → write a summary and an `https://` evidence link → *Submit for review*.
7. Switch **Viewing as → Trainer** → **Trainer** → open the submission → score the rubric → *Accept* or *Request changes*.
8. Switch back to Student to see the feedback. **Project → Printable report** gives a print-ready summary.

### CSV format

```csv
date,content_title,platform,impressions,reach,likes,comments,shares,clicks,conversions
2026-11-03,SIP myths in 30 seconds,Instagram,5400,4100,320,41,58,96,12
```

Dates are `YYYY-MM-DD`; numbers are whole and non-negative; empty cells stay "missing" (never filled in). Limits: 200 KB, 1000 rows. Bad rows are listed with line numbers; duplicates are skipped.

## Project structure

```
app/            Pages and API routes (/api/generate, /api/ai-status)
components/     Shell, Logo, UI kit, ContentStudio, ProjectPicker
lib/            metrics.ts · csv.ts · status.ts · ai.ts · limit.ts · seed.ts · store.tsx
tests/          Vitest unit tests
supabase/       schema.sql (for manual review; not applied)
```

Routes: `/`, `/dashboard`, `/challenges`, `/challenges/[id]`, `/projects/[id]`, `/projects/[id]/report`, `/calendar`, `/analytics`, `/trainer`, `/settings`.

## Known limitations

- **Data lives in your browser (localStorage).** It is a temporary demo store, not production storage. *Settings → Reset demo data* restores the sample.
- **No real login.** The Student/Trainer switch is a demo toggle, and hiding UI is not authorization. For production use Supabase Auth plus the RLS policies in `supabase/schema.sql`, and enforce roles in server routes.
- **Rate limits are in memory** and reset when the server restarts; use a shared store (e.g. Redis) when running several instances.
- **AI output is a draft.** Verify every claim before publishing. There is no automatic social posting, by design.

## Deploy (portfolio)

Push to GitHub and import into Vercel (Hobby is for personal, non-commercial use, with limits). Demo mode needs no environment variables. To enable live AI there, add the key under Project Settings → Environment Variables. Because there is no login, keep `AI_DAILY_LIMIT` low on any public deploy. Check current Vercel and provider pricing before relying on "free".

## Branding

Logo: `components/Logo.tsx`. Favicon: `app/icon.svg`. Social card: `app/opengraph-image.tsx`. Palette: brand `#1D4ED8`, navy `#0F1E4A`, cream `#F4F7FF`, spark `#F5C451` (tokens in `app/globals.css`).
