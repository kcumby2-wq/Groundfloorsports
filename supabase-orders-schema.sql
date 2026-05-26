-- ======================================================================
-- GroundfloorSports orders schema
-- Run this in Supabase SQL editor if you want API checkout writes in Supabase.
-- ======================================================================

create table if not exists gfs_orders (
  id            uuid primary key,
  user_id       text not null,
  game_slug     text not null,
  clip_id       text,
  purchase_kind text not null,
  product_name  text not null,
  amount_usd    numeric(10,2) not null,
  currency      text not null default 'USD',
  status        text not null default 'created',
  delivery_type text not null,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists idx_gfs_orders_user_id on gfs_orders(user_id);
create index if not exists idx_gfs_orders_game_slug on gfs_orders(game_slug);
create index if not exists idx_gfs_orders_created_at on gfs_orders(created_at desc);

alter table gfs_orders enable row level security;

drop policy if exists "users can read own gfs orders" on gfs_orders;
create policy "users can read own gfs orders"
  on gfs_orders for select
  to authenticated
  using (user_id = auth.jwt()->>'sub');

-- Checkout API writes with service role key, so no insert policy is required.
