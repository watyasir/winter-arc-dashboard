-- Phase 5: tasks and goals.
--   tasks:          one to-do with an area, an optional due date and a Board column (status)
--   goals:          a target by a deadline; progress is typed in by hand or comes from a tracker
--   goal_progress:  for tracker-linked goals, the tracker's total since the goal started
-- Same rules as the earlier tables: every row belongs to one user, locked by row-level security.

-- ---------------------------------------------------------------- tasks
create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 120),
  area        text not null default '' check (char_length(area) <= 40),
  due_date    date,
  -- The Board column: To do, In progress, Waiting, Done.
  status      text not null default 'todo' check (status in ('todo', 'doing', 'waiting', 'done')),
  -- Who's on it. Claude's tasks arrive through the logging API (Phase 8).
  owner       text not null default 'Me' check (owner in ('Me', 'Claude', 'Both')),
  done_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index tasks_user_status on public.tasks (user_id, status, due_date);

-- done_at follows the status, so "done in the last two weeks" is easy to read.
create function public.tasks_set_done_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status = 'done' and (tg_op = 'INSERT' or old.status <> 'done') then
    new.done_at := now();
  elsif new.status <> 'done' then
    new.done_at := null;
  end if;
  return new;
end;
$$;

create trigger tasks_done_at before insert or update on public.tasks
  for each row execute function public.tasks_set_done_at();

create trigger tasks_touch before update on public.tasks
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- goals
create table public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 60),
  area        text not null default '' check (char_length(area) <= 40),
  target      numeric not null check (target > 0 and target < 1e9),
  unit        text check (unit is null or char_length(unit) <= 12),
  deadline    date,
  -- Linked: progress = the tracker's total since start_date. Not linked: progress = current.
  tracker_id  uuid references public.trackers (id) on delete set null,
  current     numeric not null default 0 check (current >= 0 and current < 1e9),
  start_date  date not null default (now() at time zone 'Asia/Kolkata')::date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index goals_user on public.goals (user_id, deadline);

create trigger goals_touch before update on public.goals
  for each row execute function public.touch_updated_at();

-- A goal can only follow one of its owner's own trackers.
create function public.goal_tracker_owner_matches() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.tracker_id is not null and not exists (
    select 1 from public.trackers t where t.id = new.tracker_id and t.user_id = new.user_id
  ) then
    raise exception 'tracker does not belong to this user';
  end if;
  return new;
end;
$$;

create trigger goals_tracker_owner_check before insert or update on public.goals
  for each row execute function public.goal_tracker_owner_matches();

-- Yes/no entries are 0 or 1, so their sum is the number of days done.
-- security_invoker: the view reads as the signed-in user, so row-level security still applies.
create view public.goal_progress with (security_invoker = true) as
  select g.id as goal_id, coalesce(sum(e.value), 0) as tracked
  from public.goals g
  join public.entries e on e.tracker_id = g.tracker_id and e.entry_date >= g.start_date
  group by g.id;

-- ---------------------------------------------------------------- row-level security
alter table public.tasks enable row level security;
alter table public.goals enable row level security;

create policy "own tasks" on public.tasks for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own goals" on public.goals for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
