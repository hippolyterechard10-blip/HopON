# HopOn

> The operating system for riding barns.

Mobile-first React Native app for US riding barns of every level — local riding clubs through to professional show barns. Replaces the WhatsApp + spreadsheet chaos with a calm, role-aware coordination layer. US-first (Ocala + Wellington as the beachhead), targeting the **January 2027** show season.

**North Star:** 90% retention of target barns at 6 months.

Full spec: [`CLAUDE.md`](./CLAUDE.md). Sprint outputs and wireframes: [`docs/`](./docs). Static design preview: open [`docs/preview.html`](./docs/preview.html) in any browser.

---

## What's built

| Wave | Scope |
| --- | --- |
| 1 | Expo + TypeScript + Supabase scaffold; brand tokens; design primitives |
| 2 | Supabase migration: full V1 schema + RLS on every table + V2/V3 stubs |
| 3 | Five role-adaptive home screens, onboarding role-select, calendar day view, booking flow, horse detail (3 tabs) |
| 4 | Real auth (magic link + password), onboarding wizard end-to-end, root routing |
| 5 | Mock data deleted; every home + horses + calendar hydrated from Supabase via TanStack Query |
| 6 | Task management: list, detail with history, create, photo upload; horse Feed + Planning tabs; team list; settings stub |
| 7 | Stripe payments: Edge Functions for `stripe-create-payment-intent` + `stripe-webhook`; booking flow runs PaymentSheet end-to-end |
| 8 | Push notifications: device-token registration, in-app activity center, `send-notification` Edge Function respecting quiet hours |
| 9 | Barn invites (codes + share), team / barn / profile settings |
| 10 | Lesson detail page with status mutations; Owner financial dashboard |
| 11 | Invoices list, storage RLS policies, lesson tap-throughs from home + calendar; horse photo upload |

---

## Stack

- **Mobile** — React Native + Expo Router v3, Expo SDK 51, TypeScript strict
- **Backend** — Supabase (Auth · Postgres · Realtime · Storage · Edge Functions). RLS on every table.
- **Payments** — Stripe React Native SDK + Apple/Google Pay via PaymentSheet, Stripe Connect for barns
- **State** — TanStack Query (server) · Zustand (auth/barn/ui) · React Hook Form + Zod (forms)
- **Notifications** — Expo Notifications (APNs + FCM) with quiet hours

---

## Repo layout

```
app/                Expo Router routes
  (auth)/             welcome · sign-in · sign-up · check-email
  (onboarding)/       role-select · barn-setup · barn-create · barn-join · profile · ready
  (app)/              bottom tabs: Home · Calendar · Horses · Tasks · More
    horses/[id]       photo + Info/Feed/Planning tabs
    tasks/            list · [id] detail · new
    lessons/[id]      lesson detail with status actions
    booking           Stripe PaymentSheet checkout
    dashboard         Owner financial dashboard
    invoices/         receivables list
    notifications     in-app activity center
    settings/         team · barn · profile

components/
  home/               OwnerHome · TrainerHome · OwnerTrainerHome · GroomHome · ClientHome
  ui/                 Text · Card · Button · Tag · StatusDot · AlertBar · Input · Skeleton · EmptyState

hooks/                useAuth · useRole · useMemberships · useTodayLessons · useTodayTasks
                     · useHorses · useHorse · useBarnMetrics · useBarnNews · useBarnMembers
                     · useTask · useLesson · useLessonTypes · useAvailableSlots · useBookLesson
                     · useInvites · useInvoices · useNotifications · useRecentPayments
                     · useHorseFeed · useHorsePlanning · useUpcomingForClient

lib/                  supabase · auth · queryClient · stripe · notifications · storage · dateRange
stores/               authStore · barnStore · uiStore · onboardingStore
types/                roles · app.types · database.types
constants/            colors · typography · spacing
supabase/
  migrations/         schema + RLS + notifications + storage policies
  functions/          stripe-create-payment-intent · stripe-webhook · send-notification
  seed.sql            local dev seed
docs/                 CLAUDE master prompt, sprint recaps, wireframes, design-system.md, preview.html
```

---

## Getting started

```bash
# 1. Install
npm install

# 2. Env
cp .env.example .env.local
# fill in EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY
# + EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY for Stripe

# 3. Local Supabase (optional — or point at a cloud project)
supabase start
supabase db reset            # applies all migrations + seed

# 4. Run the app
npm run start                # then i / a / w for iOS / Android / web
```

Scan the Expo Go QR code with your phone to load the build, or press `i`/`a` for a simulator.

### Generated DB types

After schema changes, regenerate the typed client surface:

```bash
npm run db:types
```

### Edge Functions

```bash
# Stripe
supabase functions deploy stripe-create-payment-intent
supabase functions deploy stripe-webhook --no-verify-jwt
supabase secrets set \
  STRIPE_SECRET_KEY=sk_... \
  STRIPE_WEBHOOK_SECRET=whsec_...

# Push
supabase functions deploy send-notification
```

### Storage buckets

Create the three buckets before applying the storage policy migration:

```bash
supabase storage create-bucket horse-photos --public
supabase storage create-bucket task-photos
supabase storage create-bucket avatars --public
```

---

## Design

Forest green primary, muted ok/warn/alert signals — **never alarming**, never full red. Type pairs DM Sans (UI) with DM Serif Display italic (heros). Tokens live in `constants/colors.ts` and `constants/typography.ts`.

Static visual preview that mirrors the app screens: [`docs/preview.html`](./docs/preview.html).

> "Would a groom with muddy gloves, 3 seconds to spare, be able to do this in one tap?"

---

## What's next (optional polish before pilot)

- Real lesson scheduling beyond MVP slots (trainer working hours, arena capacity)
- Auto-generated invoices on lesson completion
- WhatsApp API integration to read inbound messages (V1 sprint decision)
- Horse update composer + photo grid
- Onboarding internal admin dashboard for the HopOn team
- Detox E2E for the groom critical path
