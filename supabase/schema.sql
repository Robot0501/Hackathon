<<<<<<< HEAD
-- Enrich Mobile - complete Supabase schema
-- Run this in Supabase SQL Editor after the original profiles table setup.
-- It is intentionally idempotent and does NOT drop existing data.

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Profiles (compatible with the existing Phase 1 profiles table)
-- -----------------------------------------------------------------------------
=======
-- Enrich complete Supabase schema
-- Safe to keep in Git. Run in Supabase SQL Editor.
-- This file is designed to work with the existing profiles table from Phase 1.

create extension if not exists pgcrypto;

-- =========================================================
-- PROFILES
-- =========================================================
>>>>>>> main
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

<<<<<<< HEAD
create unique index if not exists profiles_email_unique_idx on public.profiles(lower(email)) where email is not null;
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_verification_status_idx on public.profiles(verification_status);

-- Helper functions use SECURITY DEFINER so policy checks do not recurse through RLS.
=======
create unique index if not exists profiles_email_unique_idx
  on public.profiles(email) where email is not null;
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_campus_idx on public.profiles(campus);
create index if not exists profiles_verification_status_idx on public.profiles(verification_status);

-- =========================================================
-- HELPER FUNCTIONS
-- =========================================================
>>>>>>> main
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
<<<<<<< HEAD
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and verification_status = 'verified'
  );
$$;

create or replace function public.is_verified_business()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'business'
      and verification_status = 'verified'
  );
$$;


create or replace function public.is_verified_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and verification_status = 'verified'
  );
$$;

-- Every new Supabase Auth user gets a starter profile.
-- Public clients are NEVER allowed to create an admin role through metadata.
=======
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

>>>>>>> main
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
<<<<<<< HEAD
declare
  requested_role text;
  safe_role text;
  safe_email text;
