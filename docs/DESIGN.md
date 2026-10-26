# Design spec: Yasir OS

**Status:** v6 "Teal and grey", 20 Oct 2026. §2b overrides all colours in §2; §2 is kept only for history. The look is Yasir's Obsidian theme **AnuPpuccin** in its **light card layout**, on the **Catppuccin Latte** palette, with Apple HIG rules for controls, accessibility and charts.
**Source of truth:** the Claude Design canvas "Winter Arc Dashboard". Its exact markup is copied into `docs/design-reference/` (`Main.dc.html` is the dashboard, `Phone.dc.html` the phone home screen, `CheckIn.dc.html` the daily check-in). Open those files to match spacing, copy and sample data exactly. They are design mockups, not production code: rebuild them as React components with Tailwind.

> **Licence note:** AnuPpuccin's CSS is GPL-3.0. Do **not** copy any of its code. Only the Catppuccin palette (MIT) and the general look (cards on a frame, rainbow folders, dashed header rule) are used, rebuilt from scratch.

---

## 1. Look in one paragraph

A light "paper on a desk" feel. The window background is the Latte **crust** grey-blue. Every area of the app (sidebar, page header, each tile) is a flat **base**-coloured card with 16px corners, no shadows and 10–16px gaps of crust between cards, the way AnuPpuccin's card layout floats Obsidian panes. Navigation looks like an Obsidian file tree with **rainbow folders**: each section gets its own Catppuccin colour, in rainbow order. The page title card has a **dashed bottom rule**. Section headings carry a small 4px coloured bar in their section's colour. Checkboxes are rounded squares. Light theme only. From v6 the colours are "Teal and grey" (§2b): grey frame, white cards, deep teal brand colour, one dark teal hero card, pill controls.

## 2. Tokens (put all of these in `tailwind.config` + CSS variables)

### Surfaces and text (Catppuccin Latte)
| Token | Hex | Use |
|---|---|---|
| `crust` | `#DCE0E8` | App background (the frame), empty habit/season cells |
| `mantle` | `#E6E9EF` | Board column background, secondary panels |
| `base` | `#EFF1F5` | Every card, sidebar, header, inputs on cards |
| `surface0` | `#CCD0DA` | 1px borders, separators, chart grid lines |
| `surface1` | `#BCC0CC` | Dashed header rule (2px dashed) |
| `overlay0` | `#9CA0B0` | Unchecked checkbox outline |
| `subtext1` | `#5C5F77` | Secondary text (5.6:1 on base) |
| `text` | `#4C4F69` | Primary text (7.0:1 on base) |
| `fill` | `rgba(140,143,161,.16)` | Hover, segmented-control track, plain buttons |

### Colours (Latte) with meaning. One meaning each.
| Token | Fill | Text-safe variant | Meaning |
|---|---|---|---|
| `blue` | `#2A6EF5` | `#1F5BD8` | Interactive: links, primary button, selected mail |
| `green` | `#40A02B` | `#2E7A1E` | Done / on target / saved money |
| `peach` | `#FE640B` | `#B8460B` | Due soon / warning / missed day outline |
| `red` | `#D20F39` | `#B00D30` | Overdue / errors |
| `mauve` | `#8839EF` | `#7029D0` | Winter Arc (season, today marker) |
| `pink` | `#EC83D0` | `#A3218E` | Claude (owner chips) |
| `teal` | `#179299` | (`#179299` ok ≥18px) | Move-out fund, trackers tree |
| `yellow` | `#E49320` | not for text | Waiting mailbox dot, Board folder |
| `sky` `#04A5E5`, `lavender` `#7287FD` | | not for text | Section bars only (Weight, Goals) |
| `greenLight` | `#A6D79A` | | Season day with most targets hit |

**Rule:** the bright fills fail contrast as small text on `base`. Small coloured text always uses the text-safe variant. The fills are for dots, bars, rings, icons and chips with a tinted background.

### Rainbow folder order (navigation + section bars)
Overview `red` · Board `yellow` · Trackers tree `teal` · then `sky`, `sapphire #209FB5`, `blue`, `lavender`, `mauve` for future sections. Section heading bars: Today red, Money green, Weight sky, Goals lavender, Habits teal, In progress yellow. These colours are for **navigation identity only**. They don't carry status meaning.

### Type
- Font: system stack `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif` (SF on Yasir's Mac, like Obsidian's default). Numbers: `ui-rounded, "SF Pro Rounded", …` bold. Never bundle SF font files.
- Scale: page title 32/1.1 bold, −0.02em · card title 15 bold · body 13–15 · secondary 12 · season hero number 64 bold rounded · stat values 26–32 bold rounded. Nothing under 11px. `font-variant-numeric: tabular-nums` everywhere numbers line up.

