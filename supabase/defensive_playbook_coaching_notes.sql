update public.plays
set detail = notes.detail,
    tags = notes.tags,
    formation = notes.formation,
    updated_at = now()
from (values
  ('Cover 3 Buzz Match','Nickel 3-3 Over','Play pass. Turn on QB contain, spread the defensive line and user the middle linebacker.',array['match','zone','qb-contain','user-lb']),
  ('Over Storm Brave','Nickel 3-3 Over','Pinch the defensive line, press coverage and user the middle linebacker.',array['blitz','pressure','press','user-lb']),
  ('Double Bracket','Nickel 3-3 Over','Play pass, spread the defensive line, run the Texas 2 Man stunt and turn on QB contain.',array['man','bracket','stunt','qb-contain']),
  ('Cover 3 Sky','Nickel 3-3 Dbl Mug','Play pass, spread the defensive line and turn on QB contain. Play underneath on short-yardage downs.',array['zone','cover-3','qb-contain','short-yardage']),
  ('Mid Blitz','Nickel 3-3 Dbl Mug','Play pass, spread the defensive line and play underneath.',array['blitz','pressure','underneath']),
  ('Blitz Loop 3','Nickel 3-3 Dbl Mug','Play pass, spread the defensive line and play underneath.',array['blitz','loop','pressure','underneath']),
  ('Cover 3 Buzz Match','Dime 2-3','Play pass, spread the defensive line, turn on QB contain and user the middle linebacker. Play underneath on short-yardage downs.',array['match','zone','qb-contain','user-lb','short-yardage']),
  ('Double Mug','Dime 2-3','Play pass, spread the defensive line and turn on QB contain. Shade inside by default; shade outside against quick outs.',array['man','mug','qb-contain','shade-inside']),
  ('Field Stunt 3','Dime 2-3','Play pass, spread the defensive line and turn on QB contain. Shade inside by default; shade outside against quick outs.',array['blitz','stunt','pressure','qb-contain','shade-inside']),
  ('Cover 3 Drop','Big Nickel','Pass commit, spread the defensive line and turn on QB contain.',array['zone','cover-3','qb-contain','pass-commit'])
) as notes(name,formation,detail,tags)
where public.plays.type = 'Defense'
  and public.plays.name = notes.name
  and (
    public.plays.formation = notes.formation
    or (notes.name = 'Cover 3 Drop' and public.plays.formation = 'Reference Setup')
  );
