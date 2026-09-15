-- Enrich complete Supabase schema
-- Safe to keep in Git. Run in Supabase SQL Editor.
-- This file is designed to work with the existing profiles table from Phase 1.

create extension if not exists pgcrypto;

-- =========================================================
-- PROFILES
-- =========================================================
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

create unique index if not exists profiles_email_unique_idx
  on public.profiles(email) where email is not null;
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_campus_idx on public.profiles(campus);
create index if not exists profiles_verification_status_idx on public.profiles(verification_status);

-- =========================================================
-- HELPER FUNCTIONS
-- =========================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
    end
  )
  on conflict (id) do update
  set email = excluded.email,
      name = excluded.name,
      role = excluded.role,
      verification_status = excluded.verification_status,
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

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
  video_url text,
  video_thumbnail text,
  video_duration text,
  media_url text,
  tags text[] not null default '{}',
  flagged boolean not null default false,
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
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id text not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

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
  is_remote boolean not null default false,
  campus_target text,
  required_programme text[] not null default '{}',
  required_skills text[] not null default '{}',
  description text not null,
  responsibilities text[] not null default '{}',
  stipend_salary text default '',
  closing_date text default '',
  status text not null default 'pending_approval',
  applicants_count integer not null default 0,
  match_score integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
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
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.opportunities
      set applicants_count = applicants_count + 1
      where id = new.opportunity_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.opportunities
      set applicants_count = greatest(applicants_count - 1, 0)
      where id = old.opportunity_id;
    return old;
  end if;
  return null;
end;
$$;

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
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
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
  title text not null,
  message text not null,
  read boolean not null default false,
  action_type text,
  created_at timestamptz not null default now()
);

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
