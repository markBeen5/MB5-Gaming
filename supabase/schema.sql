create extension if not exists pgcrypto;
create table if not exists public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade,role text not null default 'admin',created_at timestamptz default now());
create or replace function public.is_admin() returns boolean language sql security definer set search_path=public as $$select exists(select 1 from public.admin_users where user_id=auth.uid() and role='admin')$$;
grant execute on function public.is_admin() to authenticated;
create table if not exists public.site_settings(id uuid primary key default gen_random_uuid(),hero_title text default 'MARKBEEN5',tagline text not null,created_at timestamptz default now());
create table if not exists public.live_status(id uuid primary key default gen_random_uuid(),enabled boolean default false,title text not null,description text,url text,created_at timestamptz default now());
create table if not exists public.clips(id uuid primary key default gen_random_uuid(),title text not null,url text not null,description text,created_at timestamptz default now());
create table if not exists public.plays(id uuid primary key default gen_random_uuid(),name text not null,type text not null,coverage text not null,detail text,created_at timestamptz default now());
create table if not exists public.schedule(id uuid primary key default gen_random_uuid(),day text not null,time text not null,created_at timestamptz default now());
create table if not exists public.stats(id uuid primary key default gen_random_uuid(),wins int default 0,losses int default 0,streak text default 'W0',created_at timestamptz default now());
create table if not exists public.social_links(id uuid primary key default gen_random_uuid(),platform text not null,handle text not null,url text not null,created_at timestamptz default now());

do $$ declare t text; begin foreach t in array ARRAY['site_settings','live_status','clips','plays','schedule','stats','social_links'] loop execute format('alter table public.%I enable row level security',t); execute format('create policy "public read" on public.%I for select using (true)',t); execute format('create policy "admin write" on public.%I for all using (public.is_admin()) with check (public.is_admin())',t); end loop; end $$;
insert into public.site_settings(tagline) select 'Competitive gamer & content creator. Madden 27. Detroit Lions. Gameplay, strategy, clips and live streams.' where not exists(select 1 from public.site_settings);
insert into public.live_status(enabled,title,description,url) select true,'MADDEN 27 — DETROIT LIONS','Online head-to-head • Road to #1','https://www.twitch.tv/markbeen5' where not exists(select 1 from public.live_status);
insert into public.stats(wins,losses,streak) select 127,42,'W7' where not exists(select 1 from public.stats);
insert into public.social_links(platform,handle,url) select * from (values('Twitch','@markbeen5','https://www.twitch.tv/markbeen5'),('Kick','@markbeen5','https://kick.com/markbeen5'),('TikTok','@markbeen5','https://www.tiktok.com/@markbeen5'),('Instagram','@markbeenv','https://www.instagram.com/markbeenv/'),('YouTube','@markBeen5','https://www.youtube.com/@markBeen5'))v(p,h,u) where not exists(select 1 from public.social_links);
-- After creating your Auth account, add its UUID:
-- insert into public.admin_users(user_id) values('YOUR-AUTH-USER-UUID');
