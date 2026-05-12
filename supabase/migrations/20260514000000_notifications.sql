-- Wave 8 — notifications: device tokens + quiet hours.

-- One row per (user, device); supports multi-device push.
create table if not exists device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  expo_push_token text not null,
  platform text,                       -- 'ios' | 'android'
  device_name text,
  created_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

alter table device_tokens enable row level security;

create policy "device_tokens_self" on device_tokens for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Quiet hours (07:00–22:00 default — outside that, no pushes).
alter table profiles
  add column if not exists notifications_quiet_start time default '22:00',
  add column if not exists notifications_quiet_end   time default '07:00';
