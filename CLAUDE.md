# HopOn — Claude Code Master Prompt

> Complete specification for building HopOn V1 production-ready app.
> Companion docs: `docs/wireframes.html`, `docs/sprint-day1-recap.pdf`, `docs/sprint-day2-recap.pdf`, **`docs/sprint-day3-recap.pdf`**, `docs/logo-brief.pdf`.

---

## 0. CONTEXT

HopOn is a **mobile-first stable management app** for US riding barns — every level, from local riding clubs to professional show barns, plus the trainers, grooms, and clients who run them day-to-day. Replaces WhatsApp chaos and spreadsheets with a calm, operational coordination layer.

- **Positioning** — "The app that simplifies your horse life · that turns your time into money."
- **Audience breadth** — Built for every barn that gives lessons. Not premium-only (the BMW lane), not bargain (the Dacia lane) — the Volkswagen of barn software: well-built, dependable, broadly accessible.
- **Why open HopOn on a Tuesday at 7am** — planning · financial dashboard · team view.
- **North Star** — 90% retention of target barns at 6 months.
- **Go-to-market** — Ocala + Wellington, FL · winter show season starting January 2027. Cluster from there into the broader US riding-club market.
- **Design benchmarks** — Lululemon energy · Strava (habit) · MindBody (vertical) · Doctolib (trust) · Uber (just works) · Airbnb (elegant two-sided).
- **Forbidden** — Not the Facebook of horses · no cluttered UI · not decorative like Hermès · not low cost · not slow.
- **Cringe words** — unreliable · gimmick · complicated · buggy · slow.

---

## 1. TECH STACK

**Mobile** — React Native + Expo (Managed Workflow), TypeScript strict, Expo Router v3, Expo SDK 51+. *(Day 3: confirmed over PWA — push notifs critical)*

**Backend** — Supabase (Auth, Postgres, Realtime, Storage, Edge Functions). RLS on every table.

**Payments** — Stripe React Native SDK (Apple Pay + Google Pay primary). **Zelle + Square** integrations planned for prestataire-driven flows (Day 3).

**State** — TanStack Query (server), Zustand (UI), React Hook Form + Zod (forms).

**Notifications** — Expo Notifications (APNs + FCM).

**i18n** — `expo-localization` + `react-i18next`. **EN · FR · ES** from V1 architecture (Day 3).

**Tooling** — ESLint, Prettier, Husky, Detox (E2E scaffolded for V2).

---

## 2. BRAND — Locked

**Color**: Eucalyptus, anchor `#2A957F`. Full ramp in `constants/colors.ts`.

**Typography**: DM Sans (UI) + DM Serif Display Italic (heroes). Calibre direction validated as alternative if needed.

**Logo brief**: built around the **H**. HopOn — capitalize H and second O (naming convention, not visual instruction). Feel = Doctolib / MindBody, not heritage equestrian. Walid leads exploration.

---

## 3. NAVIGATION — Day 3 Architecture

```
app/
├── (auth)/         # Welcome · sign-in · sign-up · check-email
├── (onboarding)/   # V1 ultra-rapid — role only, skip-friendly
└── (app)/          # Bottom tabs:
    ├── Home        # Role-adaptive
    ├── Calendar    # Events with date+time (lessons, vet, farrier, shows)
    ├── Whiteboard  # Operational to-dos · columns by person OR horse (toggle)
    ├── MyStable    # 4 sub-tabs: Horses · Clients · Team · Partners
    └── Dashboard   # Owner-only · financial + operational metrics
```

**FAB "+"** (bottom right floating button)
- Wheel / petals menu on tap, spring animation + stagger + backdrop blur
- Standard items: **Lesson · Event · To-Do · Post**
- Adapts to current page + user permissions
- Dashboard also accessible from Home (tap on revenue)
- Mobile-first priority. TV view considered later for barn screens.

**Calendar vs Whiteboard**
| Calendar | Whiteboard |
| --- | --- |
| Date + time precise | Operational daily to-dos |
| Lessons, vet, farrier, shows, transport | Columns by person OR horse (toggle) |
| Week / day view, color-coded by type | Quick add · drag to reassign · statuses: pending / done / delayed / issue |
| | Style: whiteboard, not corporate SaaS |

**MyStable sub-tabs**
| Tab | Content |
| --- | --- |
| Horses | Cards with photo + stall + status. **Search mandatory** |
| Clients | List with photo + horse link. **Search mandatory** (up to 120 clients) |
| Team | Staff with role badges, active status |
| Partners | External providers + **emergency button** (1-tap call vet/farrier) + contact photos |

**Deep links**: `hopon://lesson/[id]` · `hopon://task/[id]` · `hopon://horse/[id]` · `hopon://barn/join/[code]` · `hopon://invoice/[id]`.

