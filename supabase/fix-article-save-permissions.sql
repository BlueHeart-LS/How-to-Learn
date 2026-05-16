-- Run this in Supabase SQL Editor if the article admin shows:
-- "permission denied for table profiles" or article save/update fails.

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

grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;
grant select on public.article_views to anon, authenticated;

drop policy if exists "Articles are public" on public.articles;
create policy "Articles are public"
on public.articles for select
using (true);

drop policy if exists "Authenticated users manage articles" on public.articles;
drop policy if exists "Admins manage articles" on public.articles;
create policy "Admins manage articles"
on public.articles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Article views are public" on public.article_views;
create policy "Article views are public"
on public.article_views for select
using (true);

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
