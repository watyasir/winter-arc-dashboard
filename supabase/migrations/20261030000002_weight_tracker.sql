-- Final build (30 Oct 2026): weight in the daily check-in, as a tracker (kg, typed in, blank = not logged).
-- The weekly body check keeps its own weight too; the Health chart uses both (the check-in wins on the same day).
-- Works with or without 20261030000001_day_plan_log.sql. Same row as src/lib/default-trackers.ts.

insert into public.trackers (user_id, slug, name, area, type, unit, sort_order)
select u.user_id, 'weight', 'Weight', 'Body', 'number', 'kg', 45
from (select distinct user_id from public.trackers) u
on conflict (user_id, slug) do nothing;
