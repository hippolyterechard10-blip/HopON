-- HopOn V1 initial schema
-- Mirrors CLAUDE.md §4. Every table has RLS enabled.

create extension if not exists "pgcrypto";

-- =========================================================================
-- ENUMS
-- =========================================================================

create type barn_role as enum (
  'barn_owner', 'trainer', 'pro_rider', 'groom',
  'barn_manager', 'secretary', 'client', 'parent'
);

create type task_status as enum ('pending', 'in_progress', 'done', 'delayed', 'issue');
create type task_priority as enum ('normal', 'high', 'urgent');

create type lesson_status as enum (
  'scheduled', 'confirmed', 'in_progress', 'completed',
  'cancelled_client', 'cancelled_trainer', 'no_show'
);

create type event_type as enum (
  'farrier', 'vet', 'dentist', 'physio', 'transport',
  'show', 'training_camp', 'barn_event', 'other'
);

create type payment_status as enum (
  'pending', 'processing', 'succeeded', 'failed', 'refunded'
);

-- =========================================================================
-- PROFILES
-- =========================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- BARNS + MEMBERSHIPS
-- =========================================================================

create table barns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  address text,
  timezone text not null default 'America/New_York',
  stripe_account_id text,
  owner_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table barn_memberships (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  roles barn_role[] not null,
  is_active boolean not null default true,
  joined_at timestamptz not null default now(),
  unique (barn_id, user_id)
);

create index barn_memberships_user_idx on barn_memberships (user_id) where is_active;

-- =========================================================================
-- HORSES
-- =========================================================================

