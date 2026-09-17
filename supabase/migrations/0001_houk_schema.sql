-- HOUK: execute this file in Supabase SQL Editor or with `supabase db push`.
-- The Auth schema is managed by Supabase; application data lives in public.

-- Safe when the project already has part of a previous schema.
do $$ begin create type public.app_role as enum ('candidate', 'contractor', 'admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.opportunity_type as enum ('CLT', 'PJ', 'APPRENTICE', 'INTERNSHIP', 'FREELANCE'); exception when duplicate_object then null; end $$;
do $$ begin create type public.work_model as enum ('PRESENTIAL', 'REMOTE', 'HYBRID'); exception when duplicate_object then null; end $$;
do $$ begin create type public.opportunity_status as enum ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.application_status as enum ('SENT', 'VIEWED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'); exception when duplicate_object then null; end $$;
do $$ begin create type public.notification_type as enum ('APPLICATION', 'OPPORTUNITY', 'SYSTEM', 'REVIEW'); exception when duplicate_object then null; end $$;
alter type public.app_role add value if not exists 'candidate';
alter type public.app_role add value if not exists 'contractor';
alter type public.app_role add value if not exists 'admin';
alter type public.opportunity_type add value if not exists 'CLT';
alter type public.opportunity_type add value if not exists 'PJ';
alter type public.opportunity_type add value if not exists 'APPRENTICE';
alter type public.opportunity_type add value if not exists 'INTERNSHIP';
alter type public.opportunity_type add value if not exists 'FREELANCE';
alter type public.work_model add value if not exists 'PRESENTIAL';
alter type public.work_model add value if not exists 'REMOTE';
alter type public.work_model add value if not exists 'HYBRID';
alter type public.opportunity_status add value if not exists 'DRAFT';
alter type public.opportunity_status add value if not exists 'ACTIVE';
alter type public.opportunity_status add value if not exists 'PAUSED';
alter type public.opportunity_status add value if not exists 'CLOSED';
alter type public.application_status add value if not exists 'SENT';
alter type public.application_status add value if not exists 'VIEWED';
alter type public.application_status add value if not exists 'UNDER_REVIEW';
alter type public.application_status add value if not exists 'APPROVED';
alter type public.application_status add value if not exists 'REJECTED';
alter type public.application_status add value if not exists 'WITHDRAWN';

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.app_role not null default 'candidate',
  phone text,
  avatar_url text,
  headline text,
  bio text,
  city text,
  state char(2),
  is_pcd boolean not null default false,
  profile_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null,
  legal_name text,
  cnpj text unique,
  description text,
  logo_url text,
  website text,
  phone text,
  email text,
  city text,
  state char(2),
  address text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  icon text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text not null,
  requirements text,
  benefits text,
  opportunity_type public.opportunity_type not null,
  work_model public.work_model not null,
  status public.opportunity_status not null default 'DRAFT',
  city text,
  state char(2),
  address text,
  salary_min numeric(12,2),
  salary_max numeric(12,2),
  salary_visible boolean not null default true,
  vacancies integer not null default 1 check (vacancies > 0),
  accepts_pcd boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (salary_max is null or salary_min is null or salary_max >= salary_min)
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
create table if not exists public.candidate_skills (
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  level smallint check (level between 1 and 5),
  primary key (candidate_id, skill_id)
);
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  company text not null, title text not null, description text,
  started_on date not null, ended_on date, current boolean not null default false,
  created_at timestamptz not null default now(),
  check (ended_on is null or ended_on >= started_on)
);
create table if not exists public.educations (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  institution text not null, course text not null, level text,
  started_on date, ended_on date, current boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, description text, url text not null, image_url text,
  created_at timestamptz not null default now()
);
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null unique references public.profiles(id) on delete cascade,
  file_url text not null, file_name text not null, updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  cover_letter text,
  resume_url text,
  status public.application_status not null default 'SENT',
  viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opportunity_id, candidate_id)
);
create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  status public.application_status not null,
  note text,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.favorites (
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (candidate_id, opportunity_id)
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null default 'SYSTEM',
  title text not null, body text not null, link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  check (business_id is not null or opportunity_id is not null)
);

-- Compatibility upgrades for projects that already had the first HOUK tables.
-- New columns are nullable here so existing rows remain intact.
alter table public.profiles add column if not exists headline text;
alter table public.profiles add column if not exists is_pcd boolean default false;
alter table public.profiles add column if not exists profile_completed_at timestamptz;
alter table public.opportunities add column if not exists category_id uuid references public.categories(id) on delete set null;
alter table public.opportunities add column if not exists status public.opportunity_status default 'DRAFT';
alter table public.opportunities add column if not exists city text;
alter table public.opportunities add column if not exists state char(2);
alter table public.opportunities add column if not exists opportunity_type public.opportunity_type;
alter table public.opportunities add column if not exists work_model public.work_model;
alter table public.opportunities add column if not exists published_at timestamptz;
alter table public.applications add column if not exists candidate_id uuid references public.profiles(id) on delete cascade;
alter table public.applications add column if not exists opportunity_id uuid references public.opportunities(id) on delete cascade;
alter table public.applications add column if not exists status public.application_status default 'SENT';
alter table public.favorites add column if not exists candidate_id uuid references public.profiles(id) on delete cascade;
alter table public.reviews add column if not exists author_id uuid references public.profiles(id) on delete cascade;
alter table public.reviews add column if not exists business_id uuid references public.businesses(id) on delete cascade;
alter table public.reviews add column if not exists visible boolean default true;
alter table public.notifications add column if not exists recipient_id uuid references public.profiles(id) on delete cascade;
alter table public.notifications add column if not exists type public.notification_type default 'SYSTEM';
alter table public.notifications add column if not exists title text;
alter table public.notifications add column if not exists body text;
alter table public.notifications add column if not exists link text;
alter table public.notifications add column if not exists read_at timestamptz;

