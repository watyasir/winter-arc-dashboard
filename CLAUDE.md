# Yasir OS

**Yasir OS** (code and repo name `yasiros`): a personal life dashboard for Yasir. Winter Arc is only the 90-day season feature (chip, page, hero), never the product name. One place to see and log health, workouts, body, tasks, goals and money, with a 90-day "Winter Arc" season on top. It is built to keep growing: new areas of life get added as new trackers, without rebuilding the app.

It is also a **public portfolio project**. Yasir is a vibe coder: he directs, prompts and reviews; you write the code. Explain what you did in plain words, not jargon.

## Read this first, every session

1. Read `docs/PROGRESS.md` to see which phase is done and which one is next.
2. Work on **one phase only**, the one Yasir names. Do not start the next phase on your own.
3. Read only the files the phase needs. Do not scan the whole repo.
4. At the end of the session:
   - tick off finished items in `docs/PROGRESS.md`
   - add an entry to `docs/BUILD_LOG.md` (template below)
   - commit with a clear message
5. **Save progress as you go, not only at the end** (usage limits can cut a session off mid-task). After each finished step: tick it in `docs/PROGRESS.md` with one line on what's done and what's next, and commit (`git commit -m "..."`). When a new session starts or Yasir types "continue", read `docs/PROGRESS.md` and `git status` first, finish any half-done step, then carry on.
6. Do dashboard work yourself (Supabase SQL editor and migrations, Vercel and GitHub settings, via Chrome or a CLI), even when the request says "add it to the checklist" or "for the morning": do it, then record it as done. Only hand Yasir what you're not allowed to do (sign-ups, passwords, typing secret keys, payments, deleting data), as short numbered steps.

## Stack

| Part | Tool | Why |
|---|---|---|
| App | Next.js (App Router) + TypeScript | Web app that also works well on a phone |
| Styling | Tailwind CSS | Fast, consistent design tokens |
| Charts | One small SVG `LineChart` (no library) | Light, themed, accessible |
| Database + login | Supabase (Postgres + Auth) | Free tier, real database, email login |
| Hosting | Vercel | Free tier, live link, auto-deploy from GitHub |
| Money data | Snapshots pushed to `POST /api/money` by Claude's finance task (no Google service account, 26 Oct 2026) | Money already lives in his Personal Finance sheet |

Keep dependencies few. Ask before adding any new library.

## Hard rules

- **No personal data in the repo.** The repo is public. Real data lives only in Supabase. No names, amounts, bank details or health info in code, seeds, comments, screenshots or commits.
- **Secrets only in `.env.local`** (and Vercel env settings). Keep `.env.example` updated with empty placeholders. Never commit `.env.local`.
- **The Google Sheet is read-only for this app.** Another system already writes to it. The app must never write, format or create anything in that sheet.
- **Demo mode must always work.** `/demo` shows the full dashboard with fake data and no login. That is what recruiters and visitors see.
- **Only Yasir can log in** to the real dashboard (allow-list one email via env var `ALLOWED_EMAIL`).
- **Logging must be fast.** The daily check-in should take under 60 seconds on a phone. If a feature makes logging slower, say so before building it.
- **Mobile first.** Design for a 390px wide phone screen, then widen for desktop.
- **Keep the code lean:** delete unused code, no hidden or parked features. Run a dead-code check (`npx knip`) before finishing a phase.
- All money in Indian rupees, formatted Indian style: ₹1,25,000. Dates as `18 Oct 2026`. Timezone `Asia/Kolkata`.

## How the app grows (important)

Everything is built from a few generic pieces, so new things are added as data, not new code:

- **Tracker**: anything measured over time. Has a name, area (Health, Body, Mind, Skills, Money, Custom), type (`checkbox`, `number`, `scale_1_5`, `duration_minutes`, `time_of_day`, `choice`), optional unit, optional daily/weekly target, optional group (trackers in one group share a card on the check-in, like Meals or Blood pressure).
- **Entry**: one value for one tracker on one date.
- **Season**: a time-boxed challenge (Winter Arc = 90 days). Has a start date, length and targets. Only one active at a time.
- **Tiles**: every tile is the shared `Tile`; the Overview places them by grid area (`bento` in globals.css), the other pages stack them in a simple grid.

Workouts, tasks, goals and money get their own tables because their shape is different.

## Design rule: Soft bento (v8, 30 Oct 2026)

**Read `docs/DESIGN.md` before any UI work.** It is the full spec and has a changelog; if the code doesn't match the latest entry, update the code. Apple HIG and the v6 "Teal and grey" look are retired: don't bring them back.

Short version:
- **Light only, no dark mode.** Page `#FFF5E6`, white cards with a 1px `#F1E3CC` border, 20px tile corners, 12px inner items, 999px pills, one soft shadow. No hard shadows.
- **Fills, not text:** primary peach `#FAD4C0` and secondary blue `#80A1C1`, always with dark text (`#111827`). Blue as text/links/focus is `#3E5F7F`. States: success `#15803D`/`#DCFCE7`, warning `#B45309`/`#FEF3C7`, danger `#B91C1C`/`#FEE2E2`. Owner tags: Claude `#D97757` (dark text), Yasir `#3E5F7F` (white text). Never colour alone: every state also has a word or symbol.
- **Type:** Inter (500 body, 600 labels, 800 headings), JetBrains Mono for numbers, via `next/font`. Scale 12/14/16/20/24/32.
- **Every token lives in the one `@theme` block in `src/app/globals.css`.** No hex values in components.
- **Accessibility:** all text ≥ 4.5:1, 3px `#3E5F7F` focus ring, tap targets ≥ 44px, `prefers-reduced-motion` respected, hover/press in CSS only (`press` = scale .99), no animation library.
- **Components:** one `Tile` for every tile (`src/components/Tile.tsx`), one SVG `LineChart` (no chart library). Keep files under ~250 lines.
- **Pages:** Overview (the only bento), Winter Arc, Board (full kanban + Claude's jobs), Money, Health, Gallery, each at its own address and again under `/demo`. Tasks due soon show as reminder toasts (never a blocking pop-up).

## Folder layout (target)

```
src/
  app/            routes: / and /winter-arc, /board, /money, /health, /gallery (+ /demo/...), /log, /login, /settings, /progress, /api
  components/     shared UI (Tile, LineChart, Chip, Segmented, ...) and the app shell (dashboard/)
  modules/        one folder per page or tile group (overview, arc, board, money, health, gallery, reminders)
  lib/            supabase client, sheets client, date + rupee helpers
  data/demo/      fake data for /demo
docs/
  PROGRESS.md     phase checklist
  BUILD_LOG.md    what was built each session (portfolio case study material)
  BUILD_PLAN.md   the full phased plan
supabase/
  migrations/     database schema changes, in order
```

## BUILD_LOG entry template

```
## Session N — <date> — Phase X: <name>
**Goal:**
**What I asked Claude Code to do:** (Yasir's main prompt, short)
**What got built:**
**What broke and how we fixed it:**
**What Yasir had to do himself:** (sign-ups, keys, clicks)
**Screenshot to take:** (which screen is worth showing)
**Next:**
```

## Talking to Yasir

- Plain words, short. No lectures.
- When you finish, tell him: what works now, how to see it (link or command), and what he needs to do, if anything.
- If you hit a blocker, name it, then give the fix. Don't loop on retries.
