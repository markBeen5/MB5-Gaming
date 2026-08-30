# MB5 Gaming — MarkBeen5

Official source repository for the MarkBeen5 gaming website.

## Stack
- Static HTML/CSS/JavaScript frontend
- Supabase Auth + Postgres + Row Level Security
- Mobile-friendly admin dashboard
- Social integrations are handled server-side so private API credentials are never committed here

## Brand
Madden 27 • Detroit Lions • Competitive gaming • Streaming • Clips • Playbook • Stats

## Security
Never commit Twitch client secrets, TikTok/Instagram access tokens, YouTube private API credentials, passwords, or a Supabase service-role/secret key. Browser code should only use the Supabase project URL and publishable/anon key with RLS enabled.