begin
  safe_email := lower(coalesce(new.email, ''));
  requested_role := new.raw_user_meta_data ->> 'role';

  if requested_role is null then
    -- Dashboard-created Richfield staff users are allowed so they can be promoted
    -- to admin afterwards. Public mobile registration always supplies a role.
    if safe_email like '%@richfield.ac.za' or safe_email like '%@my.richfield.ac.za' then
      safe_role := 'student';
    else
      raise exception 'A valid Enrich registration role is required';
    end if;
  elsif requested_role in ('student', 'alumni', 'business') then
    safe_role := requested_role;
  else
    safe_role := 'student';
  end if;

  if requested_role in ('student', 'alumni') and safe_email not like '%@my.richfield.ac.za' then
    raise exception 'Students and alumni must use a @my.richfield.ac.za email address';
  end if;

  insert into public.profiles (
    id, email, name, role, verification_status, verification_id,
    programme, campus, graduation_year, current_company,
    business_details, created_at, updated_at
  )
  values (
    new.id,
    safe_email,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    safe_role,
    case when safe_role = 'business' then 'pending' else 'unverified' end,
=======
begin
  insert into public.profiles (
    id, email, name, role, verification_status, verification_id,
    programme, campus, graduation_year, current_company, business_details
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    coalesce(new.raw_user_meta_data ->> 'verification_status', 'unverified'),
>>>>>>> main
    nullif(new.raw_user_meta_data ->> 'verification_id', ''),
    nullif(new.raw_user_meta_data ->> 'programme', ''),
    nullif(new.raw_user_meta_data ->> 'campus', ''),
    case
      when nullif(new.raw_user_meta_data ->> 'graduation_year', '') is not null
      then (new.raw_user_meta_data ->> 'graduation_year')::integer
      else null
    end,
    nullif(new.raw_user_meta_data ->> 'current_company', ''),
    case
      when new.raw_user_meta_data ? 'business_details'
      then new.raw_user_meta_data -> 'business_details'
      else null
<<<<<<< HEAD
    end,
    now(), now()
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

=======
    end
  )
  on conflict (id) do update
  set email = excluded.email,
      name = excluded.name,
      role = excluded.role,
      verification_status = excluded.verification_status,
      updated_at = now();
>>>>>>> main
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

<<<<<<< HEAD
-- Prevent ordinary users from promoting themselves to admin or self-approving a business.
create or replace function public.protect_profile_security_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.is_admin() then
    if new.role = 'admin' and old.role <> 'admin' then
      raise exception 'Admin role can only be assigned by an administrator';
    end if;

    if old.role = 'business' and new.verification_status = 'verified'
       and old.verification_status <> 'verified' then
      raise exception 'Business accounts require administrator approval';
    end if;

    if old.role = 'business' and new.role <> 'business' then
      raise exception 'Business role cannot be changed by the account owner';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_profile_security_fields on public.profiles;
create trigger protect_profile_security_fields
before update on public.profiles
for each row execute function public.protect_profile_security_fields();

-- -----------------------------------------------------------------------------
-- Feed
-- -----------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  type text not null default 'text' check (type in ('text','showcase','video','career_journey','campus_update')),
=======
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- =========================================================
-- POSTS / COMMENTS / LIKES
-- =========================================================
create table if not exists public.posts (
  id text primary key,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null,
  author_role text not null,
  author_avatar text default '',
  author_headline text default '',
  campus text,
  content text not null,
  type text not null,
>>>>>>> main
  video_url text,
  video_thumbnail text,
  video_duration text,
  media_url text,
  tags text[] not null default '{}',
  flagged boolean not null default false,
<<<<<<< HEAD
  target_audience text not null default 'all' check (target_audience in ('all','students','alumni','business')),
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
=======
  target_audience text not null default 'all',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id text primary key,
  post_id text not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null,
  author_role text not null,
  author_avatar text default '',
>>>>>>> main
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.post_likes (
<<<<<<< HEAD
  post_id uuid not null references public.posts(id) on delete cascade,
=======
  post_id text not null references public.posts(id) on delete cascade,
>>>>>>> main
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

<<<<<<< HEAD
-- -----------------------------------------------------------------------------
-- Opportunities and applications
-- -----------------------------------------------------------------------------
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.profiles(id) on delete cascade,
  company_name text not null,
  company_logo text default '',
  title text not null,
  type text not null check (type in ('internship','learnership','part_time','graduate_vacancy')),
  location text not null default '',
=======
create index if not exists posts_author_idx on public.posts(author_id);
create index if not exists comments_post_idx on public.comments(post_id);
create index if not exists post_likes_post_idx on public.post_likes(post_id);

-- =========================================================
-- OPPORTUNITIES / APPLICATIONS
-- =========================================================
create table if not exists public.opportunities (
  id text primary key,
  company_id uuid references public.profiles(id) on delete set null,
  company_name text not null,
  company_logo text default '',
  title text not null,
  type text not null,
  location text not null,
>>>>>>> main
  is_remote boolean not null default false,
  campus_target text,
  required_programme text[] not null default '{}',
  required_skills text[] not null default '{}',
<<<<<<< HEAD
  description text not null default '',
  responsibilities text[] not null default '{}',
  stipend_salary text not null default '',
  closing_date text not null default '',
  status text not null default 'pending_approval' check (status in ('approved','pending_approval','rejected','closed')),
  applicants_count integer not null default 0,
=======
  description text not null,
  responsibilities text[] not null default '{}',
  stipend_salary text default '',
  closing_date text default '',
  status text not null default 'pending_approval',
  applicants_count integer not null default 0,
  match_score integer,
>>>>>>> main
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
<<<<<<< HEAD
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  availability text not null default '',
  motivation text not null default '',
  status text not null default 'submitted' check (status in ('submitted','reviewing','shortlisted','rejected','accepted')),
  created_at timestamptz not null default now(),
  unique(opportunity_id, user_id)
);

create or replace function public.sync_application_count()
=======
  opportunity_id text not null references public.opportunities(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opportunity_id, applicant_id)
);

create index if not exists opportunities_company_idx on public.opportunities(company_id);
create index if not exists applications_applicant_idx on public.applications(applicant_id);
create index if not exists applications_opportunity_idx on public.applications(opportunity_id);

create or replace function public.sync_opportunity_applicant_count()
>>>>>>> main
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
<<<<<<< HEAD
    update public.opportunities set applicants_count = applicants_count + 1, updated_at = now() where id = new.opportunity_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.opportunities set applicants_count = greatest(applicants_count - 1, 0), updated_at = now() where id = old.opportunity_id;
=======
    update public.opportunities
      set applicants_count = applicants_count + 1
      where id = new.opportunity_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.opportunities
      set applicants_count = greatest(applicants_count - 1, 0)
      where id = old.opportunity_id;
>>>>>>> main
    return old;
  end if;
  return null;
end;
$$;

<<<<<<< HEAD
drop trigger if exists application_count_insert on public.applications;
create trigger application_count_insert after insert on public.applications for each row execute function public.sync_application_count();
drop trigger if exists application_count_delete on public.applications;
create trigger application_count_delete after delete on public.applications for each row execute function public.sync_application_count();

-- -----------------------------------------------------------------------------
-- Events and RSVPs
-- -----------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('career_fair','hackathon','workshop','industry_talk','alumni_panel','alumni_mixer')),
  date text not null,
  time text not null,
  location text not null,
  campus text not null default '',
  description text not null default '',
  organizer text not null default 'Richfield College',
  rsvp_count integer not null default 0,
  speaker text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.event_rsvps (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(event_id, user_id)
);

create or replace function public.sync_rsvp_count()
=======
drop trigger if exists applications_count_insert on public.applications;
create trigger applications_count_insert
after insert on public.applications
for each row execute function public.sync_opportunity_applicant_count();

drop trigger if exists applications_count_delete on public.applications;
create trigger applications_count_delete
after delete on public.applications
for each row execute function public.sync_opportunity_applicant_count();

-- =========================================================
-- EVENTS / RSVPS
-- =========================================================
create table if not exists public.events (
  id text primary key,
  title text not null,
  type text not null,
  date_label text not null,
  time_label text not null,
  event_date_sort timestamptz not null default now(),
  location text not null,
  campus text not null,
  description text not null,
  organizer text not null,
  rsvp_count integer not null default 0,
  speaker text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_rsvps (
  event_id text not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create or replace function public.sync_event_rsvp_count()
>>>>>>> main
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.events set rsvp_count = rsvp_count + 1 where id = new.event_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.events set rsvp_count = greatest(rsvp_count - 1, 0) where id = old.event_id;
    return old;
  end if;
  return null;
end;
$$;

<<<<<<< HEAD
drop trigger if exists rsvp_count_insert on public.event_rsvps;
create trigger rsvp_count_insert after insert on public.event_rsvps for each row execute function public.sync_rsvp_count();
drop trigger if exists rsvp_count_delete on public.event_rsvps;
create trigger rsvp_count_delete after delete on public.event_rsvps for each row execute function public.sync_rsvp_count();

-- -----------------------------------------------------------------------------
-- Networking, messages and endorsements
-- -----------------------------------------------------------------------------
=======
drop trigger if exists event_rsvp_count_insert on public.event_rsvps;
create trigger event_rsvp_count_insert
after insert on public.event_rsvps
for each row execute function public.sync_event_rsvp_count();

drop trigger if exists event_rsvp_count_delete on public.event_rsvps;
create trigger event_rsvp_count_delete
after delete on public.event_rsvps
for each row execute function public.sync_event_rsvp_count();

-- =========================================================
-- NETWORK / MESSAGES
-- =========================================================
>>>>>>> main
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
<<<<<<< HEAD
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> receiver_id),
  unique(requester_id, receiver_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.endorsements (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  endorser_user_id uuid not null references public.profiles(id) on delete cascade,
  skill text not null,
  created_at timestamptz not null default now(),
  check (target_user_id <> endorser_user_id),
  unique(target_user_id, endorser_user_id, skill)
);

-- -----------------------------------------------------------------------------
-- Q&A forum
-- -----------------------------------------------------------------------------
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Notifications
-- -----------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('connection','opportunity','announcement','verification','message')),
=======
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> receiver_id),
  unique (requester_id, receiver_id)
);

