# Yasir OS: design spec

**Status:** v8 "Soft bento", 30 Oct 2026. Light only. This file is the whole spec; the code follows the latest changelog entry (§9). Apple HIG and v6 "Teal and grey" are retired.

## 1. Look in one paragraph

Warm cream page, white tiles with a thin sand border and one soft shadow, rounded 20px. Two soft brand fills (peach for the main thing on a page, blue for the check-in and "selected"), always with near-black text. Numbers in JetBrains Mono, words in Inter. Calm and readable at a glance; colour always comes with a word or symbol.

## 2. Tokens (all in the one `@theme` block in `src/app/globals.css`)

| Token | Value | Use |
|---|---|---|
| `surface` | `#FFF5E6` | page background |
| `card` | `#FFFFFF` | tiles |
| `fill` / `fill-strong` | `#FFF5E6` / `#F8E7CC` | inputs, inner items, tracks |
| `line` / `line-strong` | `#F1E3CC` / `#E2CBA6` | 1px borders / handles, empty boxes |
| `ink` / `sub` | `#111827` / `#5B6474` | text / secondary text |
| `peach` / `peach-strong` | `#FAD4C0` / `#F6C1A6` | primary fill (dark text), its hover |
| `blue` / `blue-soft` | `#80A1C1` / `#E3EBF3` | secondary fill (dark text): check-in, selected segment, switch on |
| `blue-text` / `blue-hover` | `#3E5F7F` / `#2C4660` | links, focus ring, chart line |
| `ok`, `warn`, `danger` (+ `-soft`) | `#15803D` `#B45309` `#B91C1C` / `#DCFCE7` `#FEF3C7` `#FEE2E2` | states: text / fill |
| `claude` / `yasir` | `#D97757` (dark text) / `#3E5F7F` (white text) | owner tags |
| `radius-tile` / `radius-item` | 20px / 12px | tiles / inner items; pills 999px |
| `shadow-tile` | `0 1px 2px rgb(17 24 39/.06), 0 8px 24px -12px rgb(17 24 39/.12)` | the only shadow |

Type: Inter 500 body, 600 labels, 800 headings; JetBrains Mono 500/700 for numbers; scale 12/14/16/20/24/32. Spacing 4/8/12/16/24/32. Tile padding 20px (16 on phone), gap 16px (12 on phone).

## 3. Layout

- One fluid layout, max 1240px. Top bar from 561px: "Y" mark + Yasir OS, page links (Overview, Winter Arc, Board, Money, Health, Gallery), blue Check-in pill. 560px and under: brand only on top, a 6-tab bar at the bottom.
- Every page has its own address, and the same under `/demo`.
- **Overview is the only bento** (`bento` utility): desktop 4 columns × 150px rows
  `"hero hero tasks money" "hero hero tasks money" "check today weight weight" "fund diet study claude"`;
  960px and under 2 columns; 560px and under a 2-column widget grid (hero, check-in + today, tasks, money, weight, fund + diet, study + claude). Tiles are written in priority order; no `grid-flow-dense`.
- Other pages: a simple 1–3 column grid of tiles, tops aligned.

## 4. Components

- **Tile** (`src/components/Tile.tsx`): every tile. Heading = the tile's one link to its full page ("Title →"). Fills: card, peach (Winter Arc hero), blue (Check-in).
- **LineChart** (`src/components/LineChart.tsx`): zero-dependency SVG. 2px blue line, soft blue area, 3 faint grid lines, the last point as a dot, start date + min/max on one scale under it, one-line summary for screen readers. Weight (Overview 14 days; Health 14/30/90), steps, sleep (wake − lights out), Winter Arc consistency (0–100).
- **Hero:** Day N of 90, days left, check-ins, finish date, 90 squares (30 per row, 15 on phone): filled = logged, today outlined.
- **Chips:** words with colour: "! Overdue" danger, "Today" warn, a date neutral; meals ✓ / ~ / ✕.
- **Reminder toasts:** tasks due within 3 days (overdue first, at most 3) in the corner (one at a time above the phone tab bar, "1 of 3"). Tap opens the task card (dialog: Esc, ✕ or outside closes) with Done · Doing it now · Snooze to tomorrow · Move date. ✕ on a toast hides it for this visit. Nothing is ever blocked.
- **Claude's jobs:** status dot + word (OK, Failed, Running, Scheduled, Paused), "Last run 2h ago".
- Segmented controls: track `fill-strong`, selected `blue`. Primary buttons peach; "Saved ✓" green with white text.

## 5. Interaction and motion

Hover and press in CSS only (`press`: scale .99). No animation library. `prefers-reduced-motion` turns transitions off. Visible 3px `blue-text` focus ring on every control.

## 6. Accessibility

All text ≥ 4.5:1 on its background (dark text on peach and blue). Tap targets ≥ 44px on the phone. Charts say their point in words. Never colour alone.

## 7. Copy rules

Plain, short words. Empty states say what to do next ("Log your weight on 2 days to see the trend"); never fake numbers on the real app. Money as ₹1,25,000, dates as 18 Oct 2026, India time.

## 8. Phone

Designed at 390px first. No sideways scroll. The check-in stays under a minute: big inputs, defaults filled in, one Save.

## 9. Changelog (Claude Code: apply the latest entry if the code doesn't match)

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
