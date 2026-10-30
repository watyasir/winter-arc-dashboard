# Yasir OS: design spec

**Status:** v9 "Playground", 30 Oct 2026. Light only, three themes. This file is the whole spec; the code follows the latest changelog entry (§9). Apple HIG, v6 "Teal and grey" and v8 "Soft bento" are retired.

## 1. Look in one paragraph

A playful bento: a warm page, one dark hero tile and a different soft colour for every Overview tile. Bricolage for big headings and numbers, Inter for words, JetBrains Mono for small uppercase labels. Things move a little when you touch them (tilt, a count-up, confetti for a finished day), never enough to get in the way, and nothing moves with reduced motion on.

## 2. Themes and tokens

Three themes, picked in /settings → Appearance (saved per account in `user_prefs`; Candy until picked; the demo is always Candy). Each theme sets raw `--th-*` values on `<html data-theme="candy|matcha|sunset">` in `src/app/globals.css`; an `@theme inline` block maps them to Tailwind colours. Components only use the colour names, never a hex.

| Token (class) | Candy | Matcha | Sunset | Use |
|---|---|---|---|---|
| `page` | `#F5F1EA` | `#EFF2EA` | `#FBF0EA` | page |
| `ink` / `soft` | `#17152B` / `#55516A` | `#17221A` / `#4F5B4A` | `#2A1613` / `#674B44` | text / secondary text |
| `hero` / `hero-soft` | `#2D2A70` / `#CFCBFF` | `#1F3D2B` / `#C3E5CB` | `#8A2D3B` / `#FFD3CB` | the dark hero tile / its secondary text |
| `dot-on` | `#FFD84D` | `#E6F07A` | `#FFC857` | logged days, Undo, highlights |
| `accent` | = hero | = hero | = hero | links, focus ring, chart line, selected |
| `t-tasks` `t-money` `t-check` `t-today` `t-weight` `t-fund` `t-diet` `t-study` `t-claude` | one per Overview tile, see globals.css | | | Tile `tone` fills |

Fixed in every theme: `card` white, `claude` `#D97757`, states `ok` `#15803D`/`#DCFCE7`, `warn` `#B45309`/`#FEF3C7`, `danger` `#B91C1C`/`#FEE2E2`. Radius 20px tiles (`tile`), 12px items (`item`), pills 999px. Shadows: `tile` (resting) and `lift` (hover, toasts).

Type: `display` = Bricolage Grotesque 800 (headings, big numbers); Inter 500/600/700 (body, labels in sentences); `label` = JetBrains Mono 700, uppercase 11px, 0.08em tracking (tile headings, small labels). All via `next/font`.

`npm run contrast` (scripts/contrast.mjs) reads globals.css and checks every text/background pair in all three themes (ink, soft and accent on every tile fill, the hero, chips, buttons): all ≥ 4.5:1. The saturated check-in fill uses ink for secondary text too.

## 3. Layout

- One fluid layout, max 1240px. Top bar from 561px ("Y" mark, page links, Check-in pill); 560px and under a 6-tab bar at the bottom. Every page has its own address and again under `/demo`.
- **Overview header:** greeting by the hour in India ("Up late" before 5, "Morning" before 12, "Afternoon" before 17, "Evening" before 22, else "Night") + ", Yasir."; one line: weekdays before the shift "Shift at 1:30 PM.", during it "On shift till 10:30 PM.", after "Shift done. Wind down.", Sat/Sun "Weekend off."; a live IST clock and date on the right (hidden on phones).
- **Overview bento** (the only bento, `bento` utility): desktop 4 columns × 158px rows, gap 14px:
  `"hero hero tasks money" "hero hero tasks money" "check today weight weight" "fund diet study claude"`. 960px and under: 2 columns. 560px and under: a 2-column widget grid, gap 12px: hero, check-in + today, tasks, money, weight, fund + meals, study + claude. Tiles are written in priority order (no `grid-flow-dense`).
- Other pages: a 1–3 column grid of Tiles with tones, tops aligned. Board stays a full kanban.

## 4. Overview tiles