create table horses (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  name text not null,
  breed text,
  age integer,
  stall text,
  photo_url text,
  feeding_notes text,
  medication_notes text,
  equipment_notes text,
  vet_name text,
  vet_phone text,
  farrier_name text,
  farrier_phone text,
  owner_id uuid references profiles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index horses_barn_idx on horses (barn_id) where is_active;

-- =========================================================================
-- TASKS
-- =========================================================================

create table tasks (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  horse_id uuid references horses(id),
  assigned_to uuid references profiles(id),
  created_by uuid references profiles(id),
  title text not null,
  notes text,
  status task_status not null default 'pending',
  priority task_priority not null default 'normal',
  due_at timestamptz,
  completed_at timestamptz,
  is_recurring boolean not null default false,
  recurrence_rule text,
  created_at timestamptz not null default now()
);

create index tasks_barn_due_idx on tasks (barn_id, due_at);
create index tasks_assignee_idx on tasks (assigned_to) where status <> 'done';

create table task_updates (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid references profiles(id),
  status task_status not null,
  note text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- LESSONS
-- =========================================================================

create table lesson_types (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  name text not null,
  duration_minutes integer not null default 60,
  price_cents integer,
  max_riders integer not null default 1,
  color text,
  is_active boolean not null default true,
  is_group boolean not null default false   -- V2 group lesson waitlist hook
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  lesson_type_id uuid references lesson_types(id),
  trainer_id uuid references profiles(id),
  horse_id uuid references horses(id),
  client_id uuid references profiles(id),
  status lesson_status not null default 'scheduled',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  notes text,
  level text,
  discipline text,
  is_paid boolean not null default false,
  payment_id uuid,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now()
);

create index lessons_barn_time_idx on lessons (barn_id, starts_at);
create index lessons_trainer_time_idx on lessons (trainer_id, starts_at);
create index lessons_client_time_idx on lessons (client_id, starts_at);

-- =========================================================================
-- CALENDAR EVENTS
-- =========================================================================

create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  horse_id uuid references horses(id),
  created_by uuid references profiles(id),
  event_type event_type not null,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  provider_name text,
  provider_phone text,
  location text,
  created_at timestamptz not null default now()
);

create index calendar_events_barn_time_idx on calendar_events (barn_id, starts_at);

-- =========================================================================
-- PAYMENTS + INVOICES
-- =========================================================================

create table payments (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  payer_id uuid references profiles(id),
  recipient_id uuid references profiles(id),
  lesson_id uuid references lessons(id),
  amount_cents integer not null,
  currency text not null default 'usd',
  status payment_status not null default 'pending',
  stripe_payment_intent_id text unique,
  stripe_charge_id text,
  tax_rate_percent numeric(5,2),
  tax_amount_cents integer not null default 0,
  is_prepayment boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- Backfill lessons.payment_id FK (deferred — payments table now exists)
alter table lessons
  add constraint lessons_payment_fk foreign key (payment_id) references payments(id);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  client_id uuid references profiles(id),
  line_items jsonb not null,
  subtotal_cents integer not null,
  tax_cents integer not null default 0,
  total_cents integer not null,
  status text not null default 'draft',  -- draft / sent / paid / overdue
  due_date date,
  paid_at timestamptz,
  stripe_invoice_id text,
  notes text,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- HORSE FEED, NEWS, NOTIFICATIONS, SERVICES
-- =========================================================================

create table horse_updates (
  id uuid primary key default gen_random_uuid(),
  horse_id uuid not null references horses(id) on delete cascade,
  barn_id uuid not null references barns(id),
  created_by uuid references profiles(id),
  content text not null,
  photo_urls text[],
  update_type text,  -- 'care' | 'health' | 'training' | 'general'
  created_at timestamptz not null default now()
);

create index horse_updates_horse_time_idx on horse_updates (horse_id, created_at desc);

create table service_requests (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  horse_id uuid references horses(id),
  requested_by uuid references profiles(id),
  assigned_to uuid references profiles(id),
  service_type text not null,
  description text,
  status text not null default 'pending',
  scheduled_at timestamptz,
  price_cents integer,
  is_billable boolean not null default true,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  barn_id uuid references barns(id),
  type text not null,
  title text not null,
  body text,
  data jsonb,
  is_read boolean not null default false,
  sent_at timestamptz not null default now()
);

create index notifications_user_unread_idx on notifications (user_id, sent_at desc) where not is_read;

create table barn_news (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  author_id uuid references profiles(id),
  title text not null,
  content text,
  photo_urls text[],
  created_at timestamptz not null default now()
);

-- =========================================================================
-- V2/V3 FORWARD-COMPAT STUBS (CLAUDE.md §10)
-- =========================================================================

create table qr_codes (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  entity_type text not null,   -- 'horse' | 'stall' | 'paddock' | 'arena'
  entity_id uuid not null,
  code text unique not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table shows (
  id uuid primary key default gen_random_uuid(),
  source text,                 -- 'wef' | 'thermal' | 'hits_ocala' | 'manual'
  name text not null,
  venue text,
  starts_on date not null,
  ends_on date,
  external_url text,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  contract_type text not null,  -- 'boarding' | 'leasing' | 'sale'
  party_id uuid references profiles(id),
  horse_id uuid references horses(id),
  status text not null default 'draft',
  effective_from date,
  effective_to date,
  terms jsonb,
  created_at timestamptz not null default now()
);

create table voice_reports (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  author_id uuid references profiles(id),
  audio_url text not null,
  transcript text,
  context_type text,            -- 'self' | 'trainer' | 'extra'
  context_id uuid,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- HELPER: is the current user a member of this barn?
-- =========================================================================

create or replace function is_barn_member(b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from barn_memberships
    where barn_id = b
      and user_id = auth.uid()
      and is_active = true
  )
$$;

create or replace function has_barn_role(b uuid, r barn_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from barn_memberships
    where barn_id = b
      and user_id = auth.uid()
      and is_active = true
      and r = any (roles)
  )
$$;

-- =========================================================================
-- RLS — enabled everywhere
-- =========================================================================

alter table profiles enable row level security;
alter table barns enable row level security;
alter table barn_memberships enable row level security;
alter table horses enable row level security;
alter table tasks enable row level security;
alter table task_updates enable row level security;
alter table lesson_types enable row level security;
alter table lessons enable row level security;
alter table calendar_events enable row level security;
alter table payments enable row level security;
alter table invoices enable row level security;
alter table horse_updates enable row level security;
alter table service_requests enable row level security;
alter table notifications enable row level security;
alter table barn_news enable row level security;
alter table qr_codes enable row level security;
alter table shows enable row level security;
alter table contracts enable row level security;
alter table voice_reports enable row level security;

-- Profiles: a user reads/writes only their own profile; barn members can see other members' profiles.
create policy "profiles_self_read" on profiles for select using (id = auth.uid());
create policy "profiles_self_write" on profiles for update using (id = auth.uid());
create policy "profiles_self_insert" on profiles for insert with check (id = auth.uid());
create policy "profiles_barn_members_read" on profiles for select using (
  exists (
    select 1
    from barn_memberships m1
    join barn_memberships m2 on m1.barn_id = m2.barn_id
    where m1.user_id = auth.uid() and m2.user_id = profiles.id and m1.is_active and m2.is_active
  )
);

-- Barns: members can read; only barn_owner can update.
create policy "barns_member_read" on barns for select using (is_barn_member(id));
create policy "barns_owner_write" on barns for update using (has_barn_role(id, 'barn_owner'));
create policy "barns_insert_any" on barns for insert with check (auth.uid() is not null);

-- Memberships: members can read; only barn_owner can mutate; users can read their own row.
create policy "memberships_self_read" on barn_memberships for select using (user_id = auth.uid());
create policy "memberships_barn_read" on barn_memberships for select using (is_barn_member(barn_id));
create policy "memberships_owner_write" on barn_memberships for all
  using (has_barn_role(barn_id, 'barn_owner'))
  with check (has_barn_role(barn_id, 'barn_owner'));

-- Horses: barn members read; trainers/owners/managers write.
create policy "horses_read" on horses for select using (is_barn_member(barn_id));
create policy "horses_write" on horses for all using (
  has_barn_role(barn_id, 'barn_owner')
  or has_barn_role(barn_id, 'trainer')
  or has_barn_role(barn_id, 'barn_manager')
);

-- Tasks: barn members read; staff write; grooms can update their own assigned tasks.
create policy "tasks_read" on tasks for select using (is_barn_member(barn_id));
create policy "tasks_staff_write" on tasks for all using (
  has_barn_role(barn_id, 'barn_owner')
  or has_barn_role(barn_id, 'trainer')
  or has_barn_role(barn_id, 'barn_manager')
);
create policy "tasks_groom_update_own" on tasks for update using (
  assigned_to = auth.uid() and has_barn_role(barn_id, 'groom')
);

create policy "task_updates_read" on task_updates for select using (
  exists (select 1 from tasks t where t.id = task_id and is_barn_member(t.barn_id))
);
create policy "task_updates_insert" on task_updates for insert with check (user_id = auth.uid());

-- Lesson types + lessons.
create policy "lesson_types_read" on lesson_types for select using (is_barn_member(barn_id));
create policy "lesson_types_write" on lesson_types for all using (
  has_barn_role(barn_id, 'barn_owner') or has_barn_role(barn_id, 'trainer')
);

create policy "lessons_read" on lessons for select using (
  is_barn_member(barn_id)
  and (
    has_barn_role(barn_id, 'barn_owner')
    or has_barn_role(barn_id, 'barn_manager')
    or trainer_id = auth.uid()
    or client_id = auth.uid()
    or has_barn_role(barn_id, 'groom')
  )
);
create policy "lessons_write" on lessons for all using (
  has_barn_role(barn_id, 'barn_owner')
  or has_barn_role(barn_id, 'trainer')
  or has_barn_role(barn_id, 'barn_manager')
);

-- Calendar events.
create policy "calendar_events_read" on calendar_events for select using (is_barn_member(barn_id));
create policy "calendar_events_write" on calendar_events for all using (
  has_barn_role(barn_id, 'barn_owner')
  or has_barn_role(barn_id, 'trainer')
  or has_barn_role(barn_id, 'barn_manager')
);

-- Payments + invoices: tightly scoped financial data.
create policy "payments_owner_read" on payments for select using (has_barn_role(barn_id, 'barn_owner'));
create policy "payments_party_read" on payments for select using (
  payer_id = auth.uid() or recipient_id = auth.uid()
);
create policy "payments_owner_write" on payments for all using (has_barn_role(barn_id, 'barn_owner'));

create policy "invoices_owner_read" on invoices for select using (has_barn_role(barn_id, 'barn_owner'));
create policy "invoices_client_read" on invoices for select using (client_id = auth.uid());
create policy "invoices_owner_write" on invoices for all using (has_barn_role(barn_id, 'barn_owner'));

-- Horse feed: any member reads; staff + horse owner can write.
create policy "horse_updates_read" on horse_updates for select using (is_barn_member(barn_id));
create policy "horse_updates_write" on horse_updates for insert with check (
  is_barn_member(barn_id) and created_by = auth.uid()
);

-- Service requests.
create policy "service_requests_read" on service_requests for select using (is_barn_member(barn_id));
create policy "service_requests_write" on service_requests for all using (
  has_barn_role(barn_id, 'barn_owner')
  or has_barn_role(barn_id, 'trainer')
  or has_barn_role(barn_id, 'barn_manager')
);

-- Notifications: per-user.
create policy "notifications_self" on notifications for all using (user_id = auth.uid());

-- Barn news.
create policy "barn_news_read" on barn_news for select using (is_barn_member(barn_id));
create policy "barn_news_write" on barn_news for all using (
  has_barn_role(barn_id, 'barn_owner')
  or has_barn_role(barn_id, 'trainer')
  or has_barn_role(barn_id, 'barn_manager')
);

-- Stubs (default deny + member-read where it makes sense).
create policy "qr_codes_read" on qr_codes for select using (is_barn_member(barn_id));
create policy "qr_codes_write" on qr_codes for all using (has_barn_role(barn_id, 'barn_owner'));

create policy "shows_read" on shows for select using (auth.uid() is not null);

create policy "contracts_owner" on contracts for all using (has_barn_role(barn_id, 'barn_owner'));

create policy "voice_reports_read" on voice_reports for select using (is_barn_member(barn_id));
create policy "voice_reports_write" on voice_reports for insert with check (
  is_barn_member(barn_id) and author_id = auth.uid()
);