### Shape and space
- Card radius 16px. Inner elements (board cards, mail rows, buttons, chips) 6–10px. Checkboxes 5–6px (rounded squares, not circles).
- No drop shadows. Separation comes from crust gaps and 1px `surface0` borders.
- App padding 16px; gap between cards 10px (rows) / 16px (sections).
- Page header card: radius `16px 16px 6px 6px`, `border-bottom: 2px dashed surface1`.

## 2b. v6 "Teal and grey" theme (CURRENT, overrides all §2 colours)

Yasir's call (20 Oct 2026), from a reference dashboard he liked: calm greys, white cards, one deep teal as the brand colour, sage and soft yellow as supporting colours, a dark teal gradient "hero" card, and pill-shaped controls. No dark mode, no toggle. The mockups in `docs/design-reference/` (Main, Phone, CheckIn) are already in this theme: match them.

### Neutrals
Component greys are pure neutral (R = G = B). The app background is a cool grey Yasir picked (`#F6F8FA` → `#E9ECED`); never a violet or pink cast.
| Token | Hex | Contrast on white | Use |
|---|---|---|---|
| `frame` | `linear-gradient(160deg, #F6F8FA 0%, #E9ECED 100%)`, `background-attachment: fixed` | | App background |
| `card` | `linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)` + 1px `sep` border, radius 20 | | Every card |
| `base` | `#FFFFFF` | | Sidebar, header, inputs, small board cards, plain buttons (with 1px `sep` border) |
| `mantle` | `#F5F5F5` / board columns `#F3F3F3` | | Secondary panels |
| `crust` | `#EDEDED` | | Empty habit cells, hover-ish fills |
| `sep` | `#E5E5E5` | | Borders, separators, chart grid |
| `rule` | `#C8C8C8` | | Dashed header rule |
| `overlay` | `#848F99` | 3.3 | Checkbox outline (never text) |
| `sub` | `#666C70` | 5.3 | Secondary text |
| `ink` | `#16191B` | 17.7 | Primary text |
| `fill` | `rgba(22,25,27,.05)` | | Hover, segmented track |

