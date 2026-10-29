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
| Charts | Recharts | Simple, good-looking trend charts |
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
- **Dashboard tiles**: registered in one file (`src/modules/registry.ts`). Adding a module means adding one entry there.

Workouts, tasks, goals and money get their own tables because their shape is different, but they still plug into the same tile registry.

## Design rule (21 Oct 2026)

Stay on the current v6 look ("Teal and grey") and never go back to older designs. This is not a hard freeze: where a feature needs a design or layout change, make it, built from the v6 tokens and components.

## Design direction: AnuPpuccin (Catppuccin Latte) card layout + Apple HIG behaviour

**Read `docs/DESIGN.md` before any UI work.** It is the full spec (tokens, layout, components, states, copy) and has a changelog: if the code doesn't match the latest changelog entry, update the code to match, without waiting to be asked. The exact mockup markup is in `docs/design-reference/` (Main = dashboard, Phone, CheckIn). Rebuild it as React + Tailwind; don't paste the mockup code.

Short version:
- **Light theme only, "Teal and grey" (v6).** Grey frame, white cards, deep teal `#0F4C4A` brand colour, one dark teal gradient hero card, pill controls, wallet-stack Money tile. No dark mode. All values in DESIGN.md §2b (they override §2 and the older notes below).
- **Look:** Yasir's Obsidian theme AnuPpuccin, light card layout. Flat `base #EFF1F5` cards with 16px corners on a `crust #DCE0E8` frame, no shadows, rainbow-folder colours in the sidebar, dashed rule under the page header, rounded-square checkboxes. Never copy AnuPpuccin's CSS (GPL-3.0); use only the Catppuccin Latte palette (MIT) and rebuild the look.
- **One fluid layout** for laptop and 24" monitor; sidebar stacks on top under 980px.
- **Colour has one meaning each:** blue interactive, green done, peach due soon, red overdue, mauve Winter Arc, Claude orange `#D97757` for Claude (v6.4). Small coloured text uses the text-safe variants in DESIGN.md. Never colour alone.
- **Apple HIG still governs behaviour:** one primary button per view, 44px phone targets, visible focus, reduced motion respected, charts with a summary line and right-side axis labels. Run `npx hig-doctor .` before finishing each phase.
- Views: Overview · Winter Arc · Board (details in DESIGN.md §3–4). Overview has My Day (the day plan, stored in Supabase, never in the repo); the Board has Claude's scheduled tasks beside it; the action gate opens before everything (v6.4). Mail nudges and the Instinct link were dropped for good (27 Oct 2026); don't bring them back.

Define all colours and fonts as tokens in one place (`tailwind.config` + CSS variables). Never hard-code a colour in a component.

## Folder layout (target)

```
src/
  app/            routes: / (dashboard), /log (daily check-in), /demo, /login, /settings
  components/     shared UI (Card, StatTile, ProgressRing, Sparkline...)
  modules/        one folder per dashboard module + registry.ts
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
