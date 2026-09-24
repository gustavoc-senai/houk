-- Contractors submit opportunities for review; only administrators may publish them.
create or replace function public.protect_opportunity_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  publisher_role public.app_role;
begin
  if auth.uid() is not null then
    select role into publisher_role from public.profiles where id = auth.uid();

    if tg_op = 'INSERT' and new.contractor_id is distinct from auth.uid() then
      raise exception 'An opportunity must belong to the authenticated publisher';
    end if;

    if tg_op = 'INSERT' and publisher_role not in ('contractor', 'admin') then
      raise exception 'Only contractor or administrator accounts can publish opportunities';
    end if;

    if tg_op = 'INSERT' and publisher_role = 'contractor' and new.status <> 'DRAFT' then
      raise exception 'Contractor opportunities must be submitted for moderation';
    end if;

    if tg_op = 'UPDATE' and new.contractor_id is distinct from old.contractor_id then
      raise exception 'The opportunity owner cannot be changed';
    end if;

    if tg_op = 'UPDATE' and publisher_role = 'contractor'
      and new.status is distinct from old.status
      and new.status = 'ACTIVE' then
      raise exception 'Only an administrator can publish an opportunity';
    end if;
  end if;
  return new;
end;
$$;