create table if not exists public.messages (
  id text primary key,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  is_ai boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists connections_requester_idx on public.connections(requester_id);
create index if not exists connections_receiver_idx on public.connections(receiver_id);
create index if not exists messages_sender_idx on public.messages(sender_id);
create index if not exists messages_receiver_idx on public.messages(receiver_id);

-- =========================================================
-- NOTIFICATIONS / ENDORSEMENTS
-- =========================================================
create table if not exists public.notifications (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
>>>>>>> main
  title text not null,
  message text not null,
  read boolean not null default false,
  action_type text,
  created_at timestamptz not null default now()
);

<<<<<<< HEAD
-- Automatic notifications for important cross-user actions.
create or replace function public.notify_connection_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare requester_name text;
begin
  select name into requester_name from public.profiles where id = new.requester_id;
  insert into public.notifications(user_id,type,title,message)
  values(new.receiver_id,'connection','New Connection Request',coalesce(requester_name,'A Richfield member') || ' wants to connect with you.');
  return new;
end;
$$;

drop trigger if exists notify_connection_request on public.connections;
create trigger notify_connection_request after insert on public.connections for each row execute function public.notify_connection_request();

create or replace function public.notify_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare sender_name text;
begin
  select name into sender_name from public.profiles where id = new.sender_id;
  insert into public.notifications(user_id,type,title,message)
  values(new.receiver_id,'message','New Message',coalesce(sender_name,'A Richfield member') || ' sent you a message.');
  return new;
end;
$$;

drop trigger if exists notify_message on public.messages;
create trigger notify_message after insert on public.messages for each row execute function public.notify_message();

create or replace function public.notify_application()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare opp_title text; owner_id uuid;
begin
  select title, company_id into opp_title, owner_id from public.opportunities where id = new.opportunity_id;
  insert into public.notifications(user_id,type,title,message)
  values(new.user_id,'opportunity','Application Submitted','Your application for ' || coalesce(opp_title,'the opportunity') || ' was submitted.');
  if owner_id is not null and owner_id <> new.user_id then
    insert into public.notifications(user_id,type,title,message)
    values(owner_id,'opportunity','New Application','A candidate applied for ' || coalesce(opp_title,'your opportunity') || '.');
  end if;
  return new;
end;
$$;

drop trigger if exists notify_application on public.applications;
create trigger notify_application after insert on public.applications for each row execute function public.notify_application();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
=======
create table if not exists public.endorsements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  skill text not null,
  endorsed_by_id uuid not null references public.profiles(id) on delete cascade,
  endorsed_by_name text not null,
  created_at timestamptz not null default now(),
  unique (profile_id, skill, endorsed_by_id)
);

