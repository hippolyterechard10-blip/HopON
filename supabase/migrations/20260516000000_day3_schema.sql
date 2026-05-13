-- Day 3 schema additions (sprint May 13, 2026)
-- Source of truth: CLAUDE.md §4 ("Day 3 additions to schedule")
--
-- This migration adds:
--   • horse_owners       — many-to-many primary + co-owners (CLAUDE.md §11)
--   • horse_medications  — daily supplements that auto-feed team to-dos
--   • horse_treatments   — temporary treatments with owner→manager→team
--                          validation workflow (CLAUDE.md §10)
--   • prescriptions      — PDF/photo uploads linked to a treatment
--   • news_post_tags     — @all / @team / @owners / @[custom-group]
--   • client_groups      — Competition · Beginners · Boarders · …
--   • client_group_members
--   • next_due_reminders — farrier / vaccine / vermifuge / osteo / physio
--                          / dentist with urgency thresholds (CLAUDE.md §9)
--
-- All tables ship with RLS enabled and policies scoped via the existing
-- helpers is_barn_member() and has_barn_role().

set check_function_bodies = off;

-- =========================================================================
-- ENUMS
-- =========================================================================

create type horse_owner_role as enum ('primary', 'co_owner');

create type horse_treatment_status as enum (
  'requested',     -- owner just asked
  'rejected',      -- barn manager rejected with note
  'validated',     -- approved → tasks generated
  'in_progress',   -- groom currently doing it
  'completed',     -- groom marked it done
  'cancelled'
);

create type next_due_kind as enum (
  'farrier', 'vaccine', 'vermifuge', 'osteo', 'physio', 'dentist'
);

create type news_tag_kind as enum ('all', 'team', 'owners', 'group');

-- =========================================================================
-- HORSE OWNERS (m:n)
-- =========================================================================

create table horse_owners (
  id uuid primary key default gen_random_uuid(),
  horse_id uuid not null references horses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role horse_owner_role not null default 'co_owner',
  created_at timestamptz not null default now(),
  unique (horse_id, user_id)
);

create index horse_owners_horse_idx on horse_owners (horse_id);
create index horse_owners_user_idx on horse_owners (user_id);

-- Backfill from horses.owner_id (existing primary owner column).
insert into horse_owners (horse_id, user_id, role)
select id, owner_id, 'primary'::horse_owner_role
from horses
where owner_id is not null
on conflict (horse_id, user_id) do nothing;

-- =========================================================================
-- HORSE MEDICATIONS — daily supplements
-- =========================================================================

