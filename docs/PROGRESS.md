# Progress

## Morning checklist for Yasir (26 Oct 2026)

Steps 1, 2 and 4 of last night's list were already done and live, so nothing is needed for the rename or the share card (`SHARE_TOKEN` is already set). Only the new API + Money needs you:

1. **Run the money migration.** Supabase → SQL Editor → paste all of `supabase/migrations/20261026000001_money_snapshots.sql` → Run. (Or ask a Claude session to do it in your Chrome.)
2. **Make the API token.** In Terminal: `openssl rand -hex 32` and copy the result.
3. **Add it to Vercel.** vercel.com/claude-0d67/yasiros → Settings → Environment Variables → name `API_TOKEN`, value = the token, Production → Save → Deployments → Redeploy the latest.
4. **Check it.** Ask Claude to call `GET /api/summary` with the token (should answer `ok: true` with today's missing logs).
5. **Point the finance task at it.** In Claude chat, give the finance task the token and `docs/API.md` → `POST /api/money`. The Money tile fills on the first snapshot. If the sheet only has one combined bank balance, add per-bank rows to it (or send one bank).

One phase per session. Full details and kickoff prompts are in `docs/BUILD_PLAN.md`.

| Phase | Name | Status |
|---|---|---|
| 0 | Setup: scaffold, git, GitHub, Vercel | ✅ Done (19 Oct 2026) |
| 1 | The look (demo data only) | ✅ Done (19 Oct 2026) |
| 2 | Database + login + daily check-in | ✅ Done (20 Oct 2026) |
| 3 | Real dashboard | ✅ Done (20 Oct 2026) |
| 4 | Workouts + body | ✅ Done (21 Oct 2026) |
| 5 | Tasks + goals | ✅ Done (21 Oct 2026) |
| 6 | Money (snapshots via the API) | 🟡 Built 26 Oct; waiting on the migration + `API_TOKEN` (morning checklist) |
| 7 | Winter Arc season + custom trackers | ✅ Done (21 Oct 2026) |
| 8 | Automation (logging API) | 🟡 Built 26 Oct; live once `API_TOKEN` is set (morning checklist) |
| 8b | Mail nudges | ⏸ Parked (26 Oct), Yasir will re-plan |
| 8c | Instinct link | ⏸ Parked (26 Oct), Yasir will re-plan |
| 9 | Share + portfolio polish | ✅ Done (26 Oct 2026) |

## Decisions & schedule (21 Oct 2026)

**Decisions**
- **Winter Arc starts Mon 26 Oct 2026**, day 1 of 90. Test data wiped 21 Oct with "Reset test data" (checked: 0 entries, workouts, body checks, tasks, goals; 8 trackers and the season kept). Real logging starts Mon 26 Oct.
- **Design stays on v6** ("Teal and grey"), never older designs. Not a hard freeze: where a feature needs a design or layout change, make it with v6 tokens and components (Yasir chose this over a strict freeze, 21 Oct).
- **Gmail: no full inbox.** Phase 8b is "Mail nudges": Claude posts the emails that need Yasir through the API; he reads and replies in Gmail.
- **Tracker targets** get decided with Yasir when Phase 6 is finalized.
- **Product name is "Yasir OS"** (renamed 26 Oct 2026 from "Yarizz's Dashboard"): tab titles, header/logo, metadata, README. Code/repo name `yasiros`. Winter Arc is only the season feature (chip, page, hero), never the product name.

**Schedule**
- **Fri 23 Oct, night:** Phase 8, 8b, 8c, then 9. Phase 9 runs on `/demo` data; drop it if it's past 1:30 AM.
- **Sat 24 Oct, night:** Phase 6 Money, after Yasir brainstorms it with Claude chat.
- **Sun 25 Oct:** rename the web address and GitHub repo to match "Yarizz's Dashboard" (new Vercel domain, Supabase sign-in URLs updated, old link stops working).

**Phase 6 leaning (not final)**
- No Google service account. Claude's scheduled finance task pushes a money snapshot to `POST /api/money` twice a day.
- The sheet has one combined bank balance plus per-card dues, not per-bank balances.

**Open decisions**
- Sign-in length: 7 days or 30 days, now that Gmail sign-in is gone.
- Per-bank balances: would need new rows in the sheet.

**Parked for later**
- Zendesk-style extras: alert strip, countdown, smart tags, connected-apps strip, weekly result card, collapsible tiles, NEW tag
- German tracker
- Trips / "cool stuff" fund
- Install as a phone app (PWA)

## Phase 0 checklist
- [x] Node.js installed
- [x] Next.js + TypeScript + Tailwind project created
- [x] Apple HIG skills installed (`npx skills add raintree-technology/apple-hig-skills`)
- [x] Git repo set up
- [x] `.env.example` created
- [x] `docs/PROGRESS.md` created
- [x] Placeholder home page says "Winter Arc Dashboard"
- [x] Pushed to GitHub (watyasir/winter-arc-dashboard)
- [x] Deployed on Vercel, live link works: https://yasiros.vercel.app

## Phase 1 checklist
- [x] Design tokens: Catppuccin Latte colours, text-safe variants, fonts (`src/app/globals.css`)
- [x] Shared UI pieces (`src/components/`): Card, SectionHeading, Button, Chip, CheckBox, Switch, Sparkline, ProgressBar, Icon
- [x] Fake data in `src/data/demo/`, one data shape in `src/modules/types.ts`
- [x] Tile registry (`src/modules/registry.ts`) with all Overview tiles: season strip, stats, Today, Inbox preview, Money, Weight, Goals, Habits, In progress
- [x] Sidebar with rainbow folders and collapsible trackers tree; header card with dashed rule
- [x] Inbox, Board and Instinct views, switched from the sidebar
- [x] Instinct status pill (demo: waiting with timer, then "replied" for 3.5 s)
- [x] Checked on laptop (1440px) and phone (390px); `npx hig-doctor .` clean
- [x] Moved on: the phone home screen and check-in sheet were built in Phases 2 and 3

## Design v6 "Teal and grey" (20 Oct 2026)
- [x] Design docs committed ("Design v6: Teal and grey + wallet stack")
- [x] Tokens renamed to v6 meanings, grey frame, white cards, teal brand, dark teal hero, pill controls
- [x] Wallet stack in the Money tile (fake accounts, tab opens account detail)
- [x] Checked at 1440px and 375px; `npx hig-doctor .` clean
- [x] Pre-commit privacy check (`scripts/privacy-check.mjs`, turned on by `npm install` via `prepare`)

## Phase 2 checklist
- [x] Migration: trackers, entries, seasons + row-level security (`supabase/migrations/`)
- [x] Login: email sign-in link, only `ALLOWED_EMAIL` gets in (`/login`, `/auth/confirm`, `src/proxy.ts`)
- [x] Default trackers added on first visit: sleep, water, workout, steps, skincare, hair, study, mood
- [x] `/log` check-in sheet (steppers, switches, segments, Done → Saved ✓), plus `/demo/log` on fake data
- [x] Supabase project (Mumbai), migration run, auth URLs set, `.env.local` written (20 Oct)
- [x] Tested on the Mac: signed in with the email link, saved a check-in (8 trackers, 8 entries in the database)
- [x] Vercel: `NEXT_PUBLIC_SUPABASE_URL` + `ALLOWED_EMAIL` set; publishable key is a code default (`src/lib/supabase/config.ts`); pushed and live (20 Oct)
- [x] Signed in on the iPhone at the live link and saved a check-in (20 Oct, 2:40 AM IST, confirmed in the database). Phase 2 done.
- [x] Moved to Phase 3: phone home screen with the tab bar (`Phone.dc.html`), done there

## Phase 3 checklist
- [x] Real data on `/` with the same tiles as `/demo`: today's status, streak, 7-day averages, this week vs weekly targets, 4-week habit grid (`src/lib/dashboard/`)
- [x] Empty states that say what to log (season, money, weight, goals, inbox, board)
- [x] Tapping a yes/no row on Today saves it and the numbers update straight away; `/log` refreshes `/` on save
- [x] Phone home screen with the floating tab bar (`Phone.dc.html`): Today, Arc, Board, Money tabs + round Log button, shown under 640px on `/` and `/demo`
- [x] Fixed: "Log Today" button text was teal on teal (global link colour won); plain links only get the teal now
- [x] Checked at 375px and desktop on `/demo` and on the real builder with test rows; `npx hig-doctor .` clean
- [x] Live check (20 Oct): Yasir's real rows give 8 of 8 logged and correct stats; tapping Hair routine on the phone ticks/unticks and saves straight to the database

## Phase 4 checklist
- [x] Migration: workouts, workout_sets (saved together by `save_workout`), body_checks, user_settings (goal weight), each locked to its owner. Run on Supabase (20 Oct)
- [x] `/log/workout`: name, exercises, sets of reps × kg; one-tap "Repeat last workout"; new sets copy the one before; recent list with delete. Saving ticks "Workout done" for that day
- [x] `/log/body`: weekly weight, goal weight, waist, chest, arms, progress photo yes/no (only the yes/no is stored)
- [x] Tiles: Workouts this week (vs weekly target), Lift progress (heaviest set per session), Weight vs goal with measurements and a "Due" chip after 7 days
- [x] `/demo/log/workout` and `/demo/log/body` on fake data; demo tiles run fake workouts through the same builder
- [x] Links from `/log` ("More to log"); phone: Workouts on Today tab, Weight + Lifts on Arc tab
- [x] Checked at 1440px and 375px on `/demo`; `npx hig-doctor .` clean
- [x] Pushed and live on Vercel (20 Oct)
- [x] Marked done 21 Oct: Yasir's entries so far are test numbers; tiles work on them. Real logging starts with the season.

## Phase 5 checklist
- [x] Migration: tasks (title, area, due date, Board column, owner) and goals (target, unit, deadline, linked tracker or hand-typed progress) + `goal_progress` view, each locked to its owner
- [x] Board on real tasks: To do / In progress / Waiting / Done, add per column, move with the column picker, delete
- [x] Tiles: Due today, Overdue (tick = done), In progress on real tasks; phone Today tab lists overdue + due today
- [x] Goals page (`/log/goals`): add a goal (typed-in or from a tracker), update typed progress, delete; `/demo/log/goals` on fake data; Goals tile on real data with an "Update goals" link
- [x] Migration run on Supabase (21 Oct); checked at 1440px and 375px on `/demo`; `npx hig-doctor .` clean; build passes; pushed

## Phase 7 checklist
- [x] Hero card before the start date: "Starts in X days" (desktop + phone); started: day X of 90, days to go, % targets hit, streak, best streak
- [x] Links to `/settings`: sidebar "+ New tracker", hero "Start Winter Arc", "Season and trackers" on `/log`
- [x] `/settings`: Winter Arc start date + target per tracker, add a tracker (shows in /log and on the dashboard), Reset test data (with confirm).
- [x] Yasir's season set in Supabase (21 Oct): Winter Arc, day 1 = Mon 26 Oct 2026, 90 days, targets sleep 7, water 3, steps 8000, skincare, hair, study 90 min (weekly workout and mood not counted daily; switch on in /settings)
- [x] Checked `/settings` at 375px (on a throwaway local page, since it needs sign-in) and the hero on `/demo` at desktop; countdown checked against the builder; `npx hig-doctor .` clean; build passes; pushed

## Polish + speed (21 Oct 2026)
- [x] Server code runs in Mumbai (`vercel.json` region `bom1`), next to the database; it ran in the US before, adding ~250 ms per database read
- [x] Sign-in checked from the login token's signature on the server (no extra trip to Supabase); dashboard and check-in read everything in parallel
- [x] Fixed: `/settings` crashed after adding a tracker; done tasks no longer show due dates; goals with the same name no longer clash
- [ ] Targets for each tracker are decided with Yasir when Phase 6 is finalized (the season currently uses each tracker's default daily target)

## Sign-in rules (20 Oct 2026)
- [x] Same browser stays signed in (login cookie lasts 400 days and refreshes on each visit)
- [x] Each device is signed out 7 days after its sign-in, with a clear message on `/login` (`src/lib/session.ts`, `src/proxy.ts`)
- [x] Dropped 21 Oct: Phase 8b is now mail nudges (no Gmail sign-in), so there's nothing to keep in step

## Cleanup (26 Oct 2026)
- [x] Inbox and Instinct hidden from the sidebar, header (Instinct pill) and Overview (Inbox preview) on `/` and `/demo`; code kept in `src/modules/inbox` and `src/modules/instinct`. Today and Money now share their row.

## Phase 9 checklist
- [x] `/progress` share card: day X/90, current + best streak, % targets hit this week (last week on Mondays), workouts this week, weight change. Portrait, dark teal hero, fits one phone screen
- [x] "Copy link" (shows the link to copy by hand if the clipboard is blocked); "Share progress" link on the Winter Arc hero
- [x] Public with `?t=<SHARE_TOKEN>`: numbers worked out on the server, only the card is sent; wrong or missing token = not found; not indexed, no referrer
- [x] `/demo/progress` on fake data with a "Sample data" chip
- [x] `SHARE_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` set in Vercel (Production) by Yasir; checked live 26 Oct: signed-in card shows day 1 with Copy link, the share link shows the card with no sign-in, a wrong token shows no card
- [x] README: what it is, screenshot list, stack, how it grows, how it was built with AI

## Design v6.1 layout split (26 Oct 2026)
- [x] Winter Arc data per tracker (targets this week, streaks, 13-week %) in the shared builder + demo data
- [x] Sidebar: Overview, Winter Arc, Board, Trackers (tree folds under Trackers); "Life, tracked"
- [x] Overview = whole life (Today · Tasks · Money / Body · Workouts · Goals / Habits · In progress) + "Day X/90 →" chip in the header
- [x] Winter Arc page: hero + 90-day strip, targets this week, streaks per tracker, week-by-week % (13 bars); header "Share card" opens the Phase 9 card
- [x] Phone: Today tab = life Overview in one column (chip, Today, Tasks, 2×2 Body/Workouts/Goals/Money, Habits 2 weeks, In progress); Arc tab = Winter Arc page stacked + Share card; tabs follow the shared view
- [x] Checked at 1440px and 375px on /demo (no sideways scroll, all phone targets 44px+); `npx hig-doctor .` clean (mockups excluded via `.higauditignore`); build passes; pushed

## Rename to Yasir OS (26 Oct 2026)
- [x] Product name "Yasir OS" in tab titles, sidebar logo text, welcome/sign-in pages, share card, metadata, README, CLAUDE.md; `package.json` name `yasiros`
- [x] GitHub repo renamed to `yasiros` (github.com/watyasir/yasiros; old URL redirects), git remote updated
- [x] Vercel: project renamed `yasiros`, domain `yasiros.vercel.app`; the old address was removed on Yasir's request (it now returns 404)
- [x] Supabase Auth: Site URL `https://yasiros.vercel.app`; Redirect URLs: `https://yasiros.vercel.app/**` and localhost only (old one removed)
- [x] Sign-in on the new address: email sent from yasiros.vercel.app/login, its link returns to `https://yasiros.vercel.app/auth/callback` (checked in the email)
- [x] Yasir signed in on the laptop at the new address

## Speed + sign-in landing (26 Oct 2026)
- [x] Signing in (email link or /login while signed in) lands on the dashboard, never the check-in; the check-in only opens from Log Today
- [x] Visited pages are reused for 2 minutes when going back and forth (`staleTimes`); saving still refreshes the dashboard at once
- [x] Log Today, Cancel/back links and the "More to log" links fully preload their page; the check-in's data is a private cache (`'use cache: private'`) so the preload includes it
- [x] Only the visible layout (phone or laptop) is rendered after load: about 1/3 less work on every tap and view switch
- Measured before (live, signed in): page loads 190–760 ms (slow ones = Vercel starting a fresh server), view switch ~60 ms on the laptop. Fluid compute was already on; server already in Mumbai
- Measured after (live): Log Today → check-in 14 ms (was 300–760 ms), Cancel → dashboard 10 ms, view switches 44–67 ms including two screen frames

## Phase 8 + 6 checklist (26 Oct 2026, overnight)
- [x] `POST /api/log`, `GET /api/summary`, `POST /api/money`, all behind env `API_TOKEN` (Bearer header, constant-time check). No token set = 503 and the app works as usual; wrong token = 401
- [x] Migration `20261026000001_money_snapshots.sql`: owner-locked `money_snapshots` (month, income, expenses, categories, needs/wants/savings actual vs target 50/20/30, banks, cards with dues + due date, spendable, updated_at). Not run yet
- [x] Money tile reads the latest snapshot: wallet stack (tab per bank and card, front card = available to spend), spend vs income, split bars with target markers, top 4 spends, "Updated <time>". Empty state until the first snapshot (also if the table doesn't exist yet). `/demo` stays fake, now in the same shape
- [x] No Google service account: BUILD_PLAN, README, CLAUDE.md and `.env.example` updated (`LOG_API_TOKEN` and the Google sheet vars replaced by `API_TOKEN`)
- [x] `docs/API.md` with example bodies (made-up amounts, no real bank names)
- [x] Checked: snapshot checker on good and bad bodies; 503 / 401 locally; Money tile at 1440px and 375px on /demo (no sideways scroll); build passes; `npx hig-doctor .` clean
- [ ] Full round trip (save + read through the database) not tested: needs the secret key, which only Vercel has. Check after the morning checklist

**Next up (old note):** Phase 6 (money from the Personal Finance sheet; get the sheet's cell map from Claude chat first). Optional: use Reset test data in /settings before 26 Oct so Winter Arc starts clean. Supabase's built-in email allows only 2 sign-in emails per hour.
