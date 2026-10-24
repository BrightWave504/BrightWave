-- Run once in Supabase SQL Editor. Assigns ONLY the applicant role to new signups.
-- Administrator roles must be assigned separately by a trusted admin.
create or replace function public.hrims_assign_applicant_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('hrims_role', 'applicant');
  return new;
end;
$$;

drop trigger if exists hrims_new_user_role on auth.users;
create trigger hrims_new_user_role
before insert on auth.users
for each row execute function public.hrims_assign_applicant_role();
