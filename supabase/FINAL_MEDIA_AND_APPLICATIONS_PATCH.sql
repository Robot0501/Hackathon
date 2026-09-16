-- Enrich final media + recruiter applicant-management patch
-- Safe to run more than once. Does not delete auth users, profiles, posts, or applications.

-- -----------------------------------------------------------------------------
-- Recruiter applicant management
-- -----------------------------------------------------------------------------
-- Students can update their own application, admins can moderate, and the company
-- that owns the opportunity can move applicants through reviewing/shortlist/reject.
drop policy if exists "applications_update" on public.applications;
create policy "applications_update" on public.applications
for update to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.opportunities o
    where o.id = opportunity_id
      and o.company_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.opportunities o
    where o.id = opportunity_id
      and o.company_id = auth.uid()
  )
);

-- -----------------------------------------------------------------------------
-- Media storage for profile photos and project screenshots
-- Paths are <auth-user-id>/<purpose>/<filename>
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('enrich-media', 'enrich-media', true)
on conflict (id) do update set public = true;

-- Remove both earlier and final-patch policy names so this migration stays clean/idempotent.
drop policy if exists "enrich_media_public_read" on storage.objects;
drop policy if exists "enrich_media_user_insert" on storage.objects;
drop policy if exists "enrich_media_user_update" on storage.objects;
drop policy if exists "enrich_media_user_delete" on storage.objects;
drop policy if exists "enrich_media_read" on storage.objects;
drop policy if exists "enrich_media_insert_own" on storage.objects;
drop policy if exists "enrich_media_update_own" on storage.objects;
drop policy if exists "enrich_media_delete_own" on storage.objects;

create policy "enrich_media_public_read" on storage.objects
for select
using (bucket_id = 'enrich-media');

create policy "enrich_media_user_insert" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'enrich-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "enrich_media_user_update" on storage.objects
for update to authenticated
using (
  bucket_id = 'enrich-media'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
)
with check (
  bucket_id = 'enrich-media'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

create policy "enrich_media_user_delete" on storage.objects
for delete to authenticated
using (
  bucket_id = 'enrich-media'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

-- Clear the old stock-photo defaults so users without an uploaded photo get
-- neutral initials instead of a pre-selected person image.
update public.profiles
set avatar = ''
where avatar like 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6%'
   or avatar like 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2%'
   or avatar like 'https://images.unsplash.com/photo-1560250097-0b93528c311a%';

select 'Enrich final media + recruiter application patch complete.' as result;