- **Hero** (dark): Day N / 90, streak with a flame, 90 round dots (30 a row, 15 on phones): full = `dot-on`, partial = half, today = pulsing ring. Hover or drag across: "Day 12 · Fri 6 Nov · full check-in / partial / missed / ahead". Legend + "N days to <finish>".
- **Next up:** 3 open tasks, overdue first, a round 44px tick. Tick → done, the row slides out, small confetti, toast "Nice. N left." with Undo (reopens it). None left: "All clear." + Board link.
- **Money:** up to 3 bank cards back to front ("All banks" without per-bank data), 22px apart; hover, focus or tap fans them. Total counts up once, then "Updated 8:45 PM".
- **Check-in:** 6 water cups on the Water tracker (0.5 L each, 3 L target). Cup N = N × 0.5 L; tapping the last full cup takes one away; each tap saves. "Finish check-in" → /log, or "✓ Logged today". The first save of the day: big confetti + "Day N logged. Streak X." (once a day per device).
- **Today:** score ring + % + word (<40 "Getting started", ≥40 "Good pace", ≥75 "Almost there", 100 "Perfect day"; weights in src/lib/score.ts), the shift, "Now: <phase>".
- **Weight:** latest kg, the 14-day change (▲/▼ in ink), a scrub chart resting on the last point ("58.2 kg · 12 Nov"). Under 2 days: "Log 2 days to see the trend".
- **1RK fund:** % with a growing bar and "₹X of ₹Y · date", else an empty state.
- **Meals:** 7 chips; a tap toggles planned ↔ skipped and saves; "5/7"; all 7 planned → confetti + "All meals in. Diet day done.".
- **TYBBA:** study hours this week, items due and the next one, Board link. **Claude's jobs:** up to 3 jobs, status dot + word, last run or schedule.

## 5. Interaction and motion

Tilt (max 2.5°) + glare + 4px lift on mouse devices only; touch uses `:active` scale .96. Confetti ≤ 120 pieces on a canvas that removes itself. One toast at a time, bottom centre, 4.5 s, optional Undo. Reminder toasts (tasks due within 3 days, at most 3, one at a time on phones) open the task card to answer. No animation library. `prefers-reduced-motion` turns off tilt, confetti, count-ups and pulses. Every write is optimistic, rolls back with an error toast, and never double-saves.

## 6. Accessibility

Text ≥ 4.5:1 in every theme (checked by `npm run contrast`). Every control is a real button or link with a label, a visible 3px `accent` focus ring and a 44px target (meal chips are 28px on mouse devices, 44px on touch). Charts say their point in words. Never colour alone: states have a word or symbol.

## 7. Copy rules

Plain, short, friendly. Empty states say what to do next; never fake numbers on the real app. Money ₹1,25,000, dates 18 Oct 2026, India time.

## 8. Phone

Designed at 390px first; no sideways scroll; the check-in stays under a minute.

## 9. Changelog (Claude Code: apply the latest entry if the code doesn't match)

