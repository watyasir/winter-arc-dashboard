# Progress

One phase per session. Full details and kickoff prompts are in `docs/BUILD_PLAN.md`.

| Phase | Name | Status |
|---|---|---|
| 0 | Setup: scaffold, git, GitHub, Vercel | ✅ Done (19 Oct 2026) |
| 1 | The look (demo data only) | ✅ Done (19 Oct 2026) |
| 2 | Database + login + daily check-in | ⬜ Not started |
| 3 | Real dashboard | ⬜ Not started |
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

**Next up:** Phase 2, database + login + daily check-in.
