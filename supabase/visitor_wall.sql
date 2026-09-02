create extension if not exists pgcrypto;

create table if not exists public.visitor_messages (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(trim(display_name)) between 1 and 24),
  message text not null default '' check (char_length(message) <= 180),
  visitor_token text not null check (char_length(visitor_token) between 16 and 128),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists visitor_messages_approved_created_idx
  on public.visitor_messages (approved, created_at desc);

create unique index if not exists visitor_messages_one_pending_per_device_idx
  on public.visitor_messages (visitor_token)
  where approved = false;

alter table public.visitor_messages enable row level security;

drop policy if exists "visitor wall public read" on public.visitor_messages;
create policy "visitor wall public read"
  on public.visitor_messages
  for select
  to anon
  using (approved = true);

drop policy if exists "visitor wall submit pending" on public.visitor_messages;
create policy "visitor wall submit pending"
  on public.visitor_messages
  for insert
  to anon
  with check (
    approved = false
    and char_length(trim(display_name)) between 1 and 24
    and char_length(message) <= 180
    and char_length(visitor_token) between 16 and 128
  );

drop policy if exists "visitor wall admin manage" on public.visitor_messages;
create policy "visitor wall admin manage"
  on public.visitor_messages
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on table public.visitor_messages from anon, authenticated;
grant select on table public.visitor_messages to anon;
grant insert (display_name, message, visitor_token) on table public.visitor_messages to anon;
grant select, insert, update, delete on table public.visitor_messages to authenticated;

