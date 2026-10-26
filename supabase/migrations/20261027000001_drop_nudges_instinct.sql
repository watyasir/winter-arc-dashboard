-- Mail nudges (Phase 8b) and the Instinct link (Phase 8c) are dropped for good (27 Oct 2026).
-- Their tables were planned but may never have been created, so each drop is "if exists".
drop table if exists public.instinct_requests;
drop table if exists public.mail_nudges;
