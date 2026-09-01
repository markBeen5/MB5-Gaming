-- Game result tracker schema. The historical baseline stays fixed while
-- tracked results automatically update the public record and streak.
create table if not exists public.game_result_baseline (
  id boolean primary key default true check (id),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  streak text not null default 'W0' check (streak ~ '^[WL][0-9]+$'),
  created_at timestamptz not null default now()
);

create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  played_at timestamptz not null default now(),
  game text not null default 'Madden 27',
  team text not null default 'Detroit Lions',
  opponent text not null,
  result text not null check (result in ('W', 'L')),
  points_for integer check (points_for >= 0),
  points_against integer check (points_against >= 0),
  mode text not null default 'Online H2H',
  notes text,
  created_at timestamptz not null default now()
);

-- Bring older installations up to the completed tracker schema.
alter table public.game_result_baseline add column if not exists streak text not null default 'W0';

-- Remove accidental double submissions from the same minute before enforcing
-- the database-level duplicate guard.
with ranked_results as (
  select id,
         row_number() over (
           partition by
             date_trunc('minute', played_at at time zone 'UTC'),
             lower(trim(game)),
             lower(trim(team)),
             coalesce(lower(trim(opponent)), ''),
             result,
             coalesce(points_for, -1),
             coalesce(points_against, -1),
             lower(trim(mode))
           order by created_at, id
         ) as duplicate_number
  from public.game_results
)
delete from public.game_results
where id in (select id from ranked_results where duplicate_number > 1);

update public.game_results
set opponent = 'Unknown opponent'
where opponent is null or trim(opponent) = '';

alter table public.game_results alter column opponent set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'game_result_baseline_streak_check') then
    alter table public.game_result_baseline
      add constraint game_result_baseline_streak_check check (streak ~ '^[WL][0-9]+$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'game_results_required_text_check') then
    alter table public.game_results
      add constraint game_results_required_text_check check (
        trim(game) <> '' and trim(team) <> '' and trim(opponent) <> '' and trim(mode) <> ''
      );
  end if;
  if not exists (select 1 from pg_constraint where conname = 'game_results_score_check') then
    alter table public.game_results
      add constraint game_results_score_check check (
        (points_for is null and points_against is null)
        or
        (
          points_for is not null
          and points_against is not null
          and (
            (result = 'W' and points_for > points_against)
            or (result = 'L' and points_for < points_against)
          )
        )
      );
  end if;
end
$$;

create unique index if not exists game_results_no_duplicate_minute
on public.game_results (
  date_trunc('minute', played_at at time zone 'UTC'),
  lower(trim(game)),
  lower(trim(team)),
  lower(trim(opponent)),
  result,
  coalesce(points_for, -1),
  coalesce(points_against, -1),
  lower(trim(mode))
);

alter table public.game_result_baseline enable row level security;
alter table public.game_results enable row level security;

revoke all on table public.game_result_baseline from public, anon, authenticated;
revoke all on table public.game_results from public, anon, authenticated;
grant select, insert, update, delete on table public.game_result_baseline to authenticated;
grant select, insert, update, delete on table public.game_results to authenticated;

drop policy if exists "public read" on public.game_result_baseline;
drop policy if exists "admin write" on public.game_result_baseline;
drop policy if exists "admin read game result baseline" on public.game_result_baseline;
drop policy if exists "public read" on public.game_results;
drop policy if exists "admin write" on public.game_results;
drop policy if exists "admin write game results" on public.game_results;

create policy "admin manage game result baseline" on public.game_result_baseline
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin manage game results" on public.game_results
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create or replace function public.recalculate_game_result_totals()
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  baseline_wins integer := 0;
  baseline_losses integer := 0;
  baseline_streak text := 'W0';
  tracked_wins integer := 0;
  tracked_losses integer := 0;
  tracked_total integer := 0;
  latest_result text;
  consecutive_results integer := 0;
  current_streak text := 'W0';
begin
  select wins, losses, streak
    into baseline_wins, baseline_losses, baseline_streak
    from public.game_result_baseline
    where id = true;

  select count(*) filter (where result = 'W'),
         count(*) filter (where result = 'L'),
         count(*)
    into tracked_wins, tracked_losses, tracked_total
    from public.game_results;

  select result
    into latest_result
    from public.game_results
    order by played_at desc, created_at desc, id desc
    limit 1;

  if latest_result is null then
    current_streak := coalesce(baseline_streak, 'W0');
  else
    select coalesce(
             min(sequence_number) filter (where result <> latest_result) - 1,
             count(*)
           )::integer
      into consecutive_results
      from (
        select result,
               row_number() over (order by played_at desc, created_at desc, id desc) as sequence_number
        from public.game_results
      ) ordered_results;

    if consecutive_results = tracked_total and left(baseline_streak, 1) = latest_result then
      consecutive_results := consecutive_results + substring(baseline_streak from 2)::integer;
    end if;
    current_streak := latest_result || consecutive_results::text;
  end if;

  update public.stats
     set wins = coalesce(baseline_wins, 0) + tracked_wins,
         losses = coalesce(baseline_losses, 0) + tracked_losses,
         streak = current_streak
   where id = (select id from public.stats order by created_at limit 1);
end;
$$;

create or replace function public.refresh_stats_from_game_results()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  perform public.recalculate_game_result_totals();
  return null;
end;
$$;

revoke all on function public.recalculate_game_result_totals() from public, anon, authenticated;
revoke all on function public.refresh_stats_from_game_results() from public, anon, authenticated;

drop trigger if exists game_results_recalculate_totals on public.game_results;
drop trigger if exists game_results_refresh_stats on public.game_results;
create trigger game_results_refresh_stats
after insert or update or delete on public.game_results
for each statement execute function public.refresh_stats_from_game_results();

-- Preserve the original record and streak as the historical starting point.
insert into public.game_result_baseline (id, wins, losses, streak)
values (true, 127, 42, 'W7')
on conflict (id) do nothing;

update public.game_result_baseline
set streak = 'W7'
where id = true and wins = 127 and losses = 42 and streak = 'W0';

select public.recalculate_game_result_totals();
