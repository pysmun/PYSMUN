alter table public.applications
  add column if not exists applicant_cnic text,
  add column if not exists photo_path text,
  add column if not exists photo_mime_type text,
  add column if not exists photo_size_bytes integer;

create unique index if not exists applications_program_cnic_idx
  on public.applications (program_slug, applicant_cnic)
  where applicant_cnic is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'application-photos',
  'application-photos',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- The bucket remains private. Application uploads are performed only with the
-- server-side service role; no anon or authenticated storage policy is added.
