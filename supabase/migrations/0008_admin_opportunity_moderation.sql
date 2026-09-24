-- Administrators can moderate opportunity publication status.
drop policy if exists "admins update opportunities" on public.opportunities;
create policy "admins update opportunities"
on public.opportunities for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
