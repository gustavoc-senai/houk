-- Candidates can register a new skill before associating it with their own profile.
drop policy if exists "authenticated users create skills" on public.skills;
create policy "authenticated users create skills"
on public.skills for insert
to authenticated
with check (true);