---

## 4. SUPABASE SCHEMA

Authoritative SQL: `supabase/migrations/20260513000000_initial_schema.sql` + follow-ups.

V1 tables: `profiles`, `barns`, `barn_memberships`, `barn_invites`, `horses`, `tasks`, `task_updates`, `lesson_types`, `lessons`, `calendar_events`, `payments`, `invoices`, `horse_updates`, `service_requests`, `notifications`, `barn_news`, `device_tokens`.

**Day 3 additions to schedule** (not yet migrated):
- `horse_owners` (M:N): primary owner + co-owners (read access) per horse
- `horse_medications` (daily supplements): auto-feed team to-dos
- `horse_treatments` (temporary, with validation workflow): requested by owner → validated by barn manager → assigned to team → confirmed by groom
- `prescriptions` (PDF/photo uploads): linked to treatment, archived indefinitely
- `news_post_tags` (@all, @team, @owners, @[custom group])
- `client_groups` (configurable: Competition · Beginners · Boarders)
- `next_due_reminders` (farrier, vaccine, vermifuge, osteo, physio, dentist) with urgency thresholds

V2/V3 stubs already in schema: `qr_codes`, `shows`, `contracts`, `voice_reports`.

**RLS on every table.** Helpers `is_barn_member(uuid)` and `has_barn_role(uuid, barn_role)` scope policies.

---

## 5. AUTH & ONBOARDING — Day 3 Simplified

**Auth**: Supabase magic link preferred + email/password fallback.

**Onboarding V1 — ultra-rapid**
- Single question: **role (professional vs amateur)**
- Groom can skip every setup section
- Direct app access after role selection
- QR code + unique link for client/team invitations
- **CSV support** for initial client import

**Post-onboarding progress bar 0/4 → 4/4 on homepage**:
1. Add your first team member
2. Add your first horse
3. Add your first client
4. Edit your lesson (default: 45 min · $100 · individual + collective)

"Don't show again" button for skip.

---

## 6. HOME SCREENS — Role Logic

Computed in `types/roles.ts → computeHomeVariant()`:

| Roles                                            | Home variant      |
| ------------------------------------------------ | ----------------- |
| `barn_owner` + (`trainer` or `pro_rider`)        | `owner_trainer`   |
| `barn_owner` or `barn_manager`                   | `owner`           |
| `trainer` or `pro_rider`                         | `trainer`         |
| `groom`                                          | `groom`           |
| `client` or `parent`                             | `client`          |

**Motivation per role** (Day 3 + Hippolyte feedback):
- **Owner** — money · team busy · alerts
- **Owner-Trainer** — money · lessons · team busy
- **Trainer** — bookings count today/week
- **Pro Rider** — horse performances · $ if owner
- **Groom** — tasks accomplished (Done count)
- **Amateur** — horse health · personal performance · barn news · pushed to book lessons/extras

**Client home structure** (Day 3 spec)
- Photo cheval centered
- Health icons strip (conditional on dues)
- Book a lesson CTA always visible
- Next lesson / Next show: rider-specific
- Upcoming service linked to horse (upsell potential)
- Barn feed at the bottom

---

## 7. HORSE PROFILE — Day 3 Structure

Header: `Name, age years, breed` — e.g. *"Tornado, 9 years, KWPN"*

Four tabs (was 3 before Day 3):

| Tab | Content |
| --- | --- |
| **Info** | Permanent data: stall, breed, age, feeding, medications, vet, farrier, owner(s) |
| **Activity** | Weekly Mon-Sun calendar · sessions: **lunge / flat / jump / rest / show** · today's to-dos if any |
| **Health** | Health icons + history + medications · upload prescriptions (PDF/photo) → auto-create treatment |
| **Feed** | Posts, photos, videos of the horse |

---

## 8. FEED / HOP NEWS — Day 3 Tagging System

- Tags: `@all` · `@team` · `@owners` · `@[custom-group]`
- Configurable groups: Competition · Beginners · Boarders · …
- Auto-generated posts from events (with validation option)
- Poll option on posts · manual photos + text
- **Feed retained over chat** for documentation and traceability

---

## 9. MEDICAL REMINDERS — Day 3 "Next Due"

Appears on home **3 weeks before due**.

| Icon | Type | Color logic |
| --- | --- | --- |
| 🐴 | Farrier | neutral (>2 weeks) → amber (<2 weeks) → terracotta (<3 days) |
| 💉 | Vaccine | same |
| 💊 | Vermifuge | same |
| 🦴 | Osteo | per-planning |
| 🏃 | Physio | per-planning |
| 🦷 | Dentist | per-planning |

