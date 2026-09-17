-- Improvements after the initial HOUK schema has been applied.
-- Run once with `supabase db push` or in Supabase SQL Editor.

alter table public.categories add column if not exists slug text;
alter table public.opportunities add column if not exists accepts_pcd boolean default false;
update public.categories
set slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null;
create unique index if not exists categories_slug_unique_idx on public.categories(slug) where slug is not null;

insert into public.categories (name, slug, description, icon)
values
  ('Tecnologia', 'tecnologia', 'Desenvolvimento, dados e infraestrutura.', 'Code2'),
  ('Administrativo', 'administrativo', 'Operações, atendimento e rotinas administrativas.', 'ClipboardList'),
  ('Design', 'design', 'Criação, comunicação e experiência.', 'Palette'),
  ('Vendas', 'vendas', 'Comercial e relacionamento com clientes.', 'TrendingUp'),
  ('Saúde', 'saude', 'Cuidados, bem-estar e serviços de saúde.', 'HeartPulse'),
  ('Educação', 'educacao', 'Ensino, treinamento e desenvolvimento.', 'GraduationCap')
on conflict (name) do nothing;

-- Search that remains fast as opportunities grow.
create index if not exists opportunities_fts_idx on public.opportunities
using gin (to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(city, '')));

create or replace function public.search_opportunities(
  search_text text default null,
  filter_city text default null,
  filter_state text default null,
  filter_category uuid default null,
  filter_type public.opportunity_type default null,
  filter_model public.work_model default null,
  filter_pcd boolean default null,
  minimum_salary numeric default null,
  maximum_salary numeric default null,
  result_limit integer default 24,
  result_offset integer default 0
)
returns setof public.opportunities
language sql stable security invoker set search_path = public as $$
  select o.* from public.opportunities o
  where o.status = 'ACTIVE'
    and (search_text is null or search_text = '' or to_tsvector('portuguese', coalesce(o.title, '') || ' ' || coalesce(o.description, '') || ' ' || coalesce(o.city, '')) @@ websearch_to_tsquery('portuguese', search_text))
    and (filter_city is null or o.city ilike filter_city)
    and (filter_state is null or o.state = upper(filter_state))
    and (filter_category is null or o.category_id = filter_category)
    and (filter_type is null or o.opportunity_type = filter_type)
    and (filter_model is null or o.work_model = filter_model)
    and (filter_pcd is null or o.accepts_pcd = filter_pcd)
    and (minimum_salary is null or o.salary_max is null or o.salary_max >= minimum_salary)
    and (maximum_salary is null or o.salary_min is null or o.salary_min <= maximum_salary)
  order by o.published_at desc nulls last, o.created_at desc
  limit least(greatest(result_limit, 1), 100) offset greatest(result_offset, 0);
$$;

-- Do not expose email and telephone numbers in public profile searches.
drop policy if exists "public profiles are readable" on public.profiles;
create policy "users read own profile" on public.profiles for select using (auth.uid() = id);

create or replace view public.public_profiles as
select id, full_name, avatar_url, headline, bio, city, state, is_pcd, profile_completed_at
from public.profiles;
grant select on public.public_profiles to anon, authenticated;

-- A browser user can never promote their own role.
create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'Role cannot be changed by the account owner';
  end if;
  return new;
end; $$;
drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role before update on public.profiles
for each row execute procedure public.protect_profile_role();

-- Keep application ownership immutable and allow the vacancy owner to progress it.
create or replace function public.protect_application_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.candidate_id is distinct from old.candidate_id or new.opportunity_id is distinct from old.opportunity_id then
    raise exception 'Application owner and opportunity cannot be changed';
  end if;
  if new.status is distinct from old.status and not exists (
    select 1 from public.opportunities o where o.id = old.opportunity_id and o.contractor_id = auth.uid()
  ) then
    raise exception 'Only the vacancy owner can change the application status';
  end if;
  return new;
end; $$;
drop trigger if exists applications_protect_update on public.applications;
create trigger applications_protect_update before update on public.applications
for each row execute procedure public.protect_application_update();

drop policy if exists "contractors update received applications" on public.applications;
create policy "contractors update received applications" on public.applications for update
using (exists (select 1 from public.opportunities o where o.id = opportunity_id and o.contractor_id = auth.uid()))
with check (exists (select 1 from public.opportunities o where o.id = opportunity_id and o.contractor_id = auth.uid()));

-- Audit each status change and notify the candidate automatically.
create or replace function public.on_application_status_changed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.application_status_history (application_id, status, changed_by)
    values (new.id, new.status, auth.uid());
    insert into public.notifications (recipient_id, type, title, body, link)
    values (
      new.candidate_id,
      'APPLICATION',
      'Atualização na sua candidatura',
      case new.status
        when 'VIEWED' then 'Sua candidatura foi visualizada.'
        when 'UNDER_REVIEW' then 'Sua candidatura está em análise.'
        when 'APPROVED' then 'Sua candidatura foi aprovada.'
        when 'REJECTED' then 'Sua candidatura não foi aprovada desta vez.'
        else 'Sua candidatura foi atualizada.'
      end,
      '/candidato/application-details?id=' || new.id
    );
  end if;
  return new;
end; $$;
drop trigger if exists applications_status_notification on public.applications;
create trigger applications_status_notification after update on public.applications
for each row execute procedure public.on_application_status_changed();

-- Notify a contractor when a candidate applies to one of their opportunities.
create or replace function public.on_application_created()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner_id uuid;
begin
  select contractor_id into owner_id from public.opportunities where id = new.opportunity_id;
  if owner_id is not null then
    insert into public.notifications (recipient_id, type, title, body, link)
    values (owner_id, 'APPLICATION', 'Nova candidatura recebida', 'Uma oportunidade publicada por você recebeu uma nova candidatura.', '/contratante/application-details?id=' || new.id);
  end if;
  return new;
end; $$;
drop trigger if exists applications_created_notification on public.applications;
create trigger applications_created_notification after insert on public.applications
for each row execute procedure public.on_application_created();

-- Storage for profile assets and documents. Files must be placed under `<auth.uid()>/...`.
insert into storage.buckets (id, name, public)
values ('profile-assets', 'profile-assets', true), ('resumes', 'resumes', false)
on conflict (id) do nothing;

drop policy if exists "public reads profile assets" on storage.objects;
drop policy if exists "users upload own profile assets" on storage.objects;
drop policy if exists "users update own profile assets" on storage.objects;
drop policy if exists "users delete own profile assets" on storage.objects;
drop policy if exists "users manage own resumes" on storage.objects;
create policy "public reads profile assets" on storage.objects for select using (bucket_id = 'profile-assets');
create policy "users upload own profile assets" on storage.objects for insert with check (bucket_id = 'profile-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users update own profile assets" on storage.objects for update using (bucket_id = 'profile-assets' and owner_id = auth.uid()) with check (bucket_id = 'profile-assets' and owner_id = auth.uid());
create policy "users delete own profile assets" on storage.objects for delete using (bucket_id = 'profile-assets' and owner_id = auth.uid());
create policy "users manage own resumes" on storage.objects for all using (bucket_id = 'resumes' and owner_id = auth.uid()) with check (bucket_id = 'resumes' and owner_id = auth.uid());
