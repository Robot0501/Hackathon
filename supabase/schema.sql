create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists name text default '';
alter table public.profiles add column if not exists role text default 'student';
alter table public.profiles add column if not exists verification_status text default 'unverified';
alter table public.profiles add column if not exists verification_id text;
alter table public.profiles add column if not exists avatar text default '';
alter table public.profiles add column if not exists headline text default '';
alter table public.profiles add column if not exists summary text default '';
alter table public.profiles add column if not exists programme text;
alter table public.profiles add column if not exists campus text;
alter table public.profiles add column if not exists enrolment_year integer;
alter table public.profiles add column if not exists graduation_year integer;
alter table public.profiles add column if not exists current_company text;
alter table public.profiles add column if not exists "current_role" text;
alter table public.profiles add column if not exists technical_skills text[] default '{}';
alter table public.profiles add column if not exists professional_skills text[] default '{}';
alter table public.profiles add column if not exists endorsements jsonb default '[]'::jsonb;
alter table public.profiles add column if not exists work_experience jsonb default '[]'::jsonb;
alter table public.profiles add column if not exists portfolio_links jsonb default '{}'::jsonb;
alter table public.profiles add column if not exists digital_badges jsonb default '[]'::jsonb;
alter table public.profiles add column if not exists achievements jsonb default '[]'::jsonb;
alter table public.profiles add column if not exists clubs_societies text[] default '{}';
alter table public.profiles add column if not exists career_interests text[] default '{}';
alter table public.profiles add column if not exists career_aspirations text default '';
alter table public.profiles add column if not exists cv_file_name text;
alter table public.profiles add column if not exists profile_completeness integer default 0;
alter table public.profiles add column if not exists business_details jsonb;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Make email unique when possible.
create unique index if not exists profiles_email_unique_idx
on public.profiles(email)
where email is not null;

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_campus_idx on public.profiles(campus);
create index if not exists profiles_verification_status_idx
on public.profiles(verification_status);

alter table public.profiles enable row level security;

drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Credentials/passwords are NOT stored here.
-- They are managed by Supabase Auth (auth.users).
-- The frontend creates the auth user first, then inserts/updates this profile row.