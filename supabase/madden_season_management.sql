-- MB5 Madden multi-season management.
-- Keeps Madden 27 Detroit Lions campaigns separate while preserving old results.
create table if not exists public.madden_seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  game text not null default 'Madden 27',
  team text not null default 'Detroit Lions',
  status text not null default 'active' check (status in ('active','archived')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.game_results add column if not exists season_id uuid references public.madden_seasons(id) on delete set null;
create unique index if not exists one_active_madden_season on public.madden_seasons ((status)) where status='active';

alter table public.madden_seasons enable row level security;
revoke all on table public.madden_seasons from public,anon,authenticated;
grant select,insert,update on table public.madden_seasons to authenticated;
drop policy if exists "admin manage madden seasons" on public.madden_seasons;
create policy "admin manage madden seasons" on public.madden_seasons for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

insert into public.madden_seasons(name)
select 'Madden 27 Season 1'
where not exists(select 1 from public.madden_seasons);

update public.game_results
set season_id=(select id from public.madden_seasons where status='active' order by started_at desc limit 1)
where season_id is null and game='Madden 27' and team='Detroit Lions';

create or replace function public.assign_active_madden_season() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  if new.season_id is null and new.game='Madden 27' and new.team='Detroit Lions' then
    select id into new.season_id from public.madden_seasons where status='active' order by started_at desc limit 1;
  end if;
  return new;
end;
$$;
revoke all on function public.assign_active_madden_season() from public,anon,authenticated;
drop trigger if exists game_results_assign_active_season on public.game_results;
create trigger game_results_assign_active_season before insert on public.game_results for each row execute function public.assign_active_madden_season();

create or replace function public.get_active_madden_season() returns table(id uuid,name text,started_at timestamptz) language sql stable security definer set search_path=pg_catalog,public as $$
  select s.id,s.name,s.started_at from public.madden_seasons s where s.status='active' order by s.started_at desc limit 1;
$$;
revoke all on function public.get_active_madden_season() from public;
grant execute on function public.get_active_madden_season() to anon,authenticated;

create or replace function public.get_madden_seasons() returns table(id uuid,name text,status text,started_at timestamptz,ended_at timestamptz) language sql stable security definer set search_path=pg_catalog,public as $$
  select s.id,s.name,s.status,s.started_at,s.ended_at from public.madden_seasons s where s.game='Madden 27' and s.team='Detroit Lions' order by (s.status='active') desc,s.started_at desc;
$$;
revoke all on function public.get_madden_seasons() from public;
grant execute on function public.get_madden_seasons() to anon,authenticated;

-- Replace the one-argument feed with a season-aware version. If no season is supplied, use the active campaign.
drop function if exists public.get_madden27_lions_results(integer);
create or replace function public.get_madden27_lions_results(limit_count integer default 100, season_filter uuid default null)
returns table (
  id uuid,
  played_at timestamptz,
  opponent text,
  result text,
  points_for integer,
  points_against integer,
  mode text,
  season_stage text,
  season_id uuid
)
language sql stable security definer set search_path=pg_catalog,public as $$
  with chosen as (
    select coalesce(season_filter,(select s.id from public.madden_seasons s where s.status='active' order by s.started_at desc limit 1)) as id
  )
  select gr.id,gr.played_at,gr.opponent,gr.result,gr.points_for,gr.points_against,gr.mode,gr.season_stage,gr.season_id
  from public.game_results gr
  cross join chosen c
  where gr.game='Madden 27' and gr.team='Detroit Lions' and (c.id is null or gr.season_id=c.id)
  order by gr.played_at desc,gr.created_at desc,gr.id desc
  limit least(greatest(coalesce(limit_count,100),1),100);
$$;
revoke all on function public.get_madden27_lions_results(integer,uuid) from public;
grant execute on function public.get_madden27_lions_results(integer,uuid) to anon,authenticated;
