-- Tasks API: Claude keeps the Board in sync through POST/GET/DELETE /api/tasks (docs/API.md).
--   note:         a short line under the title on the card
--   sort_order:   higher = more important; the top "Home" task is pinned on Overview
--   external_id:  the task's name in Claude's list, used to upsert. Tasks made in the app
--                 get one automatically (app-…), so Claude can update or delete those too
--   updated_by:   who changed it last, Yasir (the app) or Claude (the API)
-- status, owner, area, due_date and updated_at already exist (20261021000001_tasks_goals.sql).

alter table public.tasks
  add column note        text check (note is null or char_length(note) <= 500),
  add column sort_order  integer not null default 0,
  add column external_id text not null
    default ('app-' || left(replace(gen_random_uuid()::text, '-', ''), 16))
    check (char_length(external_id) between 1 and 100),
  add column updated_by  text not null default 'Yasir' check (updated_by in ('Yasir', 'Claude'));

alter table public.tasks
  add constraint tasks_user_external_id unique (user_id, external_id);

-- The Board sorts each column by importance, then due date.
create index tasks_user_order on public.tasks (user_id, sort_order desc, due_date);
