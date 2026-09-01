create table if not exists public.gaming_news (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'Game News',
  title text not null,
  summary text,
  body text,
  source_url text,
  image_url text,
  published_at timestamptz not null default now(),
  sort_order integer not null default 10,
  featured boolean not null default false,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.gaming_news enable row level security;
drop policy if exists "public read gaming news" on public.gaming_news;
create policy "public read gaming news" on public.gaming_news for select using (enabled = true);
drop policy if exists "admin write gaming news" on public.gaming_news;
create policy "admin write gaming news" on public.gaming_news for all using (public.is_admin()) with check (public.is_admin());
create or replace function public.set_gaming_news_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists gaming_news_updated_at on public.gaming_news;
create trigger gaming_news_updated_at before update on public.gaming_news for each row execute function public.set_gaming_news_updated_at();
