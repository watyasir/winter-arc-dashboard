# Design spec: Winter Arc Dashboard

**Status:** v4, approved direction 19 Oct 2026. The look is Yasir's Obsidian theme **AnuPpuccin** in its **light card layout**, on the **Catppuccin Latte** palette, with Apple HIG rules for controls, accessibility and charts.
**Source of truth:** the Claude Design canvas "Winter Arc Dashboard". Its exact markup is copied into `docs/design-reference/` (`Main.dc.html` is the dashboard, `Phone.dc.html` the phone home screen, `CheckIn.dc.html` the daily check-in). Open those files to match spacing, copy and sample data exactly. They are design mockups, not production code: rebuild them as React components with Tailwind.

> **Licence note:** AnuPpuccin's CSS is GPL-3.0. Do **not** copy any of its code. Only the Catppuccin palette (MIT) and the general look (cards on a frame, rainbow folders, dashed header rule) are used, rebuilt from scratch.

---

## 1. Look in one paragraph

A light "paper on a desk" feel. The window background is the Latte **crust** grey-blue. Every area of the app (sidebar, page header, each tile) is a flat **base**-coloured card with 16px corners, no shadows and 10–16px gaps of crust between cards, the way AnuPpuccin's card layout floats Obsidian panes. Navigation looks like an Obsidian file tree with **rainbow folders**: each section gets its own Catppuccin colour, in rainbow order. The page title card has a **dashed bottom rule**. Section headings carry a small 4px coloured bar in their section's colour. Checkboxes are rounded squares. Light theme only.

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
| `mauve` | `#8839EF` | `#7029D0` | Winter Arc (season, today marker, Instinct pill) |
| `pink` | `#EC83D0` | `#A3218E` | Claude (owner chips) |
| `teal` | `#179299` | (`#179299` ok ≥18px) | Move-out fund, trackers tree |
| `yellow` | `#E49320` | not for text | Waiting mailbox dot, Board folder |
| `sky` `#04A5E5`, `lavender` `#7287FD` | | not for text | Section bars only (Weight, Goals) |
| `greenLight` | `#A6D79A` | | Season day with most targets hit |

**Rule:** the bright fills fail contrast as small text on `base`. Small coloured text always uses the text-safe variant. The fills are for dots, bars, rings, icons and chips with a tinted background.

### Rainbow folder order (navigation + section bars)
Overview `red` · Inbox `peach` · Board `yellow` · Instinct `green` · Trackers tree `teal` · then `sky`, `sapphire #209FB5`, `blue`, `lavender`, `mauve` for future sections. Section heading bars: Today red, Inbox peach, Money green, Weight sky, Goals lavender, Habits teal, In progress yellow, Ask Instinct green. These colours are for **navigation identity only**. They don't carry status meaning.

### Type
- Font: system stack `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif` (SF on Yasir's Mac, like Obsidian's default). Numbers: `ui-rounded, "SF Pro Rounded", …` bold. Never bundle SF font files.
- Scale: page title 32/1.1 bold, −0.02em · card title 15 bold · body 13–15 · secondary 12 · season hero number 64 bold rounded · stat values 26–32 bold rounded. Nothing under 11px. `font-variant-numeric: tabular-nums` everywhere numbers line up.

### Shape and space
- Card radius 16px. Inner elements (board cards, mail rows, buttons, chips) 6–10px. Checkboxes 5–6px (rounded squares, not circles).
- No drop shadows. Separation comes from crust gaps and 1px `surface0` borders.
- App padding 16px; gap between cards 10px (rows) / 16px (sections).
- Page header card: radius `16px 16px 6px 6px`, `border-bottom: 2px dashed surface1`.

## 3. Layout (laptop and 24" monitor use the same fluid layout)
```
┌ crust frame ──────────────────────────────────────────────────────────┐
│ ┌sidebar 236px┐ ┌ header card: title, subtitle | Instinct pill, search, Log Today ┐
│ │ logo        │ └─────────────── dashed rule ───────────────────────────┘
│ │ ▣ Overview  │  [Overview view]
│ │ ▣ Inbox   4 │  season card: big "23 of 90" + 90-cell strip (30 per row)
│ │ ▣ Board  17 │  stats row (5 cards, sparkline each)
│ │ ▣ Instinct  │  Today · Inbox preview · Money
│ │ ⌄ Trackers  │  Weight chart (2/3) · Goals (1/3)
│ │ │ ☑ Workout │  Habits grid (2/3) · In progress (1/3)
│ │ │ ☐ Water   │
│ └─────────────┘
```
- Below 980px the sidebar becomes full width on top. Below 640px cards stack into one column.
- Views: **Overview**, **Inbox** (mailboxes | list | reading pane), **Board** (4 columns on `mantle`), **Instinct** (ask box, recent exchanges | what Instinct can see, morning digest). Clicking the sidebar switches views; the selected item gets a `crust` background and bold text.

