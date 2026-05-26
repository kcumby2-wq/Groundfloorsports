-- Subjectreport landing analytics table
-- Run in Supabase SQL editor.

create table if not exists public.sr_events (
  id uuid primary key,
  event_name text not null,
  detail jsonb not null default '{}'::jsonb,
  page text,
  happened_at timestamptz not null default now(),
  marketing jsonb not null default '{}'::jsonb,
  source text not null default 'subjectreport_landing',
  created_at timestamptz not null default now()
);

create index if not exists sr_events_created_at_idx on public.sr_events (created_at desc);
create index if not exists sr_events_event_name_idx on public.sr_events (event_name);

alter table public.sr_events enable row level security;

-- Public insert policy so landing page events can be written with anon key.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'sr_events'
      and policyname = 'sr_events_insert_anon'
  ) then
    create policy sr_events_insert_anon
      on public.sr_events
      for insert
      to anon
      with check (true);
  end if;
end $$;

-- Authenticated users (admin dashboard session) can read analytics.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'sr_events'
      and policyname = 'sr_events_select_authenticated'
  ) then
    create policy sr_events_select_authenticated
      on public.sr_events
      for select
      to authenticated
      using (true);
  end if;
end $$;
