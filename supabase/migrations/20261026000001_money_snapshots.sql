-- Phase 6: money snapshots.
--   money_snapshots:  one picture of the month's money, pushed by Claude's finance task
--                     through POST /api/money (see docs/API.md). The Money tiles read the latest one.
-- No Google service account: the app never reads the finance sheet itself.
-- Same rules as the earlier tables: every row belongs to one user, locked by row-level security.
-- The API writes with the secret key (it skips row-level security) and sets user_id itself.

create table public.money_snapshots (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- The month the numbers are for, as YYYY-MM.
  month       text not null check (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  income      numeric not null check (income >= 0),
  expenses    numeric not null check (expenses >= 0),
  -- [{ "name": "Rent", "amount": 12000 }, ...]
  categories  jsonb not null default '[]'::jsonb check (jsonb_typeof(categories) = 'array'),
  -- { "needs": { "actual": 48, "target": 50 }, "wants": {...}, "savings": {...} } in %
  split       jsonb not null check (jsonb_typeof(split) = 'object'),
  -- [{ "name": "Bank A", "balance": 12000 }, ...]
  banks       jsonb not null default '[]'::jsonb check (jsonb_typeof(banks) = 'array'),
  -- [{ "name": "Card A", "dues": 4200, "due_date": "2026-11-05" }, ...]
  cards       jsonb not null default '[]'::jsonb check (jsonb_typeof(cards) = 'array'),
  -- What's left to spend this month.
  spendable   numeric not null,
  -- When the numbers were read from the sheet.
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index money_snapshots_user_latest on public.money_snapshots (user_id, updated_at desc);

alter table public.money_snapshots enable row level security;

create policy "own money snapshots" on public.money_snapshots for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
