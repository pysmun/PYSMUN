-- One WhatsApp number = one application per program (matches the existing
-- email and CNIC rules). Note: siblings sharing a family WhatsApp number will
-- not both be able to apply to the same program.

create unique index if not exists applications_program_phone_idx
  on public.applications (program_slug, applicant_phone);
