# Progress

| Phase | Name | Status |
|---|---|---|
| 0 | Setup: scaffold, git, GitHub, Vercel | ✅ Done (19 Oct 2026) |
| 1 | The look (demo data only) | ✅ Done (19 Oct 2026) |
| 2 | Database + login + daily check-in | ✅ Done (20 Oct 2026) |
| 3 | Real dashboard | ✅ Done (20 Oct 2026) |
| 4 | Workouts + body | ✅ Done (21 Oct 2026) |
| 5 | Tasks + goals | ✅ Done (21 Oct 2026) |
| 6 | Money (snapshots via the API) | ✅ Done (26 Oct 2026) |
| 7 | Winter Arc season + custom trackers | ✅ Done (21 Oct 2026) |
| 8 | Automation (logging API) | ✅ Done (26 Oct 2026) |
| 8b | Mail nudges | ❌ Dropped (27 Oct 2026), code deleted |
| 8c | Instinct link | ❌ Dropped (27 Oct 2026), code deleted |
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
- [x] Migration run in Supabase (26 Oct, via the SQL editor); snapshot insert dry-run in a rolled-back transaction: accepted, row-level security on, 0 rows left
- [x] `API_TOKEN` in Vercel (Production), redeployed. Live tests: summary 200 with real data; wrong/missing token 401; unknown tracker, bad value, future date, bad money body all 400; a real `/api/log` save (today's sleep value written back unchanged) 200
- [x] Fixed: `/api/log` said `"ok": true` when nothing was saved; now `"ok": false` with the skipped list
- [x] Signed-in pages at 375px (inside a 375px frame on the live site): no sideways scroll; "Back to dashboard" on workout and body pages raised to 44px
- [x] Finance task connected (26 Oct): its first tries were refused (one 401 wrong token, one 400 bad field; Vercel logs didn't say which field)
- [x] `/api/money` now accepts amounts as text ("₹12,000", "48%"), names the exact bad field and list position, and logs the reason (no amounts) in Vercel
- [x] First real snapshot saved 26 Oct, 10:37 PM (201); Money tile checked live at laptop and phone size. The finance task now sends one at 8:45 AM and 8:45 PM
- [x] Fixed: a long card name pushed its amount onto a hidden second line; names now shorten with "…" and amounts always show

## Final pass (26 Oct 2026, overnight)
- [x] New address `/winter-arc` (and `/demo/winter-arc`) opens the Winter Arc page; switching to it keeps `#winter-arc` in the address so a refresh stays there
- [x] Clicked through `/demo` (all views and phone tabs), `/demo/winter-arc`, `/demo/log`, `/demo/progress`, `/login`, and signed-out `/`, `/log`, `/settings`, `/progress` at 1440px and 375px: no sideways scroll, no tap targets under 44px on the phone, no console errors
- [x] Live, signed in (laptop width): `/`, `/winter-arc`, `/log`, `/settings`, `/progress` load with no errors; Money shows its empty state (table not created yet); `/api/summary` answers 503 until `API_TOKEN` is set

## Cleanup for speed (27 Oct 2026)
- [x] Mail nudges (8b) and the Instinct link (8c) dropped for good: Inbox and Instinct views, the Instinct status pill, their demo data, types and state deleted; their env placeholders removed
- [x] Migration `20261027000001_drop_nudges_instinct.sql` (drops `instinct_requests` and `mail_nudges` if they exist). Checked read-only in Supabase: neither table exists, so there was nothing to run
- [x] Dead code (`npx knip`, config in `knip.json`): removed the unused Stats, Due today, Overdue, Lift progress and Weight tiles, the Sparkline, their data (`stats`, `lifts`), 3 unused icons, 4 unused colour tokens and a few unused helpers; knip now reports nothing
- [x] `npm prune`; build cache cleared and rebuilt; `/demo` checked at 1440px and 375px (all views and phone tabs, check-in pages, share card): no sideways scroll, no small tap targets, no console errors; `npx hig-doctor .` clean
- [x] CLAUDE.md rule: keep the code lean, no hidden or parked features. Docs (CLAUDE.md, DESIGN.md v6.2, BUILD_PLAN.md, README) updated

## Tonight in 5 lines (26 Oct 2026)
1. Layout split, rename to Yasir OS and the share card were already done and live, so they were skipped.
2. New API for Claude's scheduled tasks: log tracker values, read today's summary, push money snapshots, all behind one token.
3. Money tile now shows real snapshots: wallet stack per bank and card, left to spend, spend vs income, 50/20/30 vs target, top spends.
4. `/winter-arc` now has its own address; every page checked on laptop and phone width.
5. Money goes live after you run one migration and add `API_TOKEN` (morning checklist at the top).

**Next up (old note):** Phase 6 (money from the Personal Finance sheet; get the sheet's cell map from Claude chat first). Optional: use Reset test data in /settings before 26 Oct so Winter Arc starts clean. Supabase's built-in email allows only 2 sign-in emails per hour.

## Tasks API + Board (26 Oct 2026, night)
- [x] Migration `20261027000002_tasks_api.sql`: tasks get `note`, `sort_order`, `external_id` (unique per user; app-made tasks get `app-…` automatically), `updated_by` (Yasir/Claude). Status, owner, area, due date, updated_at were already there. Run in Supabase by Claude (26 Oct, SQL editor via Chrome): success
- [x] `POST /api/tasks` (one or many, upsert by external_id; new tasks need a title, known ones change only what's sent), `GET /api/tasks` (`?status=todo,doing`), `DELETE /api/tasks/:external_id`, same `API_TOKEN`. API says owner `Yasir`, the database keeps `Me`. Documented in `docs/API.md`
- [x] Board: To do · In progress · Waiting on others · Done. Cards show owner chip, area, due date (yellow within 3 days, coral overdue) and note; most important first. Drag between columns on the laptop; tap a card to edit (title, note, area, due, who's on it, column, delete); "Add task" opens the same sheet. Done shows the latest 20 with "Show all"
- [x] Overview's In progress tile and the phone Board tab use the same tasks; `/demo` stays on fake tasks
- [x] Top priority pin: the open "Home" task with the highest order shows as a slim card at the top of Overview (laptop and phone), with its due date; tap opens the Board
- [x] Plan (31 phases, 5 sections) and 4 Claude jobs loaded through the live API; tasks API returns the new fields
- [x] Checked on `/demo` at 1440px and 375px: drag, edit, add, pin; no sideways scroll, no phone targets under 44px, no console errors. `npx hig-doctor .` clean, knip clean, build passes
- [x] Live API test on the real database: create, partial update (status only), new task without title refused (400), `?status=done` filter, delete, second delete 404. The test task was deleted afterwards

Build complete. From here: improvements only.

## My Day, calendar, Claude's jobs, owner tags, action gate (27 Oct 2026)
- [x] Migration `…_my_day_gate_jobs.sql`: tasks get `next_steps`, `questions`, `chat_name`, `gate_quiet_until`; new tables `gate_log`, `claude_jobs`, `day_plans` (row-level security on). Run in Supabase by Claude (27 Oct): success
- [x] **My Day** on Overview (laptop and phone): Now / Next from the day plan (India time, moves on by itself), the full day with the current phase marked, and folded Meals, Gym A / B, Skin, hair, body, Prep, Stock list. The plan is data in Supabase, sent through `POST /api/day-plan`; `/demo` has a made-up one
- [x] Yasir's Winter Arc Day plan (v3.1) retimed for the 1:30–10:30 PM shift: wake 7:30, gym 7:50, build block 10:00, ride 12:40, breaks 3:30 / 5:45 / 8:45, home 11:00, lights out 12:30 (7 h). Sat/Sun off: Saturday gym B, prep 10:30, Claude 4 h; Sunday rest, review 8:30 PM
- [x] **Calendar feed** `/api/calendar.ics?token=SHARE_TOKEN`: weekly repeating phases + all tasks with due dates as all-day events; subscribe with `webcal://` (signed in, `/progress` has a **Subscribe in Calendar** button). Subscribed on the Mac by Claude (27 Oct): iCloud calendar "Yasir OS", refresh every hour, so it syncs to the iPhone too. Live: 47 weekly routine events + 26 task days, 200 with the right token, 404 with a wrong one
- [x] **Claude's scheduled tasks**: `GET/POST /api/claude-jobs` (by name, same token) and `DELETE /api/claude-jobs?name=`, shown in a separate panel beside the Board (under it on smaller screens)
- [x] **Owner tags**: Claude orange `#D97757`, Me soft teal, Both neutral
- [x] **Action gate**: opens first on every visit for open tasks due within 3 days (overdue first, negative sort_order jumps the queue, max 3, one at a time). Dashboard blurred and locked; no close. Done · Doing it now · Snooze to tomorrow (hidden when more than a day overdue) · Move date. Each answer quiets the task until midnight IST and is logged in `gate_log`. Tasks API takes `next_steps`, `questions`, `chat_name`; a note "Next: … | Chat: "…"" works as a fallback
- [x] Plan (31 phases, 5 sections) and 4 Claude jobs loaded through the live API; tasks API returns the new fields
- [x] Checked on `/demo` at 1440px and 375px: gate (Esc does nothing, keyboard works, all 3 answers), My Day, Board + jobs panel; no sideways scroll, phone targets 44px. knip, hig-doctor, lint and build clean
- [x] `DELETE /api/claude-jobs?name=` added (27 Oct); "Bryan Johnson digest" and "Daily brain sweep" removed from the panel through it

## Run 29 Oct 2026: layout, M11, M12, M10, M4, M5
- [x] Layout: sidebar Overview · Winter Arc · Board · Check-in (opens /log; /demo/log on the demo); trackers tree and "+ New tracker" gone from the sidebar (New tracker lives in /settings); no "Log Today" in the page header; phone round button says Check-in; Overview has no pinned banner and no My Day. Their code, demo plan and types deleted; day_plans table and /api/day-plan kept for the calendar
- [x] M11 calendar: `&cat=` gives 9 coloured feeds (`X-WR-CALNAME` "Yasir OS · <Name>", `X-APPLE-CALENDAR-COLOR`); no `&cat` = old all-in-one feed. Phases take optional `cal`, with fallback rules checked against the live plan (31 phases). /settings → Calendar lists the 9 webcal links with copy buttons and colour dots; /progress "Subscribe in Calendar" goes there. Feed builder moved to `src/lib/calendar-feed.ts`
- [x] M5 code: phases take `from`/`until`; on those dates a dated phase replaces the undated one at the same start time; the feeds split weeks into date ranges with `RRULE UNTIL` (checked on the real plan: no doubles, Breakfast shortens to 20 min on exam days). Plan change waits for the deploy
- [x] M12 gallery code: private bucket `gallery` (25 MB, PNG/JPG/SVG/PDF/WebP) + `gallery_items` with row-level security (migration `…_gallery.sql`, run in Supabase by Claude: success). `POST /api/gallery` with an upload-only key (GALLERY_TOKEN, else HMAC of API_TOKEN): multipart for small files, signed upload link + confirm up to 25 MB; type checked from the file's own bytes; originals stored byte-for-byte. Key saved to `~/Claude/yasiros-gallery-key.txt`. Gallery in the sidebar and phone tabs: category tabs, thumbnail grid, full-size viewer (Fit / Actual size, pinch zoom), Download original, Share (file), Delete with confirm. Demo on 5 made-up images
- [ ] NEXT (usage limit hit here): M12 live test: 3000 px+ PNG up and back, bytes compared
- [x] M10 PWA (29 Oct, cloud session): `src/app/manifest.ts` ("Yasir OS", standalone, theme `#f6f8fa`, icons 192/512/maskable 512 in `public/icons/`), apple-touch-icon 180 + `appleWebApp` metadata, hand-written `public/sw.js` (cache-first `/_next/static` + `/icons`, network-first pages with the last copy as fallback, `/offline` page precached with its CSS, sign-out clears saved pages, `?t=` share links never cached; `sw.js` sent no-cache). Checked on /demo in Chromium: worker activates, visited page opens offline, unvisited page shows the offline card
- [x] M10 sign-in code: /settings → "Sign in on another device" shows an 8-character code (HMAC of user id + minute with SUPABASE_SERVICE_ROLE_KEY; only that minute is stored, in app_metadata). Works once, 10 minutes, only the newest code, 5 wrong tries end it, only ALLOWED_EMAIL. /login → "Have a code?" → server checks it, makes a magic-link token with the admin API, verifies it on that device. 12/12 logic tests pass against a fake admin API; wrong-code message checked on /login at 375 and 1440. knip, hig-doctor, lint, build clean
  - [ ] Live: Add to Home Screen on the iPhone (icon, name, opens without Safari bars); make a code in /settings on the laptop and sign in with it in the home-screen app; airplane mode → offline page
- [x] M4 check-in matches the day plan (29 Oct, cloud session): new tracker types `time_of_day` (lights out, wake) and `choice` (7 meal slots: Planned / Swapped / Skipped, default Planned), a `group_name` so Meals and Blood pressure (morning + evening, systolic/diastolic) each share one card, and Reading page. All data: migration `20261030000001_day_plan_log.sql` adds the 14 trackers to the existing account. Blank typed numbers aren't saved (no stale BP). Today shows Meals and BP as one row each; season targets and goals skip the new types. /demo/log on fake values. Normal day = 5 actions (evening BP ×2, one swap, page, Done). knip, hig-doctor, lint, build clean; /demo and /demo/log at 1440, 390, 375: no sideways scroll, no phone targets under 44px, no console errors
  - [ ] Live: run the migration in Supabase **before** this deploys, then open /log on the iPhone (meal names are placeholders: Pre-gym, Breakfast, Lunch, Snack 1, Dinner, Snack 2, Night)
- [x] M5 plan change posted (29 Oct): +Exam revision 10:00 Mon–Fri from 2 Nov; +Walk 07:50 and +Leave for exam 09:40 on 17–21 Nov; 31 → 34 phases, nothing else changed
- [ ] Finish: build, knip, hig-doctor, lint, /demo at 1440 + 375, docs, deploy, live checks


## Final build checklist (30 Oct 2026, cloud session): Soft bento + close every queued item
Baseline: `npm ci`, build, lint, `tsc --noEmit` all clean (30 Oct). M4 + M10 + a hotfix (check-in works before the M4 migration) pushed and live on Vercel.

- [ ] 1. Remove Apple HIG skills (`.claude/skills/hig-*`, `skills-lock.json`, `.higauditignore`), hig-doctor rule, v6 tokens and dead code
- [ ] 2. Soft bento tokens + Inter / JetBrains Mono via next/font
- [ ] 3. Overview bento (hero, next up, money, check-in, today, weight, 1RK fund, diet, study, Claude's jobs)
- [ ] 4. One SVG `LineChart`: weight, steps, sleep (Health), Winter Arc consistency
- [ ] 5. Own pages: /board, /money, /health, /winter-arc, /gallery (+ /demo twins)
- [ ] 6. Layout cleanup (29 Oct): verify Check-in nav item, no Log Today button, no banner / My Day
- [ ] 7. M4 /log: + weight in the check-in (migration), verify the rest
- [ ] 8. M5 exam mode: verify plan code (data already posted 29 Oct)
- [ ] 9. M10 PWA: theme `#FFF5E6`, "Y" mark icons, shell-only cache, installable
- [ ] 10. M11 calendar feeds + M12 Gallery: verify, restyle; gallery API 503 "Gallery key not set"
- [ ] 11. Claude's jobs: last run "2h ago" + status dot
- [ ] 12. Restyle Board, gate, /log, /settings, /login, /progress, forms
- [ ] 13. Every route at 390 + 1280, API with and without auth, docs, push, Vercel green
