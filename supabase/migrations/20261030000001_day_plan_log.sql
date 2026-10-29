-- M4: the check-in logs what the day plan asks for, as trackers (data), not new tables.
--   time_of_day: lights out, wake (value = minutes after midnight, 0-1439)
--   choice:      each meal slot (value = option number; options in scale_labels, first = default)
--   group_name:  trackers that share one card on the check-in (Meals, Blood pressure)
-- Also adds the new trackers to every account that already has trackers.
-- Same list as src/lib/default-trackers.ts.

alter table public.trackers drop constraint trackers_type_check;
alter table public.trackers add constraint trackers_type_check
  check (type in ('checkbox', 'number', 'scale_1_5', 'duration_minutes', 'time_of_day', 'choice'));

-- A 1-5 scale still has 5 words; a choice has 2 to 5 options.
alter table public.trackers drop constraint trackers_scale_labels_check;
alter table public.trackers add constraint trackers_scale_labels_check
  check (scale_labels is null or cardinality(scale_labels) between 2 and 5);

alter table public.trackers add column group_name text check (group_name is null or length(group_name) <= 40);

insert into public.trackers (user_id, slug, name, area, type, unit, scale_labels, group_name, sort_order)
select u.user_id, v.slug, v.name, v.area, v.type, v.unit, v.scale_labels, v.group_name, v.sort_order
from (select distinct user_id from public.trackers) u
cross join (
  values
    ('lights-out',   'Lights out',              'Health', 'time_of_day', null,   null::text[], null,             11),
    ('wake',         'Woke up',                 'Health', 'time_of_day', null,   null,         null,             12),
    ('meal-1',       'Pre-gym',                 'Health', 'choice',      null,   array['Planned', 'Swapped', 'Skipped'], 'Meals', 21),
    ('meal-2',       'Breakfast',               'Health', 'choice',      null,   array['Planned', 'Swapped', 'Skipped'], 'Meals', 22),
    ('meal-3',       'Lunch',                   'Health', 'choice',      null,   array['Planned', 'Swapped', 'Skipped'], 'Meals', 23),
    ('meal-4',       'Snack 1',                 'Health', 'choice',      null,   array['Planned', 'Swapped', 'Skipped'], 'Meals', 24),
    ('meal-5',       'Dinner',                  'Health', 'choice',      null,   array['Planned', 'Swapped', 'Skipped'], 'Meals', 25),
    ('meal-6',       'Snack 2',                 'Health', 'choice',      null,   array['Planned', 'Swapped', 'Skipped'], 'Meals', 26),
    ('meal-7',       'Night',                   'Health', 'choice',      null,   array['Planned', 'Swapped', 'Skipped'], 'Meals', 27),
    ('bp-am-sys',    'Morning systolic',        'Health', 'number',      'mmHg', null,         'Blood pressure', 31),
    ('bp-am-dia',    'Morning diastolic',       'Health', 'number',      'mmHg', null,         'Blood pressure', 32),
    ('bp-pm-sys',    'Evening systolic',        'Health', 'number',      'mmHg', null,         'Blood pressure', 33),
    ('bp-pm-dia',    'Evening diastolic',       'Health', 'number',      'mmHg', null,         'Blood pressure', 34),
    ('reading-page', 'Reading page',            'Mind',   'number',      'page', null,         null,             75)
) as v(slug, name, area, type, unit, scale_labels, group_name, sort_order)
on conflict (user_id, slug) do nothing;
