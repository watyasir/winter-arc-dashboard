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
**What got built:** Next.js 16 app (App Router, TypeScript, Tailwind 4) with a placeholder "Winter Arc Dashboard" card on Catppuccin Latte colours. 14 Apple HIG skills in `.claude/skills` (`npx hig-doctor .` reports clean). `.env.example` with empty placeholders for every later phase. Public repo `watyasir/winter-arc-dashboard`, auto-deploying to https://yasiros.vercel.app (originally a winter-arc-dashboard address, renamed 26 Oct).
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

## Session 7 — 21 Oct 2026 — Phase 5: Tasks + goals
**Goal:** Real tasks and goals, with tiles for today's tasks, overdue tasks and goal progress, and a Board that runs on real tasks.
**What I asked Claude Code to do:** "Mark Phase 4 done. Do Phase 5: tasks (title, area, due date, done) and goals (target, deadline, progress linked to a tracker or manual). Tiles for today's tasks, overdue and goal bars; Board on real tasks. v6 design, /demo stays fake. Keep it lean."
**What got built:**
- Two new tables, each locked to its owner: tasks (title, area, due date, Board column, who's on it) and goals (target, unit, deadline, and either a linked tracker or a typed-in number). A small database view adds up a linked tracker since the goal started, e.g. study hours or workout days.
- Board: To do / In progress / Waiting / Done on real tasks. "Add task" opens a small form in that column (title, area, due date) and stays open for the next one. Each card has a column picker to move it, and a delete button.
- Overview: "Due today" and "Overdue" tiles, where a tick moves the task to Done; In progress lists real tasks. On the phone, the Today tab lists overdue and due-today tasks under Focus.
- `/log/goals`: add a goal, update typed-in progress, delete. The Goals tile shows real progress bars with "by 24 Dec", "Reached" or "Deadline passed".
- `/demo/log/goals` and the demo Board run on fake tasks and goals; changes stay on the page.
**What broke and how we fixed it:**
- hig-doctor flagged the cursor jumping into the Add task box on its own (autoFocus). It now moves there only after tapping "Add task".
- A demo goal used coral, which means "overdue". Switched to a neutral tone.
**What Yasir had to do himself:** Nothing. The migration ran in his Supabase SQL editor through Chrome.
**Screenshot to take:** `/demo` laptop view of the Due today, Overdue and Goals tiles; the Board view; `/demo/log/goals` on a phone.
**Next:** Add a few real tasks and a goal. Then Phase 6 (money from the sheet).

## Session 8 — 21 Oct 2026 — Phase 7: Winter Arc season + custom trackers
**Goal:** Schedule Winter Arc ahead of time, show the season on the hero card, add trackers without code, and clear test data.
**What I asked Claude Code to do:** "Start Winter Arc with a date picker, my season from Mon 26 Oct, 90 days, a target per tracker; 'Starts in X days' before then. Hero: day X/90, days left, % targets hit, current and best streak. /settings: add a tracker; Reset test data with a confirm step."
**What got built:**
- `/settings` (signed in only):
  - **Winter Arc:** a date picker for day 1, plus a switch and daily target per tracker. A day counts as "all targets" when every switched-on tracker hits its target.
  - **New tracker:** name, area, type (yes/no, number, minutes, 1 to 5), unit, and a daily or weekly target. It shows up in the check-in and on the dashboard straight away.
  - **Reset test data:** deletes entries, workouts, body checks, tasks and goals after a confirm step. Trackers, the season and the goal weight stay.
- Hero card: before day 1 it counts down ("5 days to go"), the same on the phone ring. Once started it shows day X of 90, days to go, % targets hit, streak, best streak and missed days.
- Ways in: "+ New tracker" in the sidebar, "Start Winter Arc" on the empty hero card, and "Season and trackers" on `/log` for the phone. The demo hides them (nothing to change there).
- Yasir's season was set up directly in the database: day 1 is Mon 26 Oct 2026.
**What broke and how we fixed it:**
- `/settings` needs sign-in, so the browser check ran the same screen on a throwaway local page with fake data, then the page was deleted. The countdown math was checked with a small script against the real dashboard code.
**What Yasir had to do himself:** Nothing. Yasir also clarified the design rule: stay on the v6 look, but layout changes are fine where a feature needs them.
**Screenshot to take:** `/` on the phone before 26 Oct ("Starts in 5 days"); `/settings` on the phone.
**Next:** Phase 6 (money). Optionally reset test data before 26 Oct.

## Session 9 — 21 Oct 2026 — Polish + speed
**Goal:** Go back over Phases 5 and 7, polish rough edges, make the dashboard load fast, finish anything left open.
**What I asked Claude Code to do:** "Go through all you've done and see where polish is required, make the site load quickly (the dashboard is slow after check-in), complete any unfinished work."
**What got built:**
- Speed: the server code now runs in Mumbai, next to the database. It had been running in the US, so every database read crossed the world (~250 ms each, several per page). Sign-in is now checked from the login token's signature on the server instead of asking Supabase each time, and the dashboard and check-in read everything at once instead of one after another.
- Polish: `/settings` no longer crashes after adding a tracker; done tasks stop showing due dates; two goals with the same name no longer clash.
- Docs: committed the mail-nudges plan for Phase 8b, reworded the design freeze to Yasir's rule (stay on v6, layout changes fine where needed), and closed stale checklist items.
**What broke and how we fixed it:**
- Found by reading Vercel's response header: `bom1::iad1` meant Mumbai edge, US server. A one-line `vercel.json` region fixed it; the header now reads `bom1::bom1`.
**What Yasir had to do himself:** Nothing.
**Screenshot to take:** none (speed); before/after timings are in this entry.
**Next:** Phase 6 (money), where the targets per tracker get finalized.

## Session 10 — 26 Oct 2026 — Cleanup + Phase 9: Share + portfolio polish
**Goal:** Hide the parked Inbox and Instinct, build a shareable Winter Arc card, write the README.
**What I asked Claude Code to do:** "Hide Inbox and Instinct (keep the code). Phase 9: a /progress page with a shareable Winter Arc card, a Copy link button, public through a secret SHARE_TOKEN, working on /demo. Then a README."
**What got built:**
- Inbox and Instinct are gone from the sidebar, the header pill and the Overview on `/` and `/demo`; their code stays in `src/modules`. Today and Money now share their row.
- `/progress`: one dark teal card sized for a phone screenshot with day X of 90, current and best streak, % targets hit this week (last week on Mondays), workouts this week and weight change. "Copy link" underneath; if the clipboard is blocked it shows the link to copy by hand. A "Share progress" link sits on the Winter Arc hero.
- The public link works with `?t=<SHARE_TOKEN>`. The numbers are worked out on the server and only the card is sent; a wrong or missing token shows "not found". The page asks search engines not to index it and doesn't pass the link on to other sites.
- `/demo/progress` shows the same card on fake data with a "Sample data" chip.
- `README.md`: what it is, screenshot list, stack, how it grows, how it was built with AI.
**What broke and how we fixed it:**
- With no one signed in, the database's row locks hide everything, so the public card reads with the Supabase secret key, and every query in that path filters to the owner's account itself.
- The app streams pages, so a wrong token can't change the HTTP status after the page starts; it still shows only the "not found" screen.
**What Yasir had to do himself:** add `SHARE_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
**Screenshot to take:** `/demo/progress` on a phone (the whole card fits one screen).
**Next:** Phase 6 (money).

## Session 11 — 26 Oct 2026 — Design v6.1: life Overview + Winter Arc page
**Goal:** Split the dashboard: the Overview covers the whole life, Winter Arc gets its own page, on laptop and phone.
**What I asked Claude Code to do:** "Apply the v6.1 changelog and match LifeOverview and WinterArcPage: sidebar Overview, Winter Arc, Board, Trackers; Overview = whole life with a Day X/90 chip; a Winter Arc page with the strip, targets this week, streaks and a 13-week chart; phone Today and Arc tabs to match."
**What got built:**
- Sidebar: Overview, Winter Arc, Board, and Trackers (the trackers-today list folds out under it).
- Overview: Today, Tasks, Money / Body, Workouts, Goals / Habits, In progress. New Tasks tile (overdue, today, next due) and a compact Body tile. Winter Arc is now just a dark "Day X/90 · Winter Arc →" chip in the header.
- Winter Arc page: the dark teal hero with the 90-day strip, targets this week per tracker, streaks per tracker (now and best), and a 13-week bar chart of % targets hit, with a summary line and labels on the right. "Share card" in the header opens the Phase 9 card.
- Phone: Today tab is the life Overview in one column (with a 2×2 of Body, Workouts, Goals and Money, and a 2-week habits grid); Arc tab is the Winter Arc page stacked. The phone tabs now follow the same view as the laptop, so tapping the chip or "Open Board" switches tabs.
- The per-tracker numbers are worked out in the same builder as everything else, so `/` and `/demo` share one shape.
**What broke and how we fixed it:**
- On a phone, the Arc tab scrolled sideways (443px on a 375px screen). Hidden screen-reader labels inside the scrolling chart escaped its scroll box. Making the box the labels' anchor fixed it.
- hig-doctor flagged 12 issues, all inside the new mockup HTML files, not the app. The mockups are now excluded from the audit.
**What Yasir had to do himself:** nothing.
**Screenshot to take:** `/demo` Overview and Winter Arc page on a laptop; the phone Today and Arc tabs.
**Next:** Phase 6 (money).

## Session 12 — 26 Oct 2026 — Rename to Yasir OS, old link removed, speed
**Goal:** Rename the product, move to one web address, stop sign-in from opening the check-in, and make moving around faster.
**What I asked Claude Code to do:** "Rename to Yasir OS (repo yasiros), new address yasiros.vercel.app, disable the old link everywhere. Don't open the check-in when I sign in. Switching and page changes are slow, make it faster."
**What got built:**
- Product name Yasir OS everywhere; GitHub repo and Vercel project renamed `yasiros`; https://yasiros.vercel.app is the only address (the old one returns 404 and is gone from Supabase's sign-in list).
- Sign-in lands on the dashboard. The check-in opens only from Log Today.
- Speed: pages you just visited are reused for 2 minutes; Log Today and the back links load their page in advance; and only the layout on screen (phone or laptop) is drawn, instead of both.
**What broke and how we fixed it:**
- Measured first: in-page switches were fine on a laptop (~60 ms) but did double work; page changes waited on the server every time (190 ms warm, up to 760 ms when Vercel starts a fresh server). Caching and preloading hide the server wait.
- The first preload didn't help: with this Next.js setup, a preload skips anything that depends on the login cookie. Marking the check-in's data as a private cache let the preload include it: Log Today went from 300–760 ms to 14 ms.
**What Yasir had to do himself:** sign in once on the new address.
**Screenshot to take:** none.
**Next:** Phase 6 (money).