create index if not exists notifications_user_idx on public.notifications(user_id);
create index if not exists endorsements_profile_idx on public.endorsements(profile_id);

-- updated_at triggers
-- The statements below intentionally use separate triggers for portability.
drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists opportunities_set_updated_at on public.opportunities;
create trigger opportunities_set_updated_at before update on public.opportunities
for each row execute function public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at before update on public.applications
for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists connections_set_updated_at on public.connections;
create trigger connections_set_updated_at before update on public.connections
for each row execute function public.set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
>>>>>>> main
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.opportunities enable row level security;
alter table public.applications enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.connections enable row level security;
alter table public.messages enable row level security;
<<<<<<< HEAD
alter table public.endorsements enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.notifications enable row level security;

-- Profiles
-- Remove policy names used by the earlier Phase-1 schema so they cannot leave
-- broader access behind when this full schema is applied to the same project.
drop policy if exists "Authenticated users can view profiles" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated" on public.profiles for select to authenticated
using (id = auth.uid() or public.is_verified_member());
drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- Posts/comments/likes
drop policy if exists "posts_select" on public.posts;
create policy "posts_select" on public.posts for select to authenticated using (public.is_verified_member());
drop policy if exists "posts_insert" on public.posts;
create policy "posts_insert" on public.posts for insert to authenticated with check (author_id = auth.uid() and public.is_verified_member());
drop policy if exists "posts_update" on public.posts;
create policy "posts_update" on public.posts for update to authenticated using (author_id = auth.uid() or public.is_admin()) with check (author_id = auth.uid() or public.is_admin());
drop policy if exists "posts_delete" on public.posts;
create policy "posts_delete" on public.posts for delete to authenticated using (author_id = auth.uid() or public.is_admin());

drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments for select to authenticated using (public.is_verified_member());
drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert" on public.comments for insert to authenticated with check (author_id = auth.uid() and public.is_verified_member());
drop policy if exists "comments_delete" on public.comments;
create policy "comments_delete" on public.comments for delete to authenticated using (author_id = auth.uid() or public.is_admin());

drop policy if exists "likes_select" on public.post_likes;
create policy "likes_select" on public.post_likes for select to authenticated using (public.is_verified_member());
drop policy if exists "likes_insert" on public.post_likes;
create policy "likes_insert" on public.post_likes for insert to authenticated with check (user_id = auth.uid() and public.is_verified_member());
drop policy if exists "likes_delete" on public.post_likes;
create policy "likes_delete" on public.post_likes for delete to authenticated using (user_id = auth.uid());

