# HopOn

> The operating system for high-performance equestrian businesses.

Mobile-first React Native app for professional US barns. Replaces the WhatsApp + spreadsheet chaos with a calm, role-aware coordination layer. US-first (Ocala + Wellington), targeting the **January 2027** show season.

**North Star:** 90% retention of target barns at 6 months.

## Stack

- **Mobile** — React Native + Expo (managed) · TypeScript strict · Expo Router v3
- **Backend** — Supabase (Auth · Postgres · Realtime · Storage · Edge Functions) with RLS on every table
- **Payments** — Stripe React Native SDK + Apple Pay / Google Pay (Stripe Connect for barns)
- **State** — TanStack Query (server) · Zustand (UI) · React Hook Form + Zod (forms)
- **Notifications** — Expo Notifications (APNs + FCM)

See [`CLAUDE.md`](./CLAUDE.md) for the full V1 spec, and [`docs/`](./docs) for sprint outputs.

## Project layout

```
app/                Expo Router routes (auth · onboarding · app tabs)
components/ui/      Design system primitives (Text, Card, Button, Tag, AlertBar, ...)
components/home/    Role-specific home widgets (Owner, Trainer, Groom, Client, OwnerTrainer)
constants/          colors · typography · spacing tokens
hooks/              useAuth, useRole, ...
lib/                supabase client, queryClient
stores/             Zustand stores (auth, barn, ui)
types/              roles + app + database types
supabase/
  migrations/       SQL migrations (V1 schema + RLS)
  seed.sql          Local dev seed
docs/               Sprint recaps + wireframes
```

## Getting started

```bash
# 1. Install deps
npm install

# 2. Wire up env
cp .env.example .env.local
# Fill in EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY

# 3. (Local Supabase) Start the stack and apply migrations
supabase start
supabase db reset           # applies migrations + seed

# 4. Run the app
npm run start               # then i / a / w for iOS / Android / Web
```

Generate Supabase types after schema changes:

```bash
npm run db:types            # writes types/database.types.ts
```

## Build order

Tracked in `CLAUDE.md §11`:

1. **Project scaffold** ✅
2. **Supabase schema + RLS** ✅
3. Auth flow (magic link + email/password)
4. Onboarding wizard
5. Role-adaptive home screens
6. Task management (groom flow first)
7. Calendar + booking
8. Horse pages
9. Payments
10. Notifications
11. Team & access rights
12. Settings

## Design north stars

- One glance, one action.
- Zero-scroll home for 80% of use cases.
- Compressed copy (`BELLA · MEDS · 12:00`).
- Urgent = muted terracotta + 2px left bar. **Never** full red.
- Calmer than WhatsApp.

> "Would a groom with muddy gloves, 3 seconds to spare, be able to do this in one tap?"
