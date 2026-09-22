-- Operational data for moderation, administration, recruiting and candidate alerts.
do $$ begin
  create type public.report_target_type as enum ('PROFILE', 'BUSINESS', 'OPPORTUNITY', 'REVIEW');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.report_status as enum ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.business_member_role as enum ('OWNER', 'MANAGER', 'RECRUITER');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.interview_status as enum ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
exception when duplicate_object then null; end $$;

alter table public.profiles add column if not exists availability text;
alter table public.profiles add column if not exists salary_expectation numeric(12,2);
alter table public.profiles add column if not exists linkedin_url text;
alter table public.opportunities add column if not exists responsibilities text;
alter table public.opportunities add column if not exists neighborhood text;
alter table public.opportunities add column if not exists latitude numeric(9,6);
alter table public.opportunities add column if not exists longitude numeric(9,6);
alter table public.opportunities add column if not exists pcd_exclusive boolean not null default false;
alter table public.reviews add column if not exists reviewee_id uuid references public.profiles(id) on delete set null;

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.report_target_type not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status public.report_status not null default 'OPEN',
  handled_by uuid references public.profiles(id) on delete set null,
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  member_role public.business_member_role not null default 'RECRUITER',
  created_at timestamptz not null default now(),
  primary key (business_id, profile_id)
);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  scheduled_by uuid not null references public.profiles(id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_minutes smallint check (duration_minutes between 10 and 480),
  location text,
  meeting_url text,
  notes text,
  status public.interview_status not null default 'SCHEDULED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_alerts (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  query text,
  city text,
  state char(2),
  category_id uuid references public.categories(id) on delete set null,
  opportunity_type public.opportunity_type,
  work_model public.work_model,
  accepts_pcd boolean,
  active boolean not null default true,
  last_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.opportunity_views (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete set null,
  session_id text,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists content_reports_status_idx on public.content_reports(status, created_at desc);
create index if not exists admin_audit_logs_entity_idx on public.admin_audit_logs(entity_type, entity_id, created_at desc);
create index if not exists interviews_application_idx on public.interviews(application_id, scheduled_at);
create index if not exists job_alerts_candidate_idx on public.job_alerts(candidate_id, active);
create index if not exists opportunity_views_opportunity_idx on public.opportunity_views(opportunity_id, created_at desc);

create trigger content_reports_updated_at before update on public.content_reports for each row execute procedure public.set_updated_at();
create trigger interviews_updated_at before update on public.interviews for each row execute procedure public.set_updated_at();

alter table public.content_reports enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.business_members enable row level security;
alter table public.interviews enable row level security;
alter table public.job_alerts enable row level security;
alter table public.opportunity_views enable row level security;

create policy "users create reports" on public.content_reports for insert with check (reporter_id = auth.uid());
create policy "users read own reports" on public.content_reports for select using (reporter_id = auth.uid());
create policy "admins manage reports" on public.content_reports for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read audit logs" on public.admin_audit_logs for select using (public.is_admin());
create policy "members read their businesses" on public.business_members for select using (profile_id = auth.uid());
create policy "admins manage business members" on public.business_members for all using (public.is_admin()) with check (public.is_admin());
create policy "application parties read interviews" on public.interviews for select using (scheduled_by = auth.uid() or exists (select 1 from public.applications a where a.id = application_id and a.candidate_id = auth.uid()));
create policy "contractors manage interviews" on public.interviews for all using (exists (select 1 from public.applications a join public.opportunities o on o.id = a.opportunity_id where a.id = application_id and o.contractor_id = auth.uid())) with check (exists (select 1 from public.applications a join public.opportunities o on o.id = a.opportunity_id where a.id = application_id and o.contractor_id = auth.uid()));
create policy "candidates manage own alerts" on public.job_alerts for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
create policy "anyone records opportunity views" on public.opportunity_views for insert with check (viewer_id is null or viewer_id = auth.uid());
create policy "owners read opportunity views" on public.opportunity_views for select using (exists (select 1 from public.opportunities o where o.id = opportunity_id and o.contractor_id = auth.uid()));
create policy "admins read platform operations" on public.interviews for select using (public.is_admin());
create policy "admins read job alerts" on public.job_alerts for select using (public.is_admin());
create policy "admins read opportunity views" on public.opportunity_views for select using (public.is_admin());
