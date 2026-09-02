alter table public.plays
  add column if not exists formation text not null default 'Unassigned',
  add column if not exists call_type text not null default 'Concept',
  add column if not exists tags text[] not null default '{}',
  add column if not exists situation text,
  add column if not exists enabled boolean not null default true,
  add column if not exists sort_order integer not null default 10,
  add column if not exists updated_at timestamptz not null default now();

alter table public.plays enable row level security;

drop policy if exists plays_public_read on public.plays;
create policy plays_public_read
  on public.plays
  for select
  to anon
  using (enabled = true);

drop policy if exists plays_admin_read on public.plays;
create policy plays_admin_read
  on public.plays
  for select
  to authenticated
  using ((select public.is_admin()));

grant select on table public.plays to anon, authenticated;
grant insert, update, delete on table public.plays to authenticated;

insert into public.plays (name,type,coverage,detail,image_url,formation,call_type,tags,situation,enabled,sort_order)
select seed.name,'Defense',seed.coverage,seed.detail,seed.image_url,seed.formation,seed.call_type,seed.tags,seed.situation,true,seed.sort_order
from (values
  ('Cover 3 Buzz Match','Match','Match coverage from the Nickel 3-3 Over package.','defense-33-over.jpg','Nickel 3-3 Over','Match',array['match','zone'],'Match coverage',10),
  ('Over Storm Brave','Blitz','Nickel pressure from the 3-3 Over package.','defense-33-over.jpg','Nickel 3-3 Over','Blitz',array['blitz','pressure'],'Pressure call',20),
  ('Double Bracket','Man','Bracket-man call from the Nickel 3-3 Over package.','defense-33-over.jpg','Nickel 3-3 Over','Man',array['man','bracket'],'Man coverage',30),
  ('Cover 3 Sky','Zone','Three-deep zone from the Nickel 3-3 Dbl Mug package.','defense-33-dbl-mug.jpg','Nickel 3-3 Dbl Mug','Zone',array['zone','cover-3'],'Zone coverage',40),
  ('Mid Blitz','Blitz','Interior pressure from the Nickel 3-3 Dbl Mug package.','defense-33-dbl-mug.jpg','Nickel 3-3 Dbl Mug','Blitz',array['blitz','pressure'],'Pressure call',50),
  ('Blitz Loop 3','Blitz','Loop pressure from the Nickel 3-3 Dbl Mug package.','defense-33-dbl-mug.jpg','Nickel 3-3 Dbl Mug','Blitz',array['blitz','loop','pressure'],'Pressure call',60),
  ('Cover 3 Buzz Match','Match','Match coverage from the Dime 2-3 package.','defense-dime-23.jpg','Dime 2-3','Match',array['match','zone'],'Match coverage',70),
  ('Double Mug','Man','Man call from the Dime 2-3 package.','defense-dime-23.jpg','Dime 2-3','Man',array['man','mug'],'Man coverage',80),
  ('Field Stunt 3','Blitz','Stunt pressure from the Dime 2-3 package.','defense-dime-23.jpg','Dime 2-3','Blitz',array['blitz','stunt','pressure'],'Pressure call',90),
  ('Cover 3 Drop','Zone','Three-deep zone reference call. Add the final MB5 formation and adjustments from Admin.',null,'Reference Setup','Zone',array['zone','cover-3','reference'],'Zone coverage',100)
) as seed(name,coverage,detail,image_url,formation,call_type,tags,situation,sort_order)
where not exists (
  select 1 from public.plays existing
  where existing.type = 'Defense'
    and existing.name = seed.name
    and existing.formation = seed.formation
);

