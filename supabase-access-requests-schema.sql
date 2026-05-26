-- Subjectreport event admin access request queue
-- Run in Supabase SQL editor for production queue + status workflow.

create table if not exists public.sr_access_requests (
  id uuid primary key,
  organization text not null,
  requester_name text not null,
  requester_email text not null,
  requester_phone text,
  role text not null,
  event_type text not null,
  event_date date,
  athlete_count_band text not null,
  event_location text not null,
  access_timing text not null,
  notes text,
  status text not null default 'requested',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sr_access_requests_status on public.sr_access_requests(status);
create index if not exists idx_sr_access_requests_created_at on public.sr_access_requests(created_at desc);
create index if not exists idx_sr_access_requests_requester_email on public.sr_access_requests(requester_email);

create or replace function public.set_sr_access_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_sr_access_requests_updated_at on public.sr_access_requests;
create trigger trg_sr_access_requests_updated_at
before update on public.sr_access_requests
for each row execute function public.set_sr_access_requests_updated_at();

alter table public.sr_access_requests enable row level security;

-- Allow anonymous/public inserts from landing page intake flow.
drop policy if exists "anon_insert_access_requests" on public.sr_access_requests;
create policy "anon_insert_access_requests"
on public.sr_access_requests
for insert
to anon, authenticated
with check (status = 'requested');

-- Authenticated staff can read and manage queue rows.
drop policy if exists "authenticated_manage_access_requests" on public.sr_access_requests;
create policy "authenticated_manage_access_requests"
on public.sr_access_requests
for all
to authenticated
using (true)
with check (true);
