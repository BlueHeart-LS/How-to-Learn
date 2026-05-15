create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  bio text not null default '',
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  slug text primary key,
  title text not null,
  category text not null default '學習方法',
  author text not null default '如何學編輯部',
  published_date text not null default '',
  cover_class text not null default 'people',
  cover_image text not null default '',
  tags text[] not null default '{}',
  excerpt text not null default '',
  body text[] not null default '{}',
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.article_views (
  slug text primary key,
  views integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.article_views enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Articles are public" on public.articles;
create policy "Articles are public"
on public.articles for select
using (true);

drop policy if exists "Authenticated users manage articles" on public.articles;
create policy "Authenticated users manage articles"
on public.articles for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Article views are public" on public.article_views;
create policy "Article views are public"
on public.article_views for select
using (true);

create or replace function public.increment_article_view(article_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_views integer;
begin
  insert into public.article_views (slug, views, updated_at)
  values (article_slug, 1, now())
  on conflict (slug)
  do update set views = public.article_views.views + 1, updated_at = now()
  returning views into new_views;

  return new_views;
end;
$$;

insert into storage.buckets (id, name, public)
values ('article-covers', 'article-covers', true)
on conflict (id) do update set public = true;

drop policy if exists "Article covers are public" on storage.objects;
create policy "Article covers are public"
on storage.objects for select
using (bucket_id = 'article-covers');

drop policy if exists "Authenticated users upload article covers" on storage.objects;
create policy "Authenticated users upload article covers"
on storage.objects for insert
with check (bucket_id = 'article-covers' and auth.role() = 'authenticated');
