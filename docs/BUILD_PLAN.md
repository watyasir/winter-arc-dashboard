# Build Plan: Winter Arc Dashboard

One phase = one Claude Code session. Each phase ends with something that works and that you can see. Paste the **kickoff prompt** to start that session. Don't start a new phase in the same session; start a fresh session for it (this keeps usage low).

---

## Phase 0: Setup (you do most of this, ~20 min)

**You do:**
1. Create free accounts: GitHub, Supabase, Vercel (sign up to Vercel *with* GitHub).
2. Install Claude Code if it isn't already, and open it in an empty folder named `winter-arc-dashboard`.
3. Copy `CLAUDE.md` and the `docs/` folder from this brief into that folder.
4. Ask Claude Code to install the Apple design skills: `npx skills add raintree-technology/apple-hig-skills` (MIT, 14 Apple HIG skills plus the `hig-doctor` audit). Run `npx hig-doctor .` at the end of every phase to catch design-rule misses.

**Kickoff prompt:**
> Read CLAUDE.md and docs/BUILD_PLAN.md. Do Phase 0: create the Next.js + TypeScript + Tailwind project in this folder, set up git, create .env.example, create docs/PROGRESS.md from the phase list, and a placeholder home page that says "Winter Arc Dashboard". Then walk me step by step through pushing it to a new GitHub repo and deploying it on Vercel. Stop after it's live.

**Done when:** a live Vercel link shows the placeholder page.

---

## Phase 1: The look (demo data only)

Build the full dashboard **visually**, on fake data. It's the most satisfying phase and your first portfolio screenshot.

**Kickoff prompt:**
> Phase 1. Read docs/DESIGN.md and the files in docs/design-reference/. Build the design tokens (Catppuccin Latte, light only) and the full dashboard at /demo with fake data from src/data/demo: sidebar with rainbow folders and trackers tree, header card with dashed rule, Overview (season strip, stats with sparklines, Today, Inbox preview, Money, Weight, Goals, Habits, In progress), plus Inbox, Board and Instinct views switched from the sidebar, all on fake data. Match the reference files exactly. Show me how to view it.

**Done when:** `/demo` looks finished on phone and laptop.

---

## Phase 2: Database + login + daily check-in

**You do:** create a Supabase project, then paste its URL and keys into `.env.local` and Vercel when Claude Code asks.

**Kickoff prompt:**
> Phase 2. Set up Supabase: tables for trackers, entries, seasons (with migrations), row-level security so only the logged-in user sees their data, and email magic-link login allowed only for ALLOWED_EMAIL. Seed my default trackers (sleep hours, water, workout done, study minutes, skincare done, hair routine done, mood 1-5, steps). Build /log: a phone-friendly daily check-in that takes under 60 seconds. Tell me exactly what to paste where.

**Done when:** you can log in on your phone and save today's check-in.

---

## Phase 3: Real dashboard

**Kickoff prompt:**
> Phase 3. Make / show my real data using the same tiles as /demo: today's status, streaks, 7/30-day trends, weekly targets hit. Empty states should say what to log. Keep /demo working on fake data.

**Done when:** the dashboard updates the moment you log.

---

## Phase 4: Workouts + body

**Kickoff prompt:**
> Phase 4. Add workouts (session date, exercises, sets x reps x weight) with a fast "repeat last workout" button, and weekly body check (weight, waist, chest, arms, progress photo yes/no). Add tiles: workouts this week, lift progress per exercise, weight trend vs target.

---

## Phase 5: Tasks + goals

**Kickoff prompt:**
> Phase 5. Add tasks (title, area, due date, done) and goals (title, area, target, deadline, progress linked to a tracker or manual). Tiles: today's tasks, overdue, goal progress bars.

---

## Phase 6: Money (read from your sheet)

**You do:** a one-time Google Cloud setup so the app can *read* the Personal Finance sheet (Claude Code will guide you). Share the sheet with the service account as **Viewer only**.

**Kickoff prompt:**
> Phase 6. Read-only connection to my Personal Finance Google Sheet using a Google service account (sheet ID in env, never in code). Read the current month's income total, expense total, per-category spends, card dues and available spendable from the PERSONAL tab. Cache it for 1 hour. Tiles: this month's spend vs income, top categories, needs/wants/savings split, savings goal progress. Never write to the sheet.

> Before this session, ask Claude (chat) for the exact cell map of the sheet so Claude Code reads the right rows.

---

## Phase 7: Winter Arc season + custom trackers

**Kickoff prompt:**
> Phase 7. Add seasons: a "Start Winter Arc" button that sets today as day 1 of 90, with targets per tracker. Show day X/90, days left, % targets hit, best streak. Add /settings where I can create a new tracker (name, area, type, unit, target) without code, and it appears in /log and on the dashboard automatically.

**Done when:** you can add something new to track in 30 seconds.

---

## Phase 8: Automation (less work for you)

**Kickoff prompt:**
> Phase 8. Add a secure logging API (POST /api/log with a secret token) so my Claude scheduled tasks can log entries for me. Add a daily summary endpoint that returns today's missing logs and the Winter Arc status as JSON. Document both in docs/API.md.

**After this:** Claude (chat) connects your existing scheduled tasks to it, so check-in reminders and logs from Instinct reach the dashboard without you.

---

## Phase 8b: Gmail inbox

**You do:** one-time Google Cloud setup (Claude Code walks you through it) and sign in with Google once a week when the app asks.

**Kickoff prompt:**
> Phase 8b. Add the Inbox view from the design: Google OAuth with Gmail read/modify scopes, mailbox list (Inbox, Follow up, Waiting, Instinct, Bank), message list, reading pane, Reply and Archive. Show a "Reconnect Gmail" banner when the token expires. Never store email bodies in the database.

## Phase 8c: Instinct link

**Kickoff prompt:**
> Phase 8c. Add the Instinct view from the design: instinct_requests table and API, the header status pill (waiting → answered → disappears), the "What Instinct can see" switches, a read-only /instinct page protected by a secret token that shows the current picture as plain text for only the switched-on categories, and a 7:30 AM IST digest email to Instinct.

## Phase 9: Share + portfolio polish

**Kickoff prompt:**
> Phase 9. Add a "progress card" page that shows my Winter Arc stats in a shareable layout (for my accountability group). Then write a strong README: what it is, screenshots from /demo, stack, how it grows, and a short "how I built it with AI" section drawn from docs/BUILD_LOG.md.

**Done when:** the GitHub page reads like a case study.

---

## Later ideas (not planned yet)
- German practice tracker, reading log, trips and "cool stuff" bucket list with saving goals
- Weekly review page fed by the Sunday review task
- Install as a phone app (PWA)
