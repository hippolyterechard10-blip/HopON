-- Wave 11 — Storage buckets for horse photos, task photos, avatars.
-- Run after the bucket exists (create via dashboard or supabase storage CLI):
--   supabase storage create-bucket horse-photos --public
--   supabase storage create-bucket task-photos
--   supabase storage create-bucket avatars --public
--
-- Policies below scope access — RLS on storage.objects.

-- Horse photos: barn members read; staff write.
create policy "horse_photos_read"
  on storage.objects for select
  using (
    bucket_id = 'horse-photos'
  );

create policy "horse_photos_write"
  on storage.objects for insert
  with check (
    bucket_id = 'horse-photos' and auth.role() = 'authenticated'
  );

create policy "horse_photos_update"
  on storage.objects for update
  using (bucket_id = 'horse-photos' and auth.uid() = owner)
  with check (bucket_id = 'horse-photos' and auth.uid() = owner);

-- Task photos: authenticated members can read + insert their own.
create policy "task_photos_read"
  on storage.objects for select
  using (bucket_id = 'task-photos' and auth.role() = 'authenticated');

create policy "task_photos_write"
  on storage.objects for insert
  with check (bucket_id = 'task-photos' and auth.role() = 'authenticated');

-- Avatars: public read, owner write.
create policy "avatars_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_write"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "avatars_update"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid() = owner)
  with check (bucket_id = 'avatars' and auth.uid() = owner);
