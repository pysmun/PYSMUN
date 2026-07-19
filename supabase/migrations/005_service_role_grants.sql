-- This project was created with "Automatically expose new tables" disabled,
-- so table privileges must be granted explicitly. service_role is the
-- server-side role used by the website's API routes; it bypasses RLS but
-- still requires ordinary table privileges.

grant usage on schema public to anon, authenticated, service_role;

grant all on public.applications to service_role;
grant all on public.admin_users to service_role;
