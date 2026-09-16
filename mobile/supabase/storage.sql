-- Optional Supabase Storage setup for Enrich.
-- Run after schema.sql if the app will upload avatars, CVs or post media.

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('cvs', 'cvs', false),
  ('post-media', 'post-media', true)
on conflict (id) do nothing;

-- AVATARS
drop policy if exists "Public can view avatars" on storage.objects;
create policy "Public can view avatars"
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatars" on storage.objects;
create policy "Users can upload own avatars"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own avatars" on storage.objects;
create policy "Users can update own avatars"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- CVS
drop policy if exists "Users can view own CV files" on storage.objects;
create policy "Users can view own CV files"
on storage.objects for select to authenticated
using (
  bucket_id = 'cvs'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

drop policy if exists "Users can upload own CV files" on storage.objects;
create policy "Users can upload own CV files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'cvs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own CV files" on storage.objects;
create policy "Users can update own CV files"
on storage.objects for update to authenticated
using (
  bucket_id = 'cvs'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'cvs'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- POST MEDIA
drop policy if exists "Authenticated can view post media" on storage.objects;
create policy "Authenticated can view post media"
on storage.objects for select to authenticated
using (bucket_id = 'post-media');

drop policy if exists "Users can upload own post media" on storage.objects;
create policy "Users can upload own post media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'post-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
