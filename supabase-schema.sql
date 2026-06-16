-- ==========================================================================
-- SubjectReport · Supabase schema
-- Paste this whole file into Supabase → SQL Editor → New query → Run
-- ==========================================================================

-- The single table that holds everything: bookings from the landing page AND
-- athletes you manage in the admin dashboard. A new booking comes in as
-- status='booked' and you promote it through the pipeline from there.

create table if not exists athletes (
  id             text primary key,

  -- Identity
  first_name     text not null,
  last_name      text not null,
  email          text,
  phone          text,

  -- Sport profile
  position       text,
  class_year     text,
  school         text,
  state          text,

  -- Commerce
  package        text,                    -- 'transcript' | 'program' | 'full' | 'prospect'
  status         text default 'booked',   -- 'booked' | 'paid' | 'grading' | 'delivered' | 'active' | 'churned'

  -- Grading + delivery
  grade          numeric,
  transcript_url text,

  -- Notes
  notes          text,

  -- Timestamps
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Update updated_at on every row change
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_athletes_updated on athletes;
create trigger trg_athletes_updated
  before update on athletes
  for each row execute function set_updated_at();

-- Row-Level Security
-- Public site can only create a safe "booked" lead. Admin users must authenticate
-- to read/update/delete records in the dashboard.
alter table athletes enable row level security;

-- Drop existing policies if re-running
drop policy if exists "anon can insert bookings" on athletes;
drop policy if exists "authenticated full access" on athletes;
drop policy if exists anon_insert_athletes on athletes;
drop policy if exists anon_select_athletes on athletes;
drop policy if exists authenticated_all_athletes on athletes;
drop policy if exists "authenticated can read" on athletes;
drop policy if exists "authenticated can insert" on athletes;
drop policy if exists "authenticated can update" on athletes;
drop policy if exists "authenticated can delete" on athletes;

-- Landing page (anon key) can ONLY insert a new booking payload
create policy "anon can insert bookings"
  on athletes for insert
  to anon
  with check (
    status = 'booked'
    and package in ('transcript', 'program', 'full', 'prospect')
    and grade is null
    and transcript_url is null
  );

-- Admin dashboard (authenticated key) controls all record lifecycle actions
create policy "authenticated can read"
  on athletes for select
  to authenticated
  using (true);

create policy "authenticated can insert"
  on athletes for insert
  to authenticated
  with check (true);

create policy "authenticated can update"
  on athletes for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated can delete"
  on athletes for delete
  to authenticated
  using (true);

-- Service role bypasses RLS by default, this is just explicit documentation.
-- No extra policy is required for service_role.

-- Useful indexes
create index if not exists idx_athletes_status      on athletes(status);
create index if not exists idx_athletes_package     on athletes(package);
create index if not exists idx_athletes_grade       on athletes(grade) where grade is not null;
create index if not exists idx_athletes_updated_at  on athletes(updated_at desc);

-- Done. You can run `select * from athletes;` to verify the table is empty and ready.