-- Opportunities/applications
drop policy if exists "opportunities_select" on public.opportunities;
create policy "opportunities_select" on public.opportunities for select to authenticated using (public.is_verified_member() and (status = 'approved' or company_id = auth.uid() or public.is_admin()));
drop policy if exists "opportunities_insert" on public.opportunities;
create policy "opportunities_insert" on public.opportunities for insert to authenticated with check (company_id = auth.uid() and (public.is_verified_business() or public.is_admin()));
drop policy if exists "opportunities_update" on public.opportunities;
create policy "opportunities_update" on public.opportunities for update to authenticated using (company_id = auth.uid() or public.is_admin()) with check (company_id = auth.uid() or public.is_admin());
drop policy if exists "opportunities_delete" on public.opportunities;
create policy "opportunities_delete" on public.opportunities for delete to authenticated using (company_id = auth.uid() or public.is_admin());

drop policy if exists "applications_select" on public.applications;
create policy "applications_select" on public.applications for select to authenticated using (
  public.is_verified_member() and (
    user_id = auth.uid()
    or public.is_admin()
    or exists(select 1 from public.opportunities o where o.id = opportunity_id and o.company_id = auth.uid())
  )
);
drop policy if exists "applications_insert" on public.applications;
create policy "applications_insert" on public.applications for insert to authenticated with check (user_id = auth.uid() and public.is_verified_member());
drop policy if exists "applications_update" on public.applications;
create policy "applications_update" on public.applications for update to authenticated using (user_id = auth.uid() or public.is_admin());

-- Events
drop policy if exists "events_select" on public.events;
create policy "events_select" on public.events for select to authenticated using (public.is_verified_member());
drop policy if exists "events_admin_write" on public.events;
create policy "events_admin_write" on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "rsvp_select" on public.event_rsvps;
create policy "rsvp_select" on public.event_rsvps for select to authenticated using (public.is_verified_member());
drop policy if exists "rsvp_insert" on public.event_rsvps;
create policy "rsvp_insert" on public.event_rsvps for insert to authenticated with check (user_id = auth.uid() and public.is_verified_member());
drop policy if exists "rsvp_delete" on public.event_rsvps;
create policy "rsvp_delete" on public.event_rsvps for delete to authenticated using (user_id = auth.uid());

-- Connections/messages
drop policy if exists "connections_select" on public.connections;
create policy "connections_select" on public.connections for select to authenticated using (public.is_verified_member() and (requester_id = auth.uid() or receiver_id = auth.uid()));
drop policy if exists "connections_insert" on public.connections;
create policy "connections_insert" on public.connections for insert to authenticated with check (requester_id = auth.uid() and public.is_verified_member());
drop policy if exists "connections_update" on public.connections;
create policy "connections_update" on public.connections for update to authenticated using (public.is_verified_member() and (requester_id = auth.uid() or receiver_id = auth.uid())) with check (public.is_verified_member() and (requester_id = auth.uid() or receiver_id = auth.uid()));

drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages for select to authenticated using (public.is_verified_member() and (sender_id = auth.uid() or receiver_id = auth.uid()));
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages for insert to authenticated with check (sender_id = auth.uid() and public.is_verified_member());

-- Endorsements
drop policy if exists "endorsements_select" on public.endorsements;
create policy "endorsements_select" on public.endorsements for select to authenticated using (public.is_verified_member());
drop policy if exists "endorsements_insert" on public.endorsements;
create policy "endorsements_insert" on public.endorsements for insert to authenticated with check (endorser_user_id = auth.uid() and public.is_verified_member());
drop policy if exists "endorsements_delete" on public.endorsements;
create policy "endorsements_delete" on public.endorsements for delete to authenticated using (endorser_user_id = auth.uid() or public.is_admin());

-- Q&A
drop policy if exists "questions_select" on public.questions;
create policy "questions_select" on public.questions for select to authenticated using (public.is_verified_member());
drop policy if exists "questions_insert" on public.questions;
create policy "questions_insert" on public.questions for insert to authenticated with check (author_id = auth.uid() and public.is_verified_member());
drop policy if exists "questions_delete" on public.questions;
create policy "questions_delete" on public.questions for delete to authenticated using (author_id = auth.uid() or public.is_admin());
drop policy if exists "answers_select" on public.answers;
create policy "answers_select" on public.answers for select to authenticated using (public.is_verified_member());
drop policy if exists "answers_insert" on public.answers;
create policy "answers_insert" on public.answers for insert to authenticated with check (author_id = auth.uid() and public.is_verified_member());
drop policy if exists "answers_delete" on public.answers;
create policy "answers_delete" on public.answers for delete to authenticated using (author_id = auth.uid() or public.is_admin());

