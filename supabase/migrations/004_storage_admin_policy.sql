-- Lets signed-in organizers view applicant photos and receipts (the admin
-- console loads them through short-lived signed URLs).
--
-- NOTE: on some newer Supabase projects the SQL editor cannot create policies
-- on storage.objects and this fails with "must be owner of table objects".
-- If that happens, create the identical policy through the dashboard instead:
--   Storage -> application-photos -> Policies -> New policy
--   Operation: SELECT, target roles: authenticated
--   USING expression:  public.is_admin()
-- (The dashboard scopes the policy to the bucket automatically.)

create policy "Admins can read application photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'application-photos' and public.is_admin());
