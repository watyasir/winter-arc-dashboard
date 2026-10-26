# API

Three endpoints for Claude's scheduled tasks, so logging and money updates reach the dashboard without opening the app. All amounts below are made up.

Base URL: `https://yasiros.vercel.app`

## Access

Every call sends the secret token as a header:

```
Authorization: Bearer <API_TOKEN>
```

| Situation | Answer |
|---|---|
| `API_TOKEN` not set on the server | `503` `{ "ok": false, "error": "The API is off: API_TOKEN isn't set." }` (the rest of the app works as usual) |
| Wrong or missing token | `401` |
| Server can't read the database (`SUPABASE_SERVICE_ROLE_KEY` or `ALLOWED_EMAIL` missing) | `503` |
| Body doesn't fit | `400` with an `error` naming the field |

Every reply is JSON with `"ok": true` or `"ok": false`. Nothing is cached. Data is always saved to the owner's account (`ALLOWED_EMAIL`).

Make a token: `openssl rand -hex 32`. Set the same value as `API_TOKEN` in Vercel and in the scheduled task.

---

## POST /api/log

Logs tracker values for one day, the same as the check-in. A value already logged that day is overwritten.

```json
{
  "date": "2026-10-26",
  "entries": [
    { "tracker": "sleep", "value": 7.5 },
    { "tracker": "water", "value": 3 },
    { "tracker": "skincare", "value": true },
    { "tracker": "Study", "value": 90 }
  ]
}
```

- `date`: optional, `YYYY-MM-DD`, India time. Default today. Up to 7 days back, never the future.
- `entries`: 1 to 50. `tracker` is the tracker's slug or its name (any case). `GET /api/summary` lists the slugs.
- Values: yes/no trackers take `1`/`0` or `true`/`false`; 1–5 scales take whole numbers 1–5; time trackers take minutes (0–1440); number trackers take the amount in their unit.

Reply (`200` when at least one value saved, else `400`):

```json
{
  "ok": true,
  "date": "2026-10-26",
  "saved": [{ "tracker": "sleep", "value": 7.5 }, { "tracker": "water", "value": 3 }],
  "skipped": [{ "tracker": "german", "reason": "No tracker with that slug or name." }]
}
```

```bash
curl -X POST https://yasiros.vercel.app/api/log \
  -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
  -d '{"entries":[{"tracker":"water","value":3}]}'
```

---

## GET /api/summary

Today at a glance: what's logged, what's missing, and the Winter Arc status. For reminder tasks ("you haven't logged water yet").

```json
{
  "ok": true,
  "date": "2026-10-26",
  "logged": [{ "tracker": "sleep", "name": "Sleep", "value": 7, "shown": "7 h" }],
  "missing": [{ "tracker": "water", "name": "Water", "type": "number", "unit": "L" }],
  "season": {
    "name": "Winter Arc",
    "day": 1,
    "length": 90,
    "starts_in": 0,
    "days_left": 89,
    "streak": 0,
    "best_streak": 0,
    "targets_hit": { "pct": null, "period": "This week" },
    "targets_this_week": [{ "name": "Sleep", "done": 1, "target": 7 }],
    "streaks": [{ "name": "Sleep", "current": 1, "best": 1 }],
    "workouts_this_week": { "count": 0, "target": 4 }
  }
}
```

- `season` is `null` when no season is set up. Before day 1, `starts_in` counts the days to go.
- `targets_hit.pct`: % of finished days this week with every target hit (`null` = no finished day yet; on Mondays it's last week).

```bash
curl https://yasiros.vercel.app/api/summary -H "Authorization: Bearer $API_TOKEN"
```

---

## POST /api/money

Saves a money snapshot. The Money tiles show the latest one: wallet stack (a tab per bank and per card, front card = `spendable`), spend vs income, the 50/20/30 split against target, the top 4 categories and "Updated <time>". The app never reads or writes the finance sheet; the finance task reads it and sends this.

```json
{
  "month": "2026-10",
  "income": 50000,
  "expenses": 31800,
  "categories": [
    { "name": "Rent", "amount": 12000 },
    { "name": "Food", "amount": 7400 },
    { "name": "Travel", "amount": 4100 }
  ],
  "split": {
    "needs": { "actual": 48, "target": 50 },
    "wants": { "actual": 15, "target": 20 },
    "savings": { "actual": 37, "target": 30 }
  },
  "banks": [
    { "name": "Bank A", "balance": 30000 },
    { "name": "Bank B", "balance": 12000 },
    { "name": "Bank C", "balance": 6000 }
  ],
  "cards": [
    { "name": "Card A", "dues": 4200, "due_date": "2026-11-05" },
    { "name": "Card B", "dues": 0, "due_date": null }
  ],
  "spendable": 14600,
  "updated_at": "2026-10-26T21:30:00+05:30"
}
```

| Field | Rule |
|---|---|
| `month` | `YYYY-MM` |
| `income`, `expenses` | rupees, 0 or more |
| `categories` | up to 30 `{ name, amount }`; the tile shows the biggest 4 |
| `split` | `needs`, `wants`, `savings`, each `{ actual, target }` as % of income. `target` is optional: 50 / 20 / 30 |
| `banks` | up to 30 `{ name, balance }` (names up to 40 characters) |
| `cards` | up to 30 `{ name, dues, due_date }`; `dues` = unpaid amount, `due_date` = `YYYY-MM-DD` or `null` |
| `spendable` | rupees left to spend this month (can be negative) |
| `updated_at` | optional ISO time the numbers were read; default now; not in the future |

Reply `201`:

```json
{ "ok": true, "month": "2026-10", "updated_at": "2026-10-26T16:00:00.000Z" }
```

Every call adds a snapshot (older ones stay as history). Needs the `money_snapshots` table (`supabase/migrations/20261026000001_money_snapshots.sql`); without it the call answers `500` and the tile keeps its empty state.

```bash
curl -X POST https://yasiros.vercel.app/api/money \
  -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
  -d @snapshot.json
```
