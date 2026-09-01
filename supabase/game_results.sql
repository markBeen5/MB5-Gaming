-- Game result tracker schema. The historical baseline stays fixed while
-- tracked results automatically update the public wins and losses.
create table if not exists public.game_result_baseline (
  id boolean primary key default true check (id),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  played_at timestamptz not null default now(),
  game text not null default 'Madden 27',
  team text not null default 'Detroit Lions',
  opponent text,
  result text not null check (result in ('W', 'L')),
  points_for integer check (points_for >= 0),
  points_against integer check (points_against >= 0),
  mode text not null default 'Online H2H',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.game_result_baseline enable row level security;
alter table public.game_results enable row level security;

drop policy if exists "admin read game result baseline" on public.game_result_baseline;
create policy "admin read game result baseline" on public.game_result_baseline
  for select using (public.is_admin());

drop policy if exists "admin write game results" on public.game_results;
create policy "admin write game results" on public.game_results
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.recalculate_game_result_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  baseline_wins integer := 0;
  baseline_losses integer := 0;
  tracked_wins integer := 0;
  tracked_losses integer := 0;
begin
  select wins, losses
    into baseline_wins, baseline_losses
    from public.game_result_baseline
    where id = true;

  select count(*) filter (where result = 'W'),
         count(*) filter (where result = 'L')
    into tracked_wins, tracked_losses
    from public.game_results;

  update public.stats
     set wins = coalesce(baseline_wins, 0) + tracked_wins,
         losses = coalesce(baseline_losses, 0) + tracked_losses
   where id = (select id from public.stats order by created_at limit 1);

  return null;
end;
$$;

drop trigger if exists game_results_recalculate_totals on public.game_results;
create trigger game_results_recalculate_totals
after insert or update or delete on public.game_results
for each statement execute function public.recalculate_game_result_totals();

-- Preserve the initial historical record. Change these values only when
-- intentionally establishing a new site baseline.
insert into public.game_result_baseline (id, wins, losses)
values (true, 127, 42)
on conflict (id) do nothing;
