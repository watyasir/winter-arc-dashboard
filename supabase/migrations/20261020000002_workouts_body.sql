-- Phase 4: workouts and the weekly body check.
--   workouts:      one gym session on one date
--   workout_sets:  one set in a session (exercise, reps, weight)
--   body_checks:   the weekly check (weight, waist, chest, arms, progress photo yes/no)
--   user_settings: one row per user for small settings, starting with the goal weight
-- Same rules as the Phase 2 tables: every row belongs to one user, locked by row-level security.

-- ---------------------------------------------------------------- workouts
create table public.workouts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  workout_date  date not null,
  name          text not null check (char_length(name) between 1 and 60),
  created_at    timestamptz not null default now()
);

create index workouts_user_date on public.workouts (user_id, workout_date desc);

create table public.workout_sets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  workout_id  uuid not null references public.workouts (id) on delete cascade,
  -- Order inside the session: exercises keep the order they were logged in.
  position    integer not null check (position >= 0),
  exercise    text not null check (char_length(exercise) between 1 and 60),
  reps        integer not null check (reps between 1 and 500),
  -- Kilograms. Empty = bodyweight.
  weight_kg   numeric check (weight_kg is null or (weight_kg >= 0 and weight_kg < 1000))
);

create index workout_sets_workout on public.workout_sets (workout_id, position);

-- A set's workout must belong to the same user.
create function public.set_workout_owner_matches() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not exists (
    select 1 from public.workouts w where w.id = new.workout_id and w.user_id = new.user_id
  ) then
    raise exception 'workout does not belong to this user';
  end if;
  return new;
end;
$$;

create trigger workout_sets_owner_check before insert or update on public.workout_sets
  for each row execute function public.set_workout_owner_matches();

-- Saves a session and all its sets in one go, so a half-saved workout can't happen.
-- p_sets: [{ "exercise": "Bench press", "reps": 8, "weight_kg": 60 }, ...] in order.
-- Runs as the signed-in user (security invoker), so row-level security still applies.
create function public.save_workout(p_date date, p_name text, p_sets jsonb) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  new_id uuid;
begin
  if jsonb_typeof(p_sets) <> 'array' or jsonb_array_length(p_sets) = 0 then
    raise exception 'a workout needs at least one set';
  end if;
  insert into public.workouts (workout_date, name) values (p_date, p_name) returning id into new_id;
  insert into public.workout_sets (workout_id, position, exercise, reps, weight_kg)
  select new_id, (s.ord - 1)::integer, s.item ->> 'exercise', (s.item ->> 'reps')::integer, (s.item ->> 'weight_kg')::numeric
  from jsonb_array_elements(p_sets) with ordinality as s (item, ord);
  return new_id;
end;
$$;

-- ---------------------------------------------------------------- body checks
create table public.body_checks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  check_date      date not null,
  weight_kg       numeric check (weight_kg is null or (weight_kg > 0 and weight_kg < 500)),
  waist_cm        numeric check (waist_cm is null or (waist_cm > 0 and waist_cm < 300)),
  chest_cm        numeric check (chest_cm is null or (chest_cm > 0 and chest_cm < 300)),
  arms_cm         numeric check (arms_cm is null or (arms_cm > 0 and arms_cm < 150)),
  -- Only whether a photo was taken. The photo itself never comes into the app.
  progress_photo  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, check_date)
);

create index body_checks_user_date on public.body_checks (user_id, check_date desc);

create trigger body_checks_touch before update on public.body_checks
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- user settings
create table public.user_settings (
  user_id         uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  weight_goal_kg  numeric check (weight_goal_kg is null or (weight_goal_kg > 0 and weight_goal_kg < 500)),
  updated_at      timestamptz not null default now()
);

create trigger user_settings_touch before update on public.user_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- row-level security
alter table public.workouts      enable row level security;
alter table public.workout_sets  enable row level security;
alter table public.body_checks   enable row level security;
alter table public.user_settings enable row level security;

create policy "own workouts" on public.workouts for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own workout sets" on public.workout_sets for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own body checks" on public.body_checks for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own settings" on public.user_settings for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
