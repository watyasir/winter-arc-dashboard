-- Gallery (docs/API.md): images and PDFs Claude sends from chats, kept as the exact original bytes.
--
-- storage bucket "gallery": private, 25 MB per file, PNG / JPG / SVG / PDF / WebP only.
--   Files live under <owner's user id>/<random id>.<ext>. The upload API writes with the secret key;
--   the signed-in owner can read (signed URLs) and delete their own files, nothing else.
-- gallery_items: one row per file (title, category, description, size, pixel size, source chat).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', false, 26214400, array['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf', 'image/webp'])
on conflict (id) do nothing;

create table public.gallery_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  title       text not null check (char_length(title) between 1 and 120),
  category    text not null check (category in ('Health', 'Education', 'Money', 'Work', 'Home', 'Build', 'Life')),
  description text check (description is null or char_length(description) <= 2000),
  file_path   text not null unique,
  mime        text not null check (mime in ('image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf', 'image/webp')),
  width       integer check (width is null or width > 0),
  height      integer check (height is null or height > 0),
  bytes       bigint not null check (bytes > 0 and bytes <= 26214400),
  source_chat text check (source_chat is null or char_length(source_chat) <= 120),
  created_at  timestamptz not null default now()
);
create index gallery_items_user_time on public.gallery_items (user_id, created_at desc);

alter table public.gallery_items enable row level security;
create policy "gallery_items: owner reads" on public.gallery_items
  for select using (user_id = (select auth.uid()));
create policy "gallery_items: owner deletes" on public.gallery_items
  for delete using (user_id = (select auth.uid()));

create policy "gallery files: owner reads" on storage.objects
  for select using (bucket_id = 'gallery' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "gallery files: owner deletes" on storage.objects
  for delete using (bucket_id = 'gallery' and (storage.foldername(name))[1] = (select auth.uid())::text);
