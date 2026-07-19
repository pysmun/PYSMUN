-- Payment is collected with the application (first-come-first-served), so the
-- lifecycle simplifies to: proof_submitted -> confirmed | invalid.
-- 'pending' remains only as the default for free programs (Campus Ambassador),
-- where payment is not shown. 'verified' is removed (it duplicated 'confirmed').

alter table public.applications
  drop constraint if exists applications_payment_status_check;

update public.applications set payment_status = 'confirmed' where payment_status = 'verified';

alter table public.applications
  add constraint applications_payment_status_check
  check (payment_status in ('pending', 'proof_submitted', 'confirmed', 'invalid'));
