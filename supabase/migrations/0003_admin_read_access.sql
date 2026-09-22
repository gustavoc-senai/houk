-- Administrative screens need aggregate data that ordinary accounts must not read.
-- Keep the role check inside a security-definer function to avoid RLS recursion.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

create policy "admins read all profiles"
on public.profiles for select
using (public.is_admin());

create policy "admins read all businesses"
on public.businesses for select
using (public.is_admin());

create policy "admins read all opportunities"
on public.opportunities for select
using (public.is_admin());

create policy "admins read all applications"
on public.applications for select
using (public.is_admin());

create policy "admins read application history"
on public.application_status_history for select
using (public.is_admin());

create policy "admins read all reviews"
on public.reviews for select
using (public.is_admin());

create policy "admins read all favorites"
on public.favorites for select
using (public.is_admin());