-- Notifications
drop policy if exists "notifications_select" on public.notifications;
create policy "notifications_select" on public.notifications for select to authenticated using (user_id = auth.uid() and public.is_verified_member());
drop policy if exists "notifications_update" on public.notifications;
create policy "notifications_update" on public.notifications for update to authenticated using (user_id = auth.uid() and public.is_verified_member()) with check (user_id = auth.uid() and public.is_verified_member());
drop policy if exists "notifications_insert_self_or_admin" on public.notifications;
create policy "notifications_insert_self_or_admin" on public.notifications for insert to authenticated with check (user_id = auth.uid() or public.is_admin());

-- Useful indexes
create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists comments_post_id_idx on public.comments(post_id);
create index if not exists opportunities_status_idx on public.opportunities(status);
create index if not exists applications_opportunity_id_idx on public.applications(opportunity_id);
create index if not exists messages_participants_idx on public.messages(sender_id, receiver_id, created_at);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);
create index if not exists questions_created_at_idx on public.questions(created_at desc);

-- -----------------------------------------------------------------------------
-- Optional Storage bucket for avatars, CV files and post media
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('enrich-media', 'enrich-media', true)
on conflict (id) do nothing;

-- Public read, authenticated uploads inside their own top-level folder: <uid>/...
drop policy if exists "enrich_media_public_read" on storage.objects;
create policy "enrich_media_public_read" on storage.objects for select using (bucket_id = 'enrich-media');
drop policy if exists "enrich_media_user_insert" on storage.objects;
create policy "enrich_media_user_insert" on storage.objects for insert to authenticated
with check (bucket_id = 'enrich-media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "enrich_media_user_update" on storage.objects;
create policy "enrich_media_user_update" on storage.objects for update to authenticated
using (bucket_id = 'enrich-media' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
drop policy if exists "enrich_media_user_delete" on storage.objects;
create policy "enrich_media_user_delete" on storage.objects for delete to authenticated
using (bucket_id = 'enrich-media' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
=======
alter table public.notifications enable row level security;
alter table public.endorsements enable row level security;

-- profiles
drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles"
on public.profiles for select to authenticated using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles for insert to authenticated with check (auth.uid() = id or public.is_admin());

drop policy if exists "Users or admins can update profiles" on public.profiles;
create policy "Users or admins can update profiles"
on public.profiles for update to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

-- posts
drop policy if exists "Authenticated can view posts" on public.posts;
create policy "Authenticated can view posts"
on public.posts for select to authenticated using (true);

drop policy if exists "Users can create own posts" on public.posts;
create policy "Users can create own posts"
on public.posts for insert to authenticated with check (author_id = auth.uid());

drop policy if exists "Authors or admins can update posts" on public.posts;
create policy "Authors or admins can update posts"
on public.posts for update to authenticated
using (author_id = auth.uid() or public.is_admin())
with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "Authors or admins can delete posts" on public.posts;
create policy "Authors or admins can delete posts"
on public.posts for delete to authenticated
using (author_id = auth.uid() or public.is_admin());

-- comments
drop policy if exists "Authenticated can view comments" on public.comments;
create policy "Authenticated can view comments"
on public.comments for select to authenticated using (true);

drop policy if exists "Users can create own comments" on public.comments;
create policy "Users can create own comments"
on public.comments for insert to authenticated with check (author_id = auth.uid());

drop policy if exists "Authors or admins can delete comments" on public.comments;
create policy "Authors or admins can delete comments"
on public.comments for delete to authenticated
using (author_id = auth.uid() or public.is_admin());

-- likes
drop policy if exists "Authenticated can view likes" on public.post_likes;
create policy "Authenticated can view likes"
on public.post_likes for select to authenticated using (true);

drop policy if exists "Users can create own likes" on public.post_likes;
create policy "Users can create own likes"
on public.post_likes for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Users can delete own likes" on public.post_likes;
create policy "Users can delete own likes"
on public.post_likes for delete to authenticated using (user_id = auth.uid());

-- opportunities
drop policy if exists "Users can view available opportunities" on public.opportunities;
create policy "Users can view available opportunities"
on public.opportunities for select to authenticated
using (status = 'approved' or company_id = auth.uid() or public.is_admin());

drop policy if exists "Businesses can create opportunities" on public.opportunities;
create policy "Businesses can create opportunities"
on public.opportunities for insert to authenticated
with check (company_id = auth.uid() or public.is_admin());

drop policy if exists "Businesses or admins can update opportunities" on public.opportunities;
create policy "Businesses or admins can update opportunities"
on public.opportunities for update to authenticated
using (company_id = auth.uid() or public.is_admin())
with check (company_id = auth.uid() or public.is_admin());

drop policy if exists "Businesses or admins can delete opportunities" on public.opportunities;
create policy "Businesses or admins can delete opportunities"
on public.opportunities for delete to authenticated
using (company_id = auth.uid() or public.is_admin());

-- applications
drop policy if exists "Relevant users can view applications" on public.applications;
create policy "Relevant users can view applications"
on public.applications for select to authenticated
using (
  applicant_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.opportunities o
    where o.id = opportunity_id and o.company_id = auth.uid()
  )
);

drop policy if exists "Students can apply" on public.applications;
create policy "Students can apply"
on public.applications for insert to authenticated with check (applicant_id = auth.uid());

drop policy if exists "Applicants businesses or admins can update applications" on public.applications;
create policy "Applicants businesses or admins can update applications"
on public.applications for update to authenticated
using (
  applicant_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.opportunities o
    where o.id = opportunity_id and o.company_id = auth.uid()
  )
)
with check (
  applicant_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.opportunities o
    where o.id = opportunity_id and o.company_id = auth.uid()
  )
);

