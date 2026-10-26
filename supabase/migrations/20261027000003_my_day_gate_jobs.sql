-- My Day, the action gate and Claude's scheduled tasks (docs/API.md).
--
-- tasks, for the action gate (the pop-up for tasks due within 3 days):
--   next_steps:       one short line, "what to do next"
--   questions:        open questions for Yasir (the card shows 2)
--   chat_name:        the Claude chat with the details
--   gate_quiet_until: answered on the gate; skipped until this time (the next midnight in India)
-- gate_log:    every answer on the gate (task, choice, time)
-- claude_jobs: Claude's scheduled tasks, shown beside the Board, never mixed with tasks
-- day_plans:   the day plan on Overview (phases + sections), sent by Claude through the API.
--              It lives only here, never in the public repo.

alter table public.tasks
  add column next_steps       text check (next_steps is null or char_length(next_steps) <= 200),
  add column questions        text[] not null default '{}' check (cardinality(questions) <= 5),
  add column chat_name        text check (chat_name is null or char_length(chat_name) <= 100),
  add column gate_quiet_until timestamptz;

create table public.gate_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  task_id    uuid references public.tasks on delete set null,
  choice     text not null check (choice in ('done', 'doing', 'snooze', 'move')),
  new_due    date,
  created_at timestamptz not null default now()
);
create index gate_log_user_time on public.gate_log (user_id, created_at desc);

create table public.claude_jobs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  name       text not null check (char_length(name) between 1 and 100),
  schedule   text not null default '' check (char_length(schedule) <= 100),
  status     text not null default 'scheduled' check (status in ('ok', 'failed', 'running', 'scheduled', 'paused')),
  last_run   timestamptz,
  next_run   timestamptz,
  updated_at timestamptz not null default now(),
  constraint claude_jobs_user_name unique (user_id, name)
);

create table public.day_plans (
  user_id    uuid primary key references auth.users on delete cascade,
  plan       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.gate_log enable row level security;
alter table public.claude_jobs enable row level security;
alter table public.day_plans enable row level security;

create policy "own gate log" on public.gate_log for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Claude writes these through the API (secret key); the app only reads them.
create policy "own claude jobs" on public.claude_jobs for select to authenticated
  using (user_id = (select auth.uid()));

create policy "own day plan" on public.day_plans for select to authenticated
  using (user_id = (select auth.uid()));