## 4. Components (match the reference files)
- **Sidebar item:** 34px row, 24px rounded-square icon tile in its rainbow colour with a white stroke icon, label, count on the right in `subtext1`.
- **Trackers tree:** collapsible group with a teal chevron and a 2px teal left rule (AnuPpuccin's folder indent line). Each row: 18px rounded-square checkbox (green fill + white tick when done, `overlay0` outline when not), name, value.
- **Season strip:** 90 cells, `grid-template-columns: repeat(30, 1fr)`, gap 4px, square cells, radius 5px. States: all targets `green`, most targets `greenLight`, missed = transparent with 1.5px `peach` outline, today `mauve`, upcoming `crust`. Each cell has a `title` / accessible label ("Day 8: missed"). Legend underneath uses the same shapes and words, so colour isn't the only signal.
- **Stat card:** coloured dot + label, big rounded number + unit, 24px sparkline in the dot colour, one-line note.
- **Today checklist:** whole row is a button that toggles; 22px rounded-square checkbox; done rows turn `subtext1`.
- **Inbox:** unread = blue dot + bold sender/subject; label chips on `fill`; "Logged by Claude" chip on green tint; reading pane ends with a mauve-tinted "Claude" note box.
- **Board card:** `base` with 1px `surface0` border, radius 10, title, owner chip (Me = blue tint/`#1F5BD8`, Claude = pink tint/`#A3218E`, Both = fill/`subtext1`), area, due date (peach text-safe when due within 3 days, red when overdue).
- **Instinct status pill (header):** shows only while an Instinct request is waiting. Mauve avatar, "Asking Instinct · m:ss", indeterminate mauve bar (static at 50% under reduced motion). On reply: green tick + "Instinct replied in X" for ~3.5 s, then it disappears. `role="status" aria-live="polite"`.
- **Buttons:** primary = blue fill, white text, radius 8, 36px tall (only one per view: "Log Today" / "Send to Instinct"). Plain = `fill`.
- **Switches** (What Instinct can see): 46×28, green when on, inside list rows only.
- **Charts:** weight = line + point marks in blue, light blue area, dashed green goal line labelled "Goal 65 kg", Y labels on the right, summary line above the chart ("▲ 2.1 kg since 23 Aug").

## 5. Interaction and motion
- Only motion: the Instinct pill's indeterminate bar, checkbox state change, view switch (instant, no slide). Respect `prefers-reduced-motion`.
- Visible focus ring: 2px `#1F5BD8`, offset 2px, on every button, link and input.
- Hit targets ≥ 34px on desktop, 44px on phone.

## 6. Phone (390 wide)
Same tokens: `crust` background, `base` cards, large title "Today", Winter Arc card, 2×2 stats, Focus list, Money, floating tab bar (Today, Arc, Board, Money) plus a round blue "Log today" button that opens the check-in sheet. Check-in sheet: Sleep and Water steppers, three switches, Study and Mood segmented controls, blue "Done" that turns green "Saved ✓".

## 7. Copy rules
Sentence case, plain verbs, no ALL-CAPS labels. Buttons say what happens ("Send to Instinct", "Log Today", "Open Inbox"). Empty states give the next step ("No workouts yet. Log your first one.").

## 8. Changelog (Claude Code: apply the latest entry if the code doesn't match)
- **v4, 19 Oct 2026:** switched from Apple "Winter dawn" glass to the AnuPpuccin Latte card layout. Removed the gradient wallpaper and all glass blur and shadows; cards are flat `base` on `crust`; rainbow folder colours in the sidebar and section bars; rounded-square checkboxes; dashed header rule; whole palette moved to Catppuccin Latte with text-safe variants.
- v3, 19 Oct 2026: light theme only; added Inbox, Board, Instinct views, the season strip hero and the Instinct status pill.
- v2, 18 Oct 2026: Apple HIG structure (sidebar, segmented control, one primary button).
