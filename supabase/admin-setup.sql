-- Replace the email below if your admin account uses a different address.
insert into public.profiles (id, name, bio, role, created_at, updated_at)
select
  id,
  coalesce(raw_user_meta_data ->> 'name', email),
  '',
  'admin',
  now(),
  now()
from auth.users
where email = 'lan.learning.tw@gmail.com'
on conflict (id)
do update set
  role = 'admin',
  updated_at = now();

grant select, insert, update on public.profiles to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "Authenticated users manage articles" on public.articles;
drop policy if exists "Admins manage articles" on public.articles;
create policy "Admins manage articles"
on public.articles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users upload article covers" on storage.objects;
drop policy if exists "Admins upload article covers" on storage.objects;
create policy "Admins upload article covers"
on storage.objects for insert
with check (
  bucket_id = 'article-covers'
  and public.is_admin()
);
