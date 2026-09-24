-- Allow platform administrators to publish opportunities from the admin workspace.
create or replace function public.protect_opportunity_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    if tg_op = 'INSERT' and new.contractor_id is distinct from auth.uid() then
      raise exception 'An opportunity must belong to the authenticated publisher';
    end if;

    if tg_op = 'INSERT' and not exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('contractor', 'admin')
    ) then
      raise exception 'Only contractor or administrator accounts can publish opportunities';
    end if;

    if tg_op = 'UPDATE' and new.contractor_id is distinct from old.contractor_id then
      raise exception 'The opportunity owner cannot be changed';
    end if;
  end if;
  return new;
end;
$$;

drop policy if exists "admins publish opportunities" on public.opportunities;
create policy "admins publish opportunities"
on public.opportunities for insert
with check (public.is_admin() and contractor_id = auth.uid());
