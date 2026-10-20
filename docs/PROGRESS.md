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
| 8b | Gmail inbox | ⬜ Not started |
| 8c | Instinct link | ⬜ Not started |
| 9 | Share + portfolio polish | ⬜ Not started |

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
- [ ] Left for Phase 2: the phone home screen with tab bar and the check-in sheet (`Phone.dc.html`, `CheckIn.dc.html`), built with `/log`

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
- [ ] Moved to Phase 3: phone home screen with the tab bar (`Phone.dc.html`), since it shows real dashboard data

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

## Sign-in rules (20 Oct 2026)
- [x] Same browser stays signed in (login cookie lasts 400 days and refreshes on each visit)
- [x] Each device is signed out 7 days after its sign-in, with a clear message on `/login` (`src/lib/session.ts`, `src/proxy.ts`)
- [ ] Phase 8b: connect Gmail at sign-in so both renew on the same day (note in `docs/BUILD_PLAN.md`)

**Next up:** Phase 6 (money from the Personal Finance sheet; get the sheet's cell map from Claude chat first). Optional: use Reset test data in /settings before 26 Oct so Winter Arc starts clean. Supabase's built-in email allows only 2 sign-in emails per hour.
