-- Review lifecycle, payment tracking, and organizer (admin) access.

-- 1. Review status lifecycle -------------------------------------------------

alter table public.applications
  drop constraint if exists applications_review_status_check;

alter table public.applications
  add constraint applications_review_status_check
  check (review_status in ('received', 'under_review', 'accepted', 'waitlisted', 'rejected'));

-- 2. Payment tracking --------------------------------------------------------

alter table public.applications
  add column if not exists payment_status text not null default 'pending',
  add column if not exists payment_reference text,
  add column if not exists receipt_path text,
  add column if not exists receipt_mime_type text,
  add column if not exists receipt_size_bytes integer,
  add column if not exists payment_updated_at timestamptz;

alter table public.applications
  drop constraint if exists applications_payment_status_check;

alter table public.applications
  add constraint applications_payment_status_check
  check (payment_status in ('pending', 'proof_submitted', 'verified', 'confirmed'));

-- 3. Organizer accounts ------------------------------------------------------
-- Organizers sign in through Supabase Auth; only emails present in admin_users
-- get access. Manage this table with the service role (or the SQL editor):
--   insert into public.admin_users (email) values ('organizer@example.com');
-- Disable public signups in Supabase Auth settings; create organizer users
-- from the dashboard (Authentication -> Users -> Add user).

create table if not exists public.admin_users (
  email text primary key,
  added_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Let signed-in admins see whether they are on the list (harmless: their own row only).
create policy "Admins can see their own entry"
  on public.admin_users for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- 4. Admin access to applications -------------------------------------------

grant select, update on public.applications to authenticated;

create policy "Admins can read applications"
  on public.applications for select to authenticated
  using (public.is_admin());

create policy "Admins can update applications"
  on public.applications for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5. Keep updated_at accurate on every edit ----------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- Storage access for admins lives in 004_storage_admin_policy.sql (kept
-- separate because some Supabase projects restrict SQL DDL on storage.objects).