-- Map the original HOUK column names to the normalized names used by the new pages.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'notifications' and column_name = 'user_id'
  ) then
    execute 'update public.notifications set recipient_id = user_id where recipient_id is null';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'notifications' and column_name = 'message'
  ) then
    execute 'update public.notifications set body = message where body is null';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'favorites' and column_name = 'user_id'
  ) then
    execute 'update public.favorites set candidate_id = user_id where candidate_id is null';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'reviews' and column_name = 'reviewer_id'
  ) then
    execute 'update public.reviews set author_id = reviewer_id where author_id is null';
  end if;
end $$;

create index if not exists opportunities_search_idx on public.opportunities(status, state, city, category_id, opportunity_type, work_model, published_at desc);
create index if not exists applications_opportunity_idx on public.applications(opportunity_id, status);
create index if not exists applications_candidate_idx on public.applications(candidate_id, status);
create index if not exists notifications_recipient_idx on public.notifications(recipient_id, read_at, created_at desc);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    case new.raw_user_meta_data ->> 'role' when 'contractor' then 'contractor' else 'candidate' end
  );
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists profiles_updated_at on public.profiles;
drop trigger if exists businesses_updated_at on public.businesses;
drop trigger if exists opportunities_updated_at on public.opportunities;
drop trigger if exists applications_updated_at on public.applications;
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger businesses_updated_at before update on public.businesses for each row execute procedure public.set_updated_at();
create trigger opportunities_updated_at before update on public.opportunities for each row execute procedure public.set_updated_at();
create trigger applications_updated_at before update on public.applications for each row execute procedure public.set_updated_at();

-- RLS: service_role bypasses these policies for admin/server jobs.
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.categories enable row level security;
alter table public.opportunities enable row level security;
alter table public.skills enable row level security;
alter table public.candidate_skills enable row level security;
alter table public.experiences enable row level security;
alter table public.educations enable row level security;
alter table public.portfolios enable row level security;
alter table public.resumes enable row level security;
alter table public.applications enable row level security;
alter table public.application_status_history enable row level security;
alter table public.favorites enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "public profiles are readable" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "businesses are readable" on public.businesses;
drop policy if exists "contractors manage own business" on public.businesses;
drop policy if exists "categories are readable" on public.categories;
drop policy if exists "active opportunities are readable" on public.opportunities;
drop policy if exists "contractors manage own opportunities" on public.opportunities;
drop policy if exists "skills are readable" on public.skills;
drop policy if exists "candidate skills are readable" on public.candidate_skills;
drop policy if exists "candidates manage own skills" on public.candidate_skills;
drop policy if exists "candidate details are readable" on public.experiences;
drop policy if exists "candidates manage experiences" on public.experiences;
drop policy if exists "education is readable" on public.educations;
drop policy if exists "candidates manage education" on public.educations;
drop policy if exists "portfolios are readable" on public.portfolios;
drop policy if exists "candidates manage portfolios" on public.portfolios;
drop policy if exists "candidates manage resume" on public.resumes;
drop policy if exists "applications visible to parties" on public.applications;
drop policy if exists "candidates create applications" on public.applications;
drop policy if exists "candidates update own applications" on public.applications;
drop policy if exists "candidates manage favorites" on public.favorites;
drop policy if exists "users read own notifications" on public.notifications;
drop policy if exists "users update own notifications" on public.notifications;
drop policy if exists "reviews are readable" on public.reviews;
drop policy if exists "users create reviews" on public.reviews;
drop policy if exists "authors update reviews" on public.reviews;

create policy "public profiles are readable" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));
create policy "businesses are readable" on public.businesses for select using (true);
create policy "contractors manage own business" on public.businesses for all using (contractor_id = auth.uid()) with check (contractor_id = auth.uid());
create policy "categories are readable" on public.categories for select using (true);
create policy "active opportunities are readable" on public.opportunities for select using (status = 'ACTIVE' or contractor_id = auth.uid());
create policy "contractors manage own opportunities" on public.opportunities for all using (contractor_id = auth.uid()) with check (contractor_id = auth.uid());
create policy "skills are readable" on public.skills for select using (true);
create policy "candidate skills are readable" on public.candidate_skills for select using (true);
create policy "candidates manage own skills" on public.candidate_skills for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
create policy "candidate details are readable" on public.experiences for select using (true);
create policy "candidates manage experiences" on public.experiences for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
create policy "education is readable" on public.educations for select using (true);
create policy "candidates manage education" on public.educations for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
create policy "portfolios are readable" on public.portfolios for select using (true);
create policy "candidates manage portfolios" on public.portfolios for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
create policy "candidates manage resume" on public.resumes for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
create policy "applications visible to parties" on public.applications for select using (candidate_id = auth.uid() or exists (select 1 from public.opportunities o where o.id = opportunity_id and o.contractor_id = auth.uid()));
create policy "candidates create applications" on public.applications for insert with check (candidate_id = auth.uid());
create policy "candidates update own applications" on public.applications for update using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
create policy "candidates manage favorites" on public.favorites for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
create policy "users read own notifications" on public.notifications for select using (recipient_id = auth.uid());
create policy "users update own notifications" on public.notifications for update using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
create policy "reviews are readable" on public.reviews for select using (visible = true or author_id = auth.uid());
create policy "users create reviews" on public.reviews for insert with check (author_id = auth.uid());
create policy "authors update reviews" on public.reviews for update using (author_id = auth.uid()) with check (author_id = auth.uid());
