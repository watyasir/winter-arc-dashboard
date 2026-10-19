-- Phase 2: the three generic pieces the app grows from (see CLAUDE.md "How the app grows").
--   trackers: anything measured over time
--   entries:  one value for one tracker on one date
--   seasons:  a time-boxed challenge (Winter Arc = 90 days), only one active at a time
-- Every row belongs to one user, and row-level security means a user can only ever
-- see or change their own rows.

-- ---------------------------------------------------------------- trackers
create table public.trackers (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug          text not null,
  name          text not null,
  area          text not null check (area in ('Health', 'Body', 'Mind', 'Skills', 'Money', 'Custom')),
  type          text not null check (type in ('checkbox', 'number', 'scale_1_5', 'duration_minutes')),
  unit          text,
  -- How much one tap on the stepper changes a number tracker. Empty = type the number in.
  step          numeric check (step is null or step > 0),
  -- Words for a 1-5 scale, lowest first (e.g. mood). Empty = show 1 to 5.
  scale_labels  text[] check (scale_labels is null or cardinality(scale_labels) = 5),
  target        numeric,
  target_period text check (target_period in ('daily', 'weekly')),
  sort_order    integer not null default 0,
  archived      boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (user_id, slug)
);

create index trackers_user_order on public.trackers (user_id, sort_order);

-- ---------------------------------------------------------------- entries
create table public.entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tracker_id  uuid not null references public.trackers (id) on delete cascade,
  entry_date  date not null,
  -- Checkbox: 1 done / 0 not done. Scale: 1-5. Duration: minutes. Number: in the tracker's unit.
  value       numeric not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tracker_id, entry_date)
);

create index entries_user_date on public.entries (user_id, entry_date desc);

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger entries_touch before update on public.entries
  for each row execute function public.touch_updated_at();

-- An entry's tracker must belong to the same user.
create function public.entry_tracker_owner_matches() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not exists (
    select 1 from public.trackers t where t.id = new.tracker_id and t.user_id = new.user_id
  ) then
    raise exception 'tracker does not belong to this user';
  end if;
  return new;
end;
$$;

create trigger entries_owner_check before insert or update on public.entries
  for each row execute function public.entry_tracker_owner_matches();

-- ---------------------------------------------------------------- seasons
create table public.seasons (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null,
  start_date   date not null,
  length_days  integer not null default 90 check (length_days > 0),
  -- { "<tracker slug>": <target value>, ... }
  targets      jsonb not null default '{}'::jsonb,
  is_active    boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Only one active season per user.
create unique index seasons_one_active on public.seasons (user_id) where is_active;

-- ---------------------------------------------------------------- row-level security
alter table public.trackers enable row level security;
alter table public.entries  enable row level security;
alter table public.seasons  enable row level security;

create policy "own trackers" on public.trackers for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own entries" on public.entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own seasons" on public.seasons for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