Tappable → transforms into scheduled task with date picker.

- Vaccine/vermifuge: updating date hides the icon
- Osteo/physio: appear/disappear by planning

---

## 10. MEDICATIONS & SERVICES — Day 3 Workflows

**Daily medications (supplements)** — configured on horse card, auto-show in team to-dos.

**Temporary treatments (validation workflow)**:
1. Owner requests via app
2. Barn manager validates (or rejects with note)
3. After validation → to-do assigned to team
4. Groom confirms execution + optional photo
5. Owner receives notification of completion

**Prescriptions** — Upload PDF/photo in Health tab → auto-create treatment → archive on horse indefinitely.

**External services** — request system with validation before task assignment + **QR codes** for external providers (simplified access without account).

---

## 11. PAYMENTS — Day 3

- **1 primary owner per horse** (for billing)
- **Co-owners possible** (read access)
- Integrations: **Stripe · Zelle · Square** (depending on provider preference)
- Possibility of commissions on facilitated transactions
- US tax handled from V1 via Stripe

---

## 12. ROLES & PERMISSIONS — Day 3

| Role | Key permissions |
| --- | --- |
| **Clients** | No task assignment between clients · can request services |
| **Team** (groom, secretary) | Validate client requests · manage to-dos |
| **Barn Manager** | Validate treatments and services |
| **External providers** | Limited access via QR code for specific tasks |

---

## 13. V1 / V2 / V3 ROADMAP

**V1 — September 2026**
Booking · Employee/client listing · Advanced calendar · Task management · Horse page · Rider/Pro homepages · Access rights · Payments (Stripe + Apple Pay) · US tax · Notifications · Service requests · Lesson admin · Internal dashboard.

**V2 — December 2026**
QR code per box · Daily routine guidelines · Show scraper (WEF / Thermal / Hits Ocala — target 1 circuit) · Show map · Global private barn feed · Barn mapping (paddocks, arenas, stalls).

**V3 — 2027**
Contracts (boarding/leasing/sale) · Reminders · QuickBooks sync · Voice reports (self / trainers / extras).

**Out of scope V1-V3**: Marketplace · Horse sales · Half-lease · Airbnb-style boxes · Gamification · Inventory · Prospect CRM · New group training.

---

## 14. UX HARD RULES

1. **One glance. One action. Done.** Three menus or scroll-to-find = redesign.
2. **Zero-scroll home** for 80% of use cases.
3. **Compressed info** — `BELLA · MEDS · 12:00`, not "Medication for Bella at 12pm".
4. **3 visual levels** — NOW (huge) · TODAY (medium) · BACKGROUND (small).
5. **Urgency is subtle** — muted terracotta tint + 2px left bar + `!`. Never full red.
6. **Calmer than WhatsApp** — no aggressive animations, no red badges everywhere.
7. **Context-automatic** — the app knows the user's barn, horses, schedule, time.
8. **1-tap task updates** — swipe or tap, no form to fill.

---

## 15. PERFORMANCE & RELIABILITY

- Optimistic updates for task completion + lesson status.
- Basic offline: cache today's tasks + schedule in AsyncStorage; show "Last updated X min ago".
- Image upload: client-side compress to <1MB, Supabase Storage with `?width=400&quality=80` transforms.
- Realtime: task updates + barn feed via Supabase Realtime.
- Skeleton screens, never raw error codes.

---

## 16. BUILD ORDER (Day 3 revised)

1. Project scaffold ✅
2. Supabase schema + RLS ✅
3. Auth flow (magic link + email/password) ✅
4. Onboarding wizard ✅ → simplify per Day 3
5. Home screens (5 variants) ✅
6. Task management ✅ → reframe as Whiteboard tab
7. Calendar + booking ✅
8. Horse pages ✅ → add Activity + Health tabs (Day 3)
9. Payments ✅ → add Zelle + Square (Day 3)
10. Notifications ✅
11. Team & access rights ✅
12. Settings ✅
13. **MyStable consolidated tab** (Day 3)
14. **FAB "+" wheel menu** (Day 3)
15. **Feed tagging system + custom groups** (Day 3)
16. **Next Due medical reminders on home** (Day 3)
17. **Treatment validation workflow** (Day 3)
18. **Horse co-owners** (Day 3)
19. **i18n EN/FR/ES** (Day 3 architectural)
20. **0/4 onboarding progress bar on home** (Day 3)
21. **CSV client import** (Day 3)

---

## 17. TONE FOR CLAUDE CODE

> "Would a groom with muddy gloves, 3 seconds to spare, be able to do this in one tap?"

If the answer is no — simplify. The product should feel like **Linear meets Strava in a barn.** Premium, functional, no fluff.
