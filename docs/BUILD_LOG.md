# Build Log

How the Winter Arc Dashboard was built, session by session, by directing Claude Code. This file becomes the portfolio case study.

## Session 0: 18 Oct 2026: Planning (Claude chat)
**Goal:** Decide what to build and how.
**What happened:** Looked at 4 Instagram life-dashboard examples (a clean "at a glance" Claude-built page, a dark all-in-one paid dashboard, a Google Sheets habit system, a list of Claude weekend projects). Picked the clean editorial look, plus a sheet-style habit grid for logging.
**Decisions:**
- Build it as a real web app with Claude Code, not as a chat artifact
- Build it phase by phase, one phase per session, to keep usage low
- Public demo mode with fake data, with real data behind a login
- Money stays in the existing Google Sheet; the app only reads it
- Generic "trackers" so new life areas can be added without new code
**Next:** Phase 0: setup and first deploy.

## Session 1 — 18–19 Oct 2026 — Design (Claude chat, Claude Design canvas)
**Goal:** Lock the look before any code.
**What happened:** Four design passes on a Claude Design canvas: editorial v1 → Apple HIG v2 (after reading all 173 pages of Apple's Human Interface Guidelines, saved as a private archive) → light "Winter dawn" v3 with Inbox, Board and Instinct views → v4 in the style of Yasir's Obsidian theme AnuPpuccin (Catppuccin Latte card layout).
**Decisions:** light theme only; one fluid layout for laptop and 24" monitor; full Gmail inbox (weekly Google re-login accepted); Instinct status pill in the dashboard; Instinct gets a read-only page plus a 7:30 AM digest; AnuPpuccin's GPL code is not copied, only the MIT Catppuccin palette and the general look.
**What Yasir had to do himself:** nothing beyond choices and feedback.
**Screenshot to take:** canvas Overview view and the Instinct view with the status pill showing.
**Next:** Phase 0 (accounts + scaffold), then Phase 1 builds docs/DESIGN.md exactly.

## Session 2 — 19 Oct 2026 — Phase 0: Setup
**Goal:** An empty but real app, on GitHub and live on Vercel.
**What I asked Claude Code to do:** Create the Next.js + TypeScript + Tailwind project, install the Apple HIG skills, set up git, .env.example and PROGRESS.md, make a placeholder page, then get it onto GitHub and Vercel.
**What got built:** Next.js 16 app (App Router, TypeScript, Tailwind 4) with a placeholder "Winter Arc Dashboard" card on Catppuccin Latte colours. 14 Apple HIG skills in `.claude/skills` (`npx hig-doctor .` reports clean). `.env.example` with empty placeholders for every later phase. Public repo `watyasir/winter-arc-dashboard`, auto-deploying to https://winter-arc-dashboard-drab.vercel.app.
**What broke and how we fixed it:**
- Node.js wasn't installed, so Yasir installed the LTS from nodejs.org.
- The default `.gitignore` hid `.env.example` too, so we added an exception for it.
- A privacy check before the first push found real personal details in the design mockups (names, a card number, ticket numbers, money and weight figures) and an email address in CLAUDE.md. All were replaced with made-up sample data or moved to env vars before anything went public, so they're not in the git history.
- `winter-arc-dashboard.vercel.app` was already taken by someone else, so Vercel assigned `-drab`.
**What Yasir had to do himself:** install Node.js, approve the GitHub CLI login (device code), approve the Vercel GitHub app (this repo only). GitHub profile set to private.
**Screenshot to take:** the live placeholder page next to the GitHub repo.
**Next:** Phase 1, the look (demo data only).

## Session 3 — 19 Oct 2026 — Phase 1: The look
**Goal:** The full dashboard, visually finished, on fake data at `/demo`.
**What I asked Claude Code to do:** "Do Phase 1 from docs/BUILD_PLAN.md": build the Catppuccin Latte tokens and rebuild the design mockups as a real dashboard at /demo.
**What got built:**
- All colours and fonts as tokens in one file; components only use token names, never raw colours.
- Small shared pieces (cards, rounded-square checkboxes, chips, switches, sparklines, progress bars).
- A tile registry: every Overview tile is one line in `src/modules/registry.ts`, so new modules plug in without touching the layout.
- `/demo`: sidebar with rainbow folders and a trackers tree, header card with the dashed rule, Overview (season strip, stats, Today, Inbox preview, Money, Weight chart, Goals, Habits, In progress), plus Inbox, Board and Instinct views. Today's checklist, mailboxes, switches and the Instinct pill all work on fake data.
- The home page now links to the demo.
**What broke and how we fixed it:**
- On a phone the 30-per-row season strip turned into tiny dots, so phones show 15 per row (6 rows).
- The weight chart's labels shrank below 11px on a phone; they now scale up on small screens.
- An empty status slot in the header pushed the search box sideways on a phone; it now hides when empty.
- Switching views kept the old scroll position; views now open at the top.
**What Yasir had to do himself:** nothing.
**Screenshot to take:** `/demo` Overview on a laptop, and the Instinct view with the status pill showing (click "Send to Instinct").
**Next:** Phase 2: Supabase, login, and the daily check-in at `/log` (including the phone check-in sheet from the design).

## Session 4 — 20 Oct 2026 — Design v6 "Teal and grey" + privacy check + Phase 2
**Goal:** Move `/demo` to the new v6 look, add a pre-commit privacy check, then start Phase 2.
**What I asked Claude Code to do:** "Commit the design docs, apply DESIGN.md v6 to /demo (grey frame, white cards, deep teal, dark teal hero, pill controls, wallet stack), add a pre-commit privacy check, then do Phase 2."
**What got built:**
- Every colour token renamed to what it means in v6 (`brand`, `sage`, `yellow`, `coral`, `arc`, `cyan`, `ink`, `sub`, `sep`…), so the code reads like the spec. Gradients (frame, card, hero) live as named utilities next to the tokens.
- Grey gradient frame, white cards with a thin grey border, 20px corners.
- Sidebar items, mailboxes, buttons and chips are now pills; the selected one is filled deep teal with white text.
- The Winter Arc season card is the one dark teal gradient "hero" card, with its own light cell colours.
- Money tile: a wallet stack. Each (fake) account is a coloured tab showing its balance; the white front card shows the total. Clicking a tab opens that account's last 5 transactions in the same tile; Escape goes back and puts focus back on the tab.
- Rupee amounts below zero now show a real minus: −₹12,400.
**What broke and how we fixed it:**
- A git lock file left over from the last session blocked the first commit; nothing was running, so it was removed.
- hig-doctor flagged one plain hex colour in the CSS; it now uses a token.
- Pre-commit privacy check (`scripts/privacy-check.mjs`): blocks any commit that adds an email address (example.com is fine), a phone number, a long account or card number, or a .env file. Tested in a scratch copy: real email, Indian and US phones, card and account numbers, and .env.local were all blocked; example.com, .env.example, dates, rupee amounts and SVG numbers went through. The whole existing repo passes. `npm install` switches it on automatically.
- Phase 2: Supabase database (trackers, entries, seasons, each locked to its owner), email sign-in limited to one address, default trackers added on first visit, and the `/log` check-in sheet (plus `/demo/log` on fake data). Tested on the Mac: signed in, saved a check-in, and the database showed 8 trackers and 8 values for the day.
- Supabase project in Mumbai; login URLs set; live on Vercel.
**What broke and how we fixed it (Phase 2):**
- The first Supabase project landed in Tokyo; Yasir made a new one in Mumbai.
- Supabase's free email can't use a custom template, so the sign-in link now carries the login after "#" and `/auth/callback` finishes it. That makes it work from a phone's mail app too.
- The `/log` guard also matched `/login`, making `/login` redirect to itself. Fixed.
- The built-in browser couldn't render Vercel, so the Vercel settings were done in Yasir's Chrome.
- The publishable Supabase key is public by design, so it's a default in code instead of a Vercel setting.
- Supabase only sends 2 sign-in emails an hour on the built-in email service.
**What Yasir had to do himself:** sign in to Supabase, create the Supabase project (Mumbai), click the sign-in link in his email.
**Screenshot to take:** `/demo` Overview on a laptop (hero card + wallet stack), and the Money tile with an account opened.
**Next:** sign in on the phone at the live link, then Phase 3 (real dashboard, including the phone home screen).

## Session 5 — 20 Oct 2026 — Phase 3: Real dashboard
**Goal:** Show real data on `/` using the same tiles as `/demo`, plus the phone home screen with the tab bar.
**What I asked Claude Code to do:** "Tick off Phase 2 if the phone check-in is confirmed, then do Phase 3: my real data on / with the same tiles as /demo, plus the phone home screen with the tab bar. Keep /demo on fake data."
**What got built:**
- One builder (`src/lib/dashboard/build.ts`) turns trackers, entries and the active season into the exact data shape the demo uses, so real and demo share every tile. It works out each day's status (all / most / missed targets), the streak, 7-day averages, this week against weekly targets, and a 4-week habit grid.
- `/` shows the real dashboard when you're signed in, and the welcome card otherwise. First visit adds the default trackers, same as `/log`.
- Tapping a yes/no row in Today saves it right away and the numbers refresh. Saving on `/log` refreshes `/` too.
- Empty states that say what to do next for things not connected yet: season, money, weight, goals, inbox, board.
- Phone home screen under 640px (on `/` and `/demo`): large "Today" title, Winter Arc ring, 2×2 stats, Focus list, Money, and a floating tab bar (Today, Arc, Board, Money) with the round Log button.
**What broke and how we fixed it:** The "Log Today" button text was teal on a teal button (also on the live site). A global "links are teal" rule beat the button's white text. Now only plain links get the teal default. Moving the rule into a CSS layer didn't work because the build flattened it.
**What Yasir had to do himself:** Nothing yet. Still to do: the phone sign-in test (Phase 2), then check `/` signed in.
**Screenshot to take:** `/demo` at phone width: Today tab, then the Arc tab with the season grid.
**Next:** Phone test, then confirm `/` with real data. Then Phase 4 (workouts + body), which fills the Weight tile.

## Session 6 — 20 Oct 2026 — Phase 4: Workouts + body
**Goal:** Log workouts (sets × reps × weight) with a fast "repeat last workout", a weekly body check, and tiles for workouts this week, lift progress and weight vs target.
**What I asked Claude Code to do:** "phase 4"
**What got built:**
- Four new tables: workouts, sets, weekly body checks, and a small settings row for the goal weight. Each is locked to its owner. A workout and its sets save together in one step, so a half-saved workout can't happen.
- `/log/workout`: "Repeat last workout" copies the last session with one tap. Change a weight, hit Save. A new set starts as a copy of the one before. Exercise and workout names are suggested from past ones. Saving also ticks "Workout done" for that day, so the streak and habits stay in step.
- `/log/body`: weight, goal weight, waist, chest, arms, and a yes/no for the progress photo (the photo itself never leaves the phone). The boxes start empty with last week's number shown faintly, so an old number is never saved by mistake.
- Dashboard: a Workouts tile (this week against the target, with Repeat last workout), Lift progress (the heaviest set each session for your top 4 lifts), and the Weight chart, now with the goal line, latest measurements and a "Due" chip after a week.
- The demo runs 8 weeks of made-up push/pull/legs workouts through the same code as the real dashboard.
**What broke and how we fixed it:**
- The demo workout page read the page address before it was ready, which broke the build. It now loads inside a placeholder.
- September showed as "Sept" in Chrome. Dates now use fixed three-letter months everywhere (18 Oct 2026, 26 Sep).
- Another session's dev server was using the folder, so testing ran on a production build on its own port.
**What Yasir had to do himself:** Nothing. The migration ran in his Supabase SQL editor through Chrome.
**Screenshot to take:** `/demo` laptop view of the Weight, Workouts and Lift progress tiles; `/demo/log/workout` on a phone after tapping "Repeat last workout".
**Next:** Push to deploy, then log a real workout and body check. Then Phase 5 (tasks + goals).
