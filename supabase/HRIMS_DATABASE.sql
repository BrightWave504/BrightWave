-- Run in Supabase SQL Editor. This creates persistent account profiles.
-- Password hashes and login identities are managed by Supabase Auth, not this table.
create table if not exists public.hrims_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null check (role in ('applicant','employee','hr','it','supervisor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hrims_profiles_role_idx on public.hrims_profiles(role);
alter table public.hrims_profiles enable row level security;
revoke all on public.hrims_profiles from anon;
grant select on public.hrims_profiles to authenticated;
-- Users see only their own profile. IT account directory is served by a privileged Edge Function.
drop policy if exists hrims_profile_read_self on public.hrims_profiles;
create policy hrims_profile_read_self on public.hrims_profiles for select to authenticated
using (user_id = (select auth.uid()));

create or replace function public.hrims_sync_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.raw_app_meta_data->>'hrims_role' in ('applicant','employee','hr','it','supervisor') then
    insert into public.hrims_profiles(user_id,email,full_name,role)
    values(new.id,coalesce(new.email,''),coalesce(new.raw_user_meta_data->>'full_name',''),new.raw_app_meta_data->>'hrims_role')
    on conflict (user_id) do update set
      email=excluded.email, full_name=excluded.full_name,role=excluded.role,updated_at=now();
  end if;
  return new;
end; $$;
drop trigger if exists hrims_sync_profile_trigger on auth.users;
create trigger hrims_sync_profile_trigger after insert or update of raw_app_meta_data,email,raw_user_meta_data
on auth.users for each row execute function public.hrims_sync_profile();
-- Backfill any existing users already assigned an HRIMS role.
insert into public.hrims_profiles(user_id,email,full_name,role)
select id,coalesce(email,''),coalesce(raw_user_meta_data->>'full_name',''),raw_app_meta_data->>'hrims_role'
from auth.users where raw_app_meta_data->>'hrims_role' in ('applicant','employee','hr','it','supervisor')
on conflict(user_id) do update set email=excluded.email,full_name=excluded.full_name,role=excluded.role,updated_at=now();

-- New self-registered users can only become applicants. Never trust a role supplied by the browser.
create or replace function public.hrims_new_applicant() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.raw_app_meta_data = coalesce(new.raw_app_meta_data,'{}'::jsonb) || '{"hrims_role":"applicant"}'::jsonb;
  return new;
end; $$;
drop trigger if exists hrims_new_applicant_trigger on auth.users;
create trigger hrims_new_applicant_trigger before insert on auth.users
for each row execute function public.hrims_new_applicant();
