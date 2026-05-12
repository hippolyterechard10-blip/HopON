# HopOn — Claude Code Master Prompt

> Complete specification for building HopOn V1 production-ready app.
> Companion docs: `docs/wireframes.html`, `docs/sprint-day1-recap.pdf`, `docs/sprint-day2-recap.pdf`.

---

## 0. CONTEXT

HopOn is a **mobile-first equestrian barn management app** targeting high-performance US equestrian businesses (barns, trainers, grooms, clients). The app replaces WhatsApp chaos and spreadsheets with a calm, operational coordination layer.

- **Positioning** — "The operating system for high-performance equestrian businesses."
- **North Star** — 90% retention of target barns at 6 months.
- **Target market** — Ocala + Wellington, FL · US show season starting January 2027.
- **Design benchmarks** — Airbnb, Linear, Strava. Premium, calm, modern. Not gimmicky.

---

## 1. TECH STACK

**Mobile** — React Native + Expo (Managed Workflow), TypeScript strict, Expo Router v3, Expo SDK 51+.

**Backend** — Supabase (Auth, Postgres, Realtime, Storage, Edge Functions). RLS on every table.

**Payments** — Stripe React Native SDK (Apple Pay + Google Pay). Webhooks via Supabase Edge Functions.

**State** — TanStack Query (server), Zustand (UI), React Hook Form + Zod (forms).

**Notifications** — Expo Notifications (APNs + FCM).

**Tooling** — ESLint, Prettier, Husky, Detox (E2E scaffolded for V2).

---

## 2. PROJECT STRUCTURE

```
hopon/
├── app/                        # Expo Router file-based routes
│   ├── (auth)/                 # Welcome, sign-in, sign-up
│   ├── (onboarding)/           # Role select, barn setup/join, profile
│   └── (app)/                  # Authenticated shell (bottom tabs)
├── components/
│   ├── ui/                     # Design system primitives
│   ├── home/                   # Role-specific home widgets
│   ├── calendar/  tasks/  horses/  booking/  shared/
├── lib/                        # supabase, stripe, notifications, analytics
├── hooks/                      # useAuth, useBarn, useRole, useHorses, ...
├── stores/                     # Zustand: auth, barn, ui
├── types/                      # database.types (generated), app.types, roles
├── constants/                  # colors, typography, spacing
└── supabase/
    ├── migrations/             # SQL migrations
    ├── functions/              # Edge Functions (stripe-webhook, send-notification)
    └── seed.sql
```

---

## 3. DESIGN SYSTEM

See `constants/colors.ts`, `constants/typography.ts`, `constants/spacing.ts`.

**UX principles — enforce on every screen:**

1. **One glance. One action. Done.** Three menus or scroll-to-find = redesign.
2. **Zero-scroll home** for 80% of use cases.
3. **Compressed info** — `BELLA · MEDS · 12:00`, not "Medication for Bella at 12pm".
4. **3 visual levels** — NOW (huge) · TODAY (medium) · BACKGROUND (small).
5. **Urgency is subtle** — muted terracotta tint + 2px left bar + `!` character. Never full red.
6. **Calmer than WhatsApp** — no aggressive animations, no red badges everywhere.
7. **Context-automatic** — the app knows the user's barn, horses, schedule, time.
8. **1-tap task updates** — swipe or tap, no form to fill.

**Type:** DM Sans (body/UI) + DM Serif Display italic (hero headings). Loaded via `expo-font`.

---

## 4. SUPABASE SCHEMA

Authoritative SQL: `supabase/migrations/20260513000000_initial_schema.sql`.

Tables (V1): `profiles`, `barns`, `barn_memberships`, `horses`, `tasks`, `task_updates`, `lesson_types`, `lessons`, `calendar_events`, `payments`, `invoices`, `horse_updates`, `service_requests`, `notifications`, `barn_news`.

V2/V3 forward-compat stubs (§10): `qr_codes`, `shows`, `contracts`, `voice_reports`.

**RLS is enabled on every table.** Helpers `is_barn_member(uuid)` and `has_barn_role(uuid, barn_role)` scope policies. Financial data (`payments`, `invoices`) is restricted to barn owners + the parties involved.

---

## 5. AUTHENTICATION & ONBOARDING

1. **Welcome** — forest-green full screen, logo, "Get started" + "Sign in".
2. **Sign up** — Supabase magic link preferred (no password to forget at the barn).
3. **Onboarding wizard** (4 steps, progress indicator):
   - **Who are you?** — card-based role multi-select.
   - **Your barn** — Owner: create or join · Non-owner: join via name / invite code.
   - **Your profile** — name, photo (optional), phone (optional).
   - **Ready** — welcome screen, animated checkmark.

---

## 6. HOME SCREENS — ROLE LOGIC

Mapping implemented in `types/roles.ts → computeHomeVariant()`:

| Roles                                            | Home variant      |
| ------------------------------------------------ | ----------------- |
| `barn_owner` + (`trainer` or `pro_rider`)        | `owner_trainer`   |
| `barn_owner` or `barn_manager`                   | `owner`           |
| `trainer` or `pro_rider`                         | `trainer`         |
| `groom`                                          | `groom`           |
| `client` or `parent`                             | `client`          |

Each home variant's component composition is documented in `components/home/*` (lands in the next commit).

---

## 7. FEATURES (V1)

Booking · Advanced calendar · Task management · Horse page (Info/Feed/Planning) · Payments (Stripe Connect, Apple Pay) · Notifications (Expo + quiet hours) · Team & access rights · Service requests ("Partners", $1-or-not toggle per barn) · Internal onboarding dashboard.

Detail per feature lives in this file's full spec in conversation history — keep this section as the index, expand sections in feature PRs.

---

## 8. NAVIGATION

```
app/
├── (auth)/        # Unauthenticated stack
├── (onboarding)/  # Wizard, no tabs
└── (app)/         # Bottom tabs: Home · Calendar · Horses · Role-tab · Dashboard/More
```

**Deep links:** `hopon://lesson/[id]` · `hopon://task/[id]` · `hopon://horse/[id]` · `hopon://barn/join/[code]` · `hopon://invoice/[id]`.

---

## 9. PERFORMANCE & RELIABILITY

- Optimistic updates for task completion + lesson status.
- Basic offline: cache today's tasks + schedule in AsyncStorage; show "Last updated X min ago".
- Image upload: client-side compress to <1MB, Supabase Storage with `?width=400&quality=80` transforms.
- Realtime: task updates + barn feed via Supabase Realtime.
- Skeleton screens, never raw error codes.

---

## 10. V2/V3 ARCHITECTURAL READINESS

Already in schema as stubs: `qr_codes`, `shows`, `contracts`, `voice_reports`. `lesson_types.is_group` flag ready for group waitlist. Stripe Connect supports marketplace if ever needed.

---

## 11. BUILD ORDER

1. Project scaffold ✅
2. Supabase schema + RLS ✅
3. Auth flow (magic link + email/password)
4. Onboarding wizard
5. Home screens (5 variants)
6. Task management (groom flow first — most critical daily use)
7. Calendar + booking (trainer + client)
8. Horse pages (3 tabs)
9. Payments (Stripe, Apple Pay, invoices)
10. Notifications (push + in-app)
11. Team & access rights
12. Settings

---

## 12. TONE FOR CLAUDE CODE

> "Would a groom with muddy gloves, 3 seconds to spare, be able to do this in one tap?"

If the answer is no — simplify. The product should feel like **Linear meets Strava in a barn.** Premium, functional, no fluff.
