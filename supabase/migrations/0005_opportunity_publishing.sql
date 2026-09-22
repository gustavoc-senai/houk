-- Only contractor accounts may publish opportunities under their own profile.
create or replace function public.protect_opportunity_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    if tg_op = 'INSERT' and new.contractor_id is distinct from auth.uid() then
      raise exception 'An opportunity must belong to the authenticated contractor';
    end if;

    if tg_op = 'INSERT' and not exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'contractor'
    ) then
      raise exception 'Only contractor accounts can publish opportunities';
    end if;

    if tg_op = 'UPDATE' and new.contractor_id is distinct from old.contractor_id then
      raise exception 'The opportunity owner cannot be changed';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists opportunities_protect_owner on public.opportunities;
create trigger opportunities_protect_owner
before insert or update on public.opportunities
for each row execute procedure public.protect_opportunity_owner();