create table horse_medications (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  horse_id uuid not null references horses(id) on delete cascade,
  name text not null,                    -- e.g. "Equibiom", "Biotin"
  dosage text,                           -- "2 scoops", "30g"
  times_per_day integer not null default 1,
  schedule jsonb,                        -- {morning: true, evening: true}
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create index horse_medications_horse_idx on horse_medications (horse_id) where is_active;

-- =========================================================================
-- HORSE TREATMENTS — validation workflow
-- =========================================================================

create table horse_treatments (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  horse_id uuid not null references horses(id) on delete cascade,
  title text not null,                   -- "Antibiotic course", "Joint injection"
  notes text,
  status horse_treatment_status not null default 'requested',
  requested_by uuid references profiles(id),    -- usually the owner
  validated_by uuid references profiles(id),    -- barn manager
  validated_at timestamptz,
  rejection_note text,
  starts_on date,
  ends_on date,
  prescription_id uuid,                  -- FK below once prescriptions table exists
  created_at timestamptz not null default now()
);

create index horse_treatments_horse_idx on horse_treatments (horse_id, status);

-- =========================================================================
-- PRESCRIPTIONS — uploaded PDFs / photos
-- =========================================================================

create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  horse_id uuid not null references horses(id) on delete cascade,
  treatment_id uuid references horse_treatments(id) on delete set null,
  file_url text not null,                -- Supabase Storage URL
  file_kind text not null,               -- 'pdf' | 'image'
  uploaded_by uuid references profiles(id),
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create index prescriptions_horse_idx on prescriptions (horse_id, created_at desc);

alter table horse_treatments
  add constraint horse_treatments_prescription_fk
  foreign key (prescription_id) references prescriptions(id) on delete set null;

-- =========================================================================
-- CLIENT GROUPS (Competition · Beginners · Boarders…)
-- =========================================================================

create table client_groups (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  name text not null,                    -- "Competition", "Beginners", custom
  color text,
  created_at timestamptz not null default now(),
  unique (barn_id, name)
);

create table client_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references client_groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create index client_group_members_user_idx on client_group_members (user_id);

-- =========================================================================
-- NEWS POST TAGS — @all / @team / @owners / @[custom-group]
-- =========================================================================

create table news_post_tags (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null references barn_news(id) on delete cascade,
  kind news_tag_kind not null,
  group_id uuid references client_groups(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Either kind in (all, team, owners) with group_id null, OR kind=group with group_id set.
  check (
    (kind = 'group' and group_id is not null) or
    (kind <> 'group' and group_id is null)
  )
);

create index news_post_tags_news_idx on news_post_tags (news_id);

-- =========================================================================
-- NEXT DUE REMINDERS — farrier, vaccines, vermifuge, osteo, physio, dentist
-- =========================================================================

create table next_due_reminders (
  id uuid primary key default gen_random_uuid(),
  barn_id uuid not null references barns(id) on delete cascade,
  horse_id uuid not null references horses(id) on delete cascade,
  kind next_due_kind not null,
  due_on date not null,
  notes text,
  completed_at timestamptz,              -- when marked done it disappears
  related_task_id uuid references tasks(id),
  related_event_id uuid references calendar_events(id),
  created_at timestamptz not null default now()
);

create index next_due_reminders_barn_due_idx on next_due_reminders (barn_id, due_on)
  where completed_at is null;
create index next_due_reminders_horse_idx on next_due_reminders (horse_id)
  where completed_at is null;

-- =========================================================================
-- RLS — enable + policies
-- =========================================================================

alter table horse_owners enable row level security;
alter table horse_medications enable row level security;
alter table horse_treatments enable row level security;
alter table prescriptions enable row level security;
alter table client_groups enable row level security;
alter table client_group_members enable row level security;
alter table news_post_tags enable row level security;
alter table next_due_reminders enable row level security;

-- Horse owners: barn members can read; only barn_owner can mutate.
create policy "horse_owners_read" on horse_owners for select using (
  exists (select 1 from horses h where h.id = horse_id and is_barn_member(h.barn_id))
);
create policy "horse_owners_owner_write" on horse_owners for all using (
  exists (select 1 from horses h where h.id = horse_id and has_barn_role(h.barn_id, 'barn_owner'))
);

-- Daily medications: barn members read; staff write.
create policy "horse_medications_read" on horse_medications for select
  using (is_barn_member(barn_id));
create policy "horse_medications_staff_write" on horse_medications for all using (
  has_barn_role(barn_id, 'barn_owner')
  or has_barn_role(barn_id, 'trainer')
  or has_barn_role(barn_id, 'barn_manager')
);

-- Treatments: members read; owner can insert (requested); manager can validate.
create policy "horse_treatments_read" on horse_treatments for select
  using (is_barn_member(barn_id));
create policy "horse_treatments_owner_insert" on horse_treatments for insert with check (
  is_barn_member(barn_id)
);
create policy "horse_treatments_manager_update" on horse_treatments for update using (
  has_barn_role(barn_id, 'barn_owner')
  or has_barn_role(barn_id, 'barn_manager')
);

-- Prescriptions: barn members can upload + read.
create policy "prescriptions_read" on prescriptions for select using (is_barn_member(barn_id));
create policy "prescriptions_member_insert" on prescriptions for insert with check (
  is_barn_member(barn_id) and uploaded_by = auth.uid()
);

-- Client groups + memberships: staff only.
create policy "client_groups_read" on client_groups for select using (is_barn_member(barn_id));
create policy "client_groups_staff_write" on client_groups for all using (
  has_barn_role(barn_id, 'barn_owner')
  or has_barn_role(barn_id, 'barn_manager')
  or has_barn_role(barn_id, 'trainer')
);

create policy "client_group_members_read" on client_group_members for select using (
  exists (select 1 from client_groups g where g.id = group_id and is_barn_member(g.barn_id))
);
create policy "client_group_members_staff_write" on client_group_members for all using (
  exists (
    select 1 from client_groups g
    where g.id = group_id
      and (has_barn_role(g.barn_id, 'barn_owner') or has_barn_role(g.barn_id, 'barn_manager') or has_barn_role(g.barn_id, 'trainer'))
  )
);

-- News tags: barn members read; staff write.
create policy "news_post_tags_read" on news_post_tags for select using (
  exists (select 1 from barn_news n where n.id = news_id and is_barn_member(n.barn_id))
);
create policy "news_post_tags_staff_write" on news_post_tags for all using (
  exists (
    select 1 from barn_news n
    where n.id = news_id
      and (has_barn_role(n.barn_id, 'barn_owner') or has_barn_role(n.barn_id, 'barn_manager') or has_barn_role(n.barn_id, 'trainer'))
  )
);

-- Next due reminders: members read; staff write.
create policy "next_due_read" on next_due_reminders for select using (is_barn_member(barn_id));
create policy "next_due_staff_write" on next_due_reminders for all using (
  has_barn_role(barn_id, 'barn_owner')
  or has_barn_role(barn_id, 'trainer')
  or has_barn_role(barn_id, 'barn_manager')
);