-- events
drop policy if exists "Authenticated can view events" on public.events;
create policy "Authenticated can view events"
on public.events for select to authenticated using (true);

drop policy if exists "Admins can create events" on public.events;
create policy "Admins can create events"
on public.events for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update events" on public.events;
create policy "Admins can update events"
on public.events for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete events" on public.events;
create policy "Admins can delete events"
on public.events for delete to authenticated using (public.is_admin());

-- RSVPs
drop policy if exists "Authenticated can view RSVPs" on public.event_rsvps;
create policy "Authenticated can view RSVPs"
on public.event_rsvps for select to authenticated using (true);

drop policy if exists "Users can RSVP" on public.event_rsvps;
create policy "Users can RSVP"
on public.event_rsvps for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Users can remove own RSVP" on public.event_rsvps;
create policy "Users can remove own RSVP"
on public.event_rsvps for delete to authenticated using (user_id = auth.uid());

-- connections
drop policy if exists "Participants can view connections" on public.connections;
create policy "Participants can view connections"
on public.connections for select to authenticated
using (requester_id = auth.uid() or receiver_id = auth.uid() or public.is_admin());

drop policy if exists "Users can request connections" on public.connections;
create policy "Users can request connections"
on public.connections for insert to authenticated with check (requester_id = auth.uid());

drop policy if exists "Participants can update connections" on public.connections;
create policy "Participants can update connections"
on public.connections for update to authenticated
using (requester_id = auth.uid() or receiver_id = auth.uid() or public.is_admin())
with check (requester_id = auth.uid() or receiver_id = auth.uid() or public.is_admin());

-- messages
drop policy if exists "Participants can view messages" on public.messages;
create policy "Participants can view messages"
on public.messages for select to authenticated
using (sender_id = auth.uid() or receiver_id = auth.uid() or public.is_admin());

drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages"
on public.messages for insert to authenticated with check (sender_id = auth.uid());

-- notifications
drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
on public.notifications for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users or admins can create notifications" on public.notifications;
create policy "Users or admins can create notifications"
on public.notifications for insert to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
on public.notifications for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

-- endorsements
drop policy if exists "Authenticated can view endorsements" on public.endorsements;
create policy "Authenticated can view endorsements"
on public.endorsements for select to authenticated using (true);

drop policy if exists "Users can add endorsements" on public.endorsements;
create policy "Users can add endorsements"
on public.endorsements for insert to authenticated
with check (endorsed_by_id = auth.uid() and profile_id <> auth.uid());

drop policy if exists "Endorsers or admins can delete endorsements" on public.endorsements;
create policy "Endorsers or admins can delete endorsements"
on public.endorsements for delete to authenticated
using (endorsed_by_id = auth.uid() or public.is_admin());
>>>>>>> main
