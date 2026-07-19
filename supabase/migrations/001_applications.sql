create table if not exists public.applications (
  id uuid primary key,
  reference_code text not null unique,
  program_slug text not null,
  applicant_email text not null,
  applicant_phone text not null,
  applicant_cnic text not null,
  photo_path text not null,
  photo_mime_type text not null,
  photo_size_bytes integer not null,
  payload jsonb not null,
  review_status text not null default 'received',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_slug, applicant_email)
);

alter table public.applications enable row level security;

-- No policy is intentionally granted to anon or authenticated roles.
-- Submissions are written by the server-only service role after validation.
revoke all on public.applications from anon, authenticated;

create index if not exists applications_program_status_idx
  on public.applications (program_slug, review_status, submitted_at desc);

create unique index if not exists applications_program_cnic_idx
  on public.applications (program_slug, applicant_cnic);

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