- **v9, 30 Oct 2026: "Playground".** Three themes (Candy, Matcha, Sunset) as `--th-*` variables mapped by `@theme inline`; switch in /settings (saved in `user_prefs`, cookie + head script so there's no flash; falls back to Candy). Bricolage display type and mono labels. Overview: greeting header with the shift line and IST clock, a colour per tile, live tiles (task tick + Undo, water cups, meal chips, score ring, fanning wallet, scrub charts, the 90-dot hero) with confetti and toasts. The rest of the app uses the same Tile tones. v8 names renamed (peach → pop, blue → accent-soft, blue-text → accent, sub → soft, surface → page).
- **v8, 30 Oct 2026: "Soft bento".** Replaces v6 everywhere. Tokens in §2, layout in §3. Overview becomes the bento (hero, next up, money, check-in, today, weight, 1RK fund, diet, TYBBA study, Claude's jobs); Winter Arc, Board, Money, Health and Gallery are their own pages with a top bar and phone tab bar (the sidebar, phone home, header chip, Habits and In-progress tiles are gone). One `Tile`, one `LineChart`. The blocking action gate becomes reminder toasts. Apple HIG skills, hig-doctor and the v6 mockups removed.

### History (retired designs)

- **v6.4, 27 Oct 2026:** **My Day** card on Overview (laptop row under Top priority; phone Today tab under the pin): day chip (weekday · shift day / day off), Now (brand tint, time range) and Next (column grey, "at 9:30 PM") panels, then folded lists: Full day (time, teal-ramp dot, title, detail; current phase tinted and `aria-current`), Meals, Gym A / B, Skin, hair, body, Prep, Stock list. Content comes from the database (`day_plans`), never the repo. **Owner tags:** Claude `#D97757` orange tint, Me soft teal `#5E9C96` tint, Both neutral; replaces cyan. **Claude's scheduled tasks** panel beside the Board from 1200px (260px, dashed Claude-orange border, white), under it below; name, status chip (OK sage, Failed coral, Running brand, Scheduled/Paused neutral), schedule, last and next run. **Action gate:** before the dashboard, up to 3 cards one at a time, max 440px, centred over a blurred, inert dashboard (`ink/30` scrim): chip (Overdue/Due today coral, Due tomorrow yellow, N days left brand) + date, "1 of 3", title on one line, "Next:" 2 lines, up to 2 question bullets + "More questions in chat", chat footer with Copy name; buttons Done (the one primary) · Doing it now · Snooze to tomorrow (hidden when more than a day overdue) · Move date (inline date field + Save date). No close, Esc or backdrop dismissal.
- **v6.3, 26 Oct 2026:** Board on real tasks. Columns To do · In progress · Waiting on others · Done; cards show title, note (2 lines), owner chip (Me / Claude / Both), area, due date (yellow within 3 days, coral overdue), most important first. Drag cards between columns (laptop; the column border turns brand); tap a card or "Add task" for one sheet (bottom sheet under 640px, centred panel above): title, note, area, due, who's on it, column, Delete, Cancel, Save as the one primary button. Done shows the latest 20 with "Show all". New slim **Top priority** card at the top of Overview (laptop and phone Today tab): the open Home task with the highest order, with its due date; tap opens the Board.
- **v6.2, 27 Oct 2026:** Inbox (mail nudges) and Instinct (view, status pill, "what Instinct can see", digest) dropped for good and deleted from the code. Views are Overview, Winter Arc and Board. The older mockups (`Main.dc.html`, `Phone.dc.html`) still show them; ignore those parts.
- **v6.1, 26 Oct 2026:** layout split. Overview = whole life (Today, Tasks, Money, Body, Workouts, Goals, Habits, In progress) with Winter Arc reduced to a dark "Day X/90 →" chip in the header. New sidebar page **Winter Arc**: dark teal hero with the 90-day strip, targets this week, streaks per tracker, week-by-week % chart, Share card button. Sidebar: Overview, Winter Arc, Board, Trackers (Inbox and Instinct hidden, parked). Mockups: `docs/design-reference/LifeOverview.dc.html`, `WinterArcPage.dc.html`. Same v6 tokens. **Phone (under 640px):** tab bar stays Today · Arc · Board · Money + round Log button. *Today tab* = the life Overview stacked in one column: greeting + "Day X/90 →" chip, Today checklist, Tasks (due + overdue), a 2×2 of Body / Workouts / Goals / Money summary, Habits grid (last 2 weeks so it fits), In progress. *Arc tab* = the Winter Arc page stacked: hero card (big day number, streak/best/targets row, 90-day strip at 15 cells per row), Targets this week, Streaks as a 2-column grid, Week-by-week chart scrollable sideways if it doesn't fit, Share card button. 44px targets, no horizontal page scroll.
- **v6, 20 Oct 2026:** "Teal and grey" per §2b. Replaces the Catppuccin accents and rainbow folders with deep teal `#0F4C4A` + sage + yellow + coral; pill-shaped nav, buttons, segments and chips; Winter Arc season card becomes the dark teal gradient hero; Money tile gets the wallet stack of account tabs. Mockups updated. Supersedes v5.
- **v5, 20 Oct 2026:** "Grey gradient". Neutrals switched to Zendesk Garden greys per §2b; soft grey gradients on frame, sidebar, header, cards, board columns and plain buttons; 1px `#D8DCDE` card borders; text `#293239`, secondary `#5C6970`. Accents, layout and components unchanged. No dark mode.
- **v4, 19 Oct 2026:** switched from Apple "Winter dawn" glass to the AnuPpuccin Latte card layout. Removed the gradient wallpaper and all glass blur and shadows; cards are flat `base` on `crust`; rainbow folder colours in the sidebar and section bars; rounded-square checkboxes; dashed header rule; whole palette moved to Catppuccin Latte with text-safe variants.
- v3, 19 Oct 2026: light theme only; added Inbox, Board, Instinct views, the season strip hero and the Instinct status pill.
- v2, 18 Oct 2026: Apple HIG structure (sidebar, segmented control, one primary button).