### Colours with meaning (fill / text-safe)
| Token | Fill | Text-safe | Meaning |
|---|---|---|---|
| `teal` (brand) | `#0F4C4A` | `#0F4C4A` (9.8) | Interactive: selected nav pill, selected segment, primary button, links, focus ring, chart line. White text on it (9.8). Hover `#0A3533` |
| `sage` | `#6E9C93` | `#3D6E64` (5.8) | Done / on target / saved money |
| `yellow` | `#F2C230` | `#8A6200` (5.5) | Due soon / warning / missed-day outline. Dark text on it, never white |
| `coral` | `#E0684B` | `#B4432A` (5.6) | Overdue / errors / money out |
| `arc` | `#155A63` | `#155A63` (7.9) | Winter Arc identity (logo tile, Winter Arc nav tile) |
| `claude` | `#D97757` | `#9C4A2B` (5.3 on its tint) | Claude (owner chips, Claude's scheduled tasks panel) |
| `yasir` | `#5E9C96` | brand `#0F4C4A` | Yasir ("Me" owner chips) |
| others | `#3D8A80`, `#6FA8B6`, `#8FB3AA`, `#4F8F9A` | not for text | Section bars, extra series |
Chips: fill at 12–16% alpha with the text-safe colour, fully rounded (999px), like the reference's "Urgent / Non urgent" pills.

### Hero card (the one dark card)
The Winter Arc season card uses `linear-gradient(135deg, #0B2C33 0%, #11414A 45%, #2B6F84 100%)`, no border, white text, secondary text `rgba(255,255,255,.74)`, sage numbers `#A8D5CC`, yellow `#F5D96B`. Season cells on it: all targets `#7FB0A6`, most `#9CC3BB`, missed = 1.5px `#F2D54E` outline, today `#FFFFFF`, upcoming `rgba(255,255,255,.13)`. Only one hero card per view.

### Navigation and controls
- Sidebar items are pills (radius 999, 38px tall). Selected = teal fill, white text, icon tile `rgba(255,255,255,.16)`. Icon tiles use the teal ramp `#0F4C4A`, `#2D6E6A`, `#4F8780`, `#6E9C93` (replaces the rainbow folders).
- Buttons, segmented controls and chips are fully rounded. Selected segment = teal fill, white text.

### Wallet stack (Money tile, from Yasir's reference)
Show bank accounts and cards as a stack of coloured tabs above a white front card, so each account's balance is visible at a glance:
- Each account is a tab (50px tall, radius `16px 16px 0 0`, overlapping the next by 14px): name on the left, balance on the right (₹ Indian format). Colours by type: savings teal (white text), salary/current sage (ink text), credit card yellow (ink text, shows due date and amount owed as −₹), extra accounts use `#3D8A80`, `#8FB3AA`.
- Front card: white, 1px `sep` border, radius 16, with a 26px semicircle notch cut at top centre (`mask: radial-gradient(circle 26px at 50% 0, transparent 25px, #000 26px)`). Shows "N accounts" chip, "Total balance" label, total in 32px rounded bold, and "+ ₹X saved this month" in sage text-safe.
- Clicking a tab opens that account's detail (balance, last 5 transactions, due date for cards) in the same tile; Escape or clicking the front card goes back. Tabs are real buttons with labels like "Savings account, ₹48,200".
- Data comes read-only from the Personal Finance sheet (Phase 6). Until then /demo uses fake accounts. Never put real bank names or amounts in the repo.

## 3. Layout (laptop and 24" monitor use the same fluid layout)
```
┌ crust frame ──────────────────────────────────────────────────────────┐
│ ┌sidebar 236px──┐ ┌ header card: title, subtitle | Day X/90 chip, Log Today ┐
│ │ logo          │ └─────────────── dashed rule ───────────────────────────┘
│ │ ▣ Overview    │  [Overview view]
│ │ ▣ Winter Arc  │  Today · Tasks · Money
│ │ ▣ Board    17 │  Body · Workouts · Goals
│ │ ⌄ Trackers    │  Habits grid · In progress
│ │ │ ☑ Workout   │
│ │ │ ☐ Water     │
│ └─────────────┘
```
- Below 980px the sidebar becomes full width on top. Below 640px cards stack into one column.
- Views: **Overview**, **Winter Arc** (v6.1), **Board** (4 columns on `mantle`). Clicking the sidebar switches views; the selected item gets a `crust` background and bold text.

## 4. Components (match the reference files)
- **Sidebar item:** 34px row, 24px rounded-square icon tile in its rainbow colour with a white stroke icon, label, count on the right in `subtext1`.
- **Trackers tree:** collapsible group with a teal chevron and a 2px teal left rule (AnuPpuccin's folder indent line). Each row: 18px rounded-square checkbox (green fill + white tick when done, `overlay0` outline when not), name, value.
- **Season strip:** 90 cells, `grid-template-columns: repeat(30, 1fr)`, gap 4px, square cells, radius 5px. States: all targets `green`, most targets `greenLight`, missed = transparent with 1.5px `peach` outline, today `mauve`, upcoming `crust`. Each cell has a `title` / accessible label ("Day 8: missed"). Legend underneath uses the same shapes and words, so colour isn't the only signal.
- **Stat card:** coloured dot + label, big rounded number + unit, 24px sparkline in the dot colour, one-line note.
- **Today checklist:** whole row is a button that toggles; 22px rounded-square checkbox; done rows turn `subtext1`.
- **Board card:** `base` with 1px `surface0` border, radius 10, title, owner chip (Me = soft teal tint/brand text, Claude = orange tint/`#9C4A2B`, Both = fill/`sub`, v6.4), area, due date (peach text-safe when due within 3 days, red when overdue).
- **Buttons:** primary = blue fill, white text, radius 8, 36px tall (only one per view, e.g. "Log Today"). Plain = `fill`.
- **Switches** (check-in): 46×28, green when on, inside list rows only.
- **Charts:** weight = line + point marks in blue, light blue area, dashed green goal line labelled "Goal 65 kg", Y labels on the right, summary line above the chart ("▲ 2.1 kg since 23 Aug").

## 5. Interaction and motion
- Only motion: checkbox state change, view switch (instant, no slide). Respect `prefers-reduced-motion`.
- Visible focus ring: 2px `#1F5BD8`, offset 2px, on every button, link and input.
- Hit targets ≥ 34px on desktop, 44px on phone.

## 6. Phone (390 wide)
Same tokens: `crust` background, `base` cards, large title "Today", Winter Arc card, 2×2 stats, Focus list, Money, floating tab bar (Today, Arc, Board, Money) plus a round blue "Log today" button that opens the check-in sheet. Check-in sheet: Sleep and Water steppers, three switches, Study and Mood segmented controls, blue "Done" that turns green "Saved ✓".

## 7. Copy rules
Sentence case, plain verbs, no ALL-CAPS labels. Buttons say what happens ("Log Today", "Open Board"). Empty states give the next step ("No workouts yet. Log your first one.").

## 8. Changelog (Claude Code: apply the latest entry if the code doesn't match)
- **v6.4, 27 Oct 2026:** **My Day** card on Overview (laptop row under Top priority; phone Today tab under the pin): day chip (weekday · shift day / day off), Now (brand tint, time range) and Next (column grey, "at 9:30 PM") panels, then folded lists: Full day (time, teal-ramp dot, title, detail; current phase tinted and `aria-current`), Meals, Gym A / B, Skin, hair, body, Prep, Stock list. Content comes from the database (`day_plans`), never the repo. **Owner tags:** Claude `#D97757` orange tint, Me soft teal `#5E9C96` tint, Both neutral; replaces cyan. **Claude's scheduled tasks** panel beside the Board from 1200px (260px, dashed Claude-orange border, white), under it below; name, status chip (OK sage, Failed coral, Running brand, Scheduled/Paused neutral), schedule, last and next run. **Action gate:** before the dashboard, up to 3 cards one at a time, max 440px, centred over a blurred, inert dashboard (`ink/30` scrim): chip (Overdue/Due today coral, Due tomorrow yellow, N days left brand) + date, "1 of 3", title on one line, "Next:" 2 lines, up to 2 question bullets + "More questions in chat", chat footer with Copy name; buttons Done (the one primary) · Doing it now · Snooze to tomorrow (hidden when more than a day overdue) · Move date (inline date field + Save date). No close, Esc or backdrop dismissal.
- **v6.3, 26 Oct 2026:** Board on real tasks. Columns To do · In progress · Waiting on others · Done; cards show title, note (2 lines), owner chip (Me / Claude / Both), area, due date (yellow within 3 days, coral overdue), most important first. Drag cards between columns (laptop; the column border turns brand); tap a card or "Add task" for one sheet (bottom sheet under 640px, centred panel above): title, note, area, due, who's on it, column, Delete, Cancel, Save as the one primary button. Done shows the latest 20 with "Show all". New slim **Top priority** card at the top of Overview (laptop and phone Today tab): the open Home task with the highest order, with its due date; tap opens the Board.
- **v6.2, 27 Oct 2026:** Inbox (mail nudges) and Instinct (view, status pill, "what Instinct can see", digest) dropped for good and deleted from the code. Views are Overview, Winter Arc and Board. The older mockups (`Main.dc.html`, `Phone.dc.html`) still show them; ignore those parts.
- **v6.1, 26 Oct 2026:** layout split. Overview = whole life (Today, Tasks, Money, Body, Workouts, Goals, Habits, In progress) with Winter Arc reduced to a dark "Day X/90 →" chip in the header. New sidebar page **Winter Arc**: dark teal hero with the 90-day strip, targets this week, streaks per tracker, week-by-week % chart, Share card button. Sidebar: Overview, Winter Arc, Board, Trackers (Inbox and Instinct hidden, parked). Mockups: `docs/design-reference/LifeOverview.dc.html`, `WinterArcPage.dc.html`. Same v6 tokens. **Phone (under 640px):** tab bar stays Today · Arc · Board · Money + round Log button. *Today tab* = the life Overview stacked in one column: greeting + "Day X/90 →" chip, Today checklist, Tasks (due + overdue), a 2×2 of Body / Workouts / Goals / Money summary, Habits grid (last 2 weeks so it fits), In progress. *Arc tab* = the Winter Arc page stacked: hero card (big day number, streak/best/targets row, 90-day strip at 15 cells per row), Targets this week, Streaks as a 2-column grid, Week-by-week chart scrollable sideways if it doesn't fit, Share card button. 44px targets, no horizontal page scroll.
- **v6, 20 Oct 2026:** "Teal and grey" per §2b. Replaces the Catppuccin accents and rainbow folders with deep teal `#0F4C4A` + sage + yellow + coral; pill-shaped nav, buttons, segments and chips; Winter Arc season card becomes the dark teal gradient hero; Money tile gets the wallet stack of account tabs. Mockups updated. Supersedes v5.
- **v5, 20 Oct 2026:** "Grey gradient". Neutrals switched to Zendesk Garden greys per §2b; soft grey gradients on frame, sidebar, header, cards, board columns and plain buttons; 1px `#D8DCDE` card borders; text `#293239`, secondary `#5C6970`. Accents, layout and components unchanged. No dark mode.
- **v4, 19 Oct 2026:** switched from Apple "Winter dawn" glass to the AnuPpuccin Latte card layout. Removed the gradient wallpaper and all glass blur and shadows; cards are flat `base` on `crust`; rainbow folder colours in the sidebar and section bars; rounded-square checkboxes; dashed header rule; whole palette moved to Catppuccin Latte with text-safe variants.
- v3, 19 Oct 2026: light theme only; added Inbox, Board, Instinct views, the season strip hero and the Instinct status pill.
- v2, 18 Oct 2026: Apple HIG structure (sidebar, segmented control, one primary button).
