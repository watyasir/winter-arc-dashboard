# Progress

One phase per session. Full details and kickoff prompts are in `docs/BUILD_PLAN.md`.

| Phase | Name | Status |
|---|---|---|
| 0 | Setup: scaffold, git, GitHub, Vercel | ✅ Done (19 Oct 2026) |
| 1 | The look (demo data only) | ✅ Done (19 Oct 2026) |
| 2 | Database + login + daily check-in | 🟡 Code done, waiting on Supabase keys |
| 3 | Real dashboard | 🟡 In progress |
| 4 | Workouts + body | ⬜ Not started |
| 5 | Tasks + goals | ⬜ Not started |
| 6 | Money (read from the sheet) | ⬜ Not started |
| 7 | Winter Arc season + custom trackers | ⬜ Not started |
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
- [ ] Sign in on the phone at the live link (waiting for Supabase's 2-emails-per-hour limit to reset)
- [ ] Test: sign in on the phone and save today's check-in (Phase 2 "done when")
- [ ] Moved to Phase 3: phone home screen with the tab bar (`Phone.dc.html`), since it shows real dashboard data

## Phase 3 checklist
- [x] Real data on `/` with the same tiles as `/demo`: today's status, streak, 7-day averages, this week vs weekly targets, 4-week habit grid (`src/lib/dashboard/`)
- [x] Empty states that say what to log (season, money, weight, goals, inbox, board)
- [x] Tapping a yes/no row on Today saves it and the numbers update straight away; `/log` refreshes `/` on save
- [x] Phone home screen with the floating tab bar (`Phone.dc.html`): Today, Arc, Board, Money tabs + round Log button, shown under 640px on `/` and `/demo`
- [x] Fixed: "Log Today" button text was teal on teal (global link colour won); plain links only get the teal now
- [x] Checked at 375px and desktop on `/demo` and on the real builder with test rows; `npx hig-doctor .` clean
- [ ] Yasir: sign in on the live site and check `/` shows his real numbers, and that ticking a row updates them (Phase 3 "done when")

## Sign-in rules (20 Oct 2026)
- [x] Same browser stays signed in (login cookie lasts 400 days and refreshes on each visit)
- [x] Each device is signed out 7 days after its sign-in, with a clear message on `/login` (`src/lib/session.ts`, `src/proxy.ts`)
- [ ] Phase 8b: connect Gmail at sign-in so both renew on the same day (note in `docs/BUILD_PLAN.md`)

**Next up:** the phone test (closes Phase 2), then Yasir checks `/` signed in (closes Phase 3). Winter Arc shows "No season running yet" until a season row exists (start date is set in Phase 7). Note: Supabase's built-in email allows only 2 sign-in emails per hour; custom SMTP would lift that.
