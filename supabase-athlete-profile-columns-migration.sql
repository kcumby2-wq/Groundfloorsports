-- ============================================================================
-- SubjectReport · Athlete profile column migration
-- Run this in Supabase SQL Editor for existing projects.
-- ============================================================================

alter table if exists public.athletes
  add column if not exists jersey_number text,
  add column if not exists height text,
  add column if not exists weight text,
  add column if not exists rec_team text,
  add column if not exists instagram text,
  add column if not exists x_twitter text,
  add column if not exists tiktok text,
  add column if not exists video_url text;

-- Optional verification:
-- select id, first_name, last_name, jersey_number, rec_team, instagram, x_twitter, tiktok, video_url
-- from public.athletes
-- order by updated_at desc
-- limit 20;
