# Progress

One phase per session. Full details and kickoff prompts are in `docs/BUILD_PLAN.md`.

| Phase | Name | Status |
|---|---|---|
| 0 | Setup: scaffold, git, GitHub, Vercel | ✅ Done (19 Oct 2026) |
| 1 | The look (demo data only) | ✅ Done (19 Oct 2026) |
| 2 | Database + login + daily check-in | ✅ Done (20 Oct 2026) |
| 3 | Real dashboard | ✅ Done (20 Oct 2026) |
| 4 | Workouts + body | ✅ Done (21 Oct 2026) |
| 5 | Tasks + goals | ✅ Done (21 Oct 2026) |
| 6 | Money (read from the sheet) | ⬜ Not started |
| 7 | Winter Arc season + custom trackers | ✅ Done (21 Oct 2026) |
| 8 | Automation (logging API) | ⬜ Not started |
| 8b | Mail nudges | ⏸ Parked (26 Oct), Yasir will re-plan |
| 8c | Instinct link | ⏸ Parked (26 Oct), Yasir will re-plan |
| 9 | Share + portfolio polish | ✅ Built (26 Oct 2026); live link waits on Vercel settings |

## Decisions & schedule (21 Oct 2026)

**Decisions**
- **Winter Arc starts Mon 26 Oct 2026**, day 1 of 90. Test data wiped 21 Oct with "Reset test data" (checked: 0 entries, workouts, body checks, tasks, goals; 8 trackers and the season kept). Real logging starts Mon 26 Oct.
- **Design stays on v6** ("Teal and grey"), never older designs. Not a hard freeze: where a feature needs a design or layout change, make it with v6 tokens and components (Yasir chose this over a strict freeze, 21 Oct).
- **Gmail: no full inbox.** Phase 8b is "Mail nudges": Claude posts the emails that need Yasir through the API; he reads and replies in Gmail.
- **Tracker targets** get decided with Yasir when Phase 6 is finalized.
- **Site name is "Yarizz's Dashboard"** (tab titles, welcome and sign-in pages, sidebar). Repo and Vercel link keep the winter-arc-dashboard name.

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
- [x] Deployed on Vercel, live link works: https://winter-arc-dashboard-drab.vercel.app

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
- [ ] Yasir: add `SHARE_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel, then check the live link
- [x] README: what it is, screenshot list, stack, how it grows, how it was built with AI

**Next up:** Phase 6 (money from the Personal Finance sheet; get the sheet's cell map from Claude chat first). Optional: use Reset test data in /settings before 26 Oct so Winter Arc starts clean. Supabase's built-in email allows only 2 sign-in emails per hour.
