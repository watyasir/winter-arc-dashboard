-- v9 Playground: the chosen theme, one row per user, so it's the same on the Mac and the iPhone.
-- Additive: nothing existing changes. Without a row the app uses 'candy'.

create table if not exists public.user_prefs (
  user_id    uuid primary key default auth.uid() references auth.users on delete cascade,
  theme      text not null default 'candy' check (theme in ('candy', 'matcha', 'sunset')),
  updated_at timestamptz not null default now()
);

alter table public.user_prefs enable row level security;

create policy "own prefs" on public.user_prefs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
