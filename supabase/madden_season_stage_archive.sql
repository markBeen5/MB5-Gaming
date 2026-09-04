-- Madden season-stage tracking and permanent championship archive.
-- Applied to the Been 5 Gaming Supabase project on 2026-09-04.

alter table public.game_results add column if not exists season_stage text not null default 'regular_season';

do $$ begin
  if not exists (select 1 from pg_constraint where conname='game_results_season_stage_check') then
    alter table public.game_results add constraint game_results_season_stage_check check (season_stage in ('regular_season','wild_card','divisional','conference','super_bowl'));
  end if;
end $$;

create or replace function public.sync_game_result_season_stage() returns trigger language plpgsql as $$
begin
  new.season_stage := case
    when lower(new.mode) ~ 'super[[:space:]]*bowl' then 'super_bowl'
    when lower(new.mode) ~ 'conference|nfc[[:space:]]*champ|afc[[:space:]]*champ' then 'conference'
    when lower(new.mode) ~ 'divisional' then 'divisional'
    when lower(new.mode) ~ 'wild[[:space:]]*card|wildcard|playoff|postseason' then 'wild_card'
    when new.season_stage is null or new.season_stage='' then 'regular_season'
    else new.season_stage
  end;
  return new;
end;$$;

drop trigger if exists game_results_sync_season_stage on public.game_results;
create trigger game_results_sync_season_stage before insert or update on public.game_results for each row execute function public.sync_game_result_season_stage();

create table if not exists public.madden_championship_archive (
  id uuid primary key default gen_random_uuid(),
  season_label text not null,
  game text not null default 'Madden 27',
  team text not null default 'Detroit Lions',
  wins integer not null default 0 check (wins>=0),
  losses integer not null default 0 check (losses>=0),
  postseason_wins integer not null default 0 check (postseason_wins>=0),
  postseason_losses integer not null default 0 check (postseason_losses>=0),
  finish text not null default 'Season complete',
  super_bowl_result text check (super_bowl_result in ('W','L') or super_bowl_result is null),
  archived_at timestamptz not null default now(),
  unique(season_label,game,team)
);

alter table public.madden_championship_archive enable row level security;
revoke all on table public.madden_championship_archive from public,anon,authenticated;
grant select,insert,update,delete on table public.madden_championship_archive to authenticated;
drop policy if exists "admin manage madden championship archive" on public.madden_championship_archive;
create policy "admin manage madden championship archive" on public.madden_championship_archive for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create or replace function public.get_madden_championship_archive(limit_count integer default 20)
returns table (id uuid,season_label text,wins integer,losses integer,postseason_wins integer,postseason_losses integer,finish text,super_bowl_result text,archived_at timestamptz)
language sql stable security definer set search_path=pg_catalog,public as $$
  select a.id,a.season_label,a.wins,a.losses,a.postseason_wins,a.postseason_losses,a.finish,a.super_bowl_result,a.archived_at
  from public.madden_championship_archive a
  where a.game='Madden 27' and a.team='Detroit Lions'
  order by a.archived_at desc
  limit least(greatest(coalesce(limit_count,20),1),50);
$$;
revoke all on function public.get_madden_championship_archive(integer) from public;
grant execute on function public.get_madden_championship_archive(integer) to anon,authenticated;
