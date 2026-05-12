# HopOn

> The operating system for high-performance equestrian businesses.

HopOn turns the daily chaos of a professional stable — lessons, payments, grooms, vets, shows — into one calm, shared plan. US-first (Ocala + Wellington), targeting the winter 2027 show season.

## North Star

**90% retention of target barns at 6 months.**

| Metric | Target |
| --- | --- |
| Self-onboarding | 5 target barns that self-onboard |
| Activation rate | % who complete onboarding |
| Blocking bugs | Resolution < 2 days |
| Non-blocking bugs | Resolution < 1 week |

## Personas

- **Professionals** — Pro riders, trainers (single/multi-location), barn managers, grooms, secretaries.
- **Amateurs** — Non-owners, owners with 1 horse, parents (booking for minors).
- **Barn owner** — Pays a boarding/program for their horse.
- **External providers** — Farriers (priority), emergency vets, physios, dentists, braiders.

Two distinct home views: **Pro/Owner** (revenue, lessons MTD, team overview) and **Groom/Rider/Trainer** (next up, my to-do, news).

## V1 — September 2026

Booking (Doctolib-style) · Employee/client listing · Advanced calendar · Task management · Horse page · Rider homepage · Pro homepage · Access rights · Payments (Stripe + Apple Pay) · US tax · Notifications · Service requests · Lesson admin · Internal dashboard.

V2 (Dec 2026): QR per box, daily routines, show scraper (WEF/Thermal/Hits Ocala), show map, private barn feed, barn mapping.

V3 (2027): Contracts, reminders, QuickBooks, voice reports.

## Brand

- **Personality** — Lululemon energy · intentional · 80% serious / 20% friendly. References: Strava (habits), MindBody (vertical), Doctolib (trust), Uber (just works), Airbnb (elegant two-sided).
- **Forbidden** — Not the Facebook of horses · no cluttered UI · not low-cost · not slow.
- **Palette** — Green teal direction. `#F0FDF4` `#3BAEA4` `#B3FFC1`.
- **Type** — Calibre (sans) + a serif for editorial moments.
- **Logo** — Built around the H; H and second O capitalized → **HopOn**.

## Stack

- **Framework** — Next.js 15 (App Router) + React 19 + TypeScript
- **Styling** — Tailwind CSS with HopOn brand tokens (see `tailwind.config.ts`)
- **Auth/DB/Payments (planned)** — NextAuth + Prisma/Postgres + Stripe
- **Icons** — lucide-react

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — Next.js ESLint
- `npm run typecheck` — TypeScript check
- `npm run format` — Prettier (with Tailwind class sorting)

## Repo layout

```
src/
  app/                # Next.js App Router (routes, layouts, pages)
    globals.css       # Tailwind layers + brand component classes
    layout.tsx        # Root layout + metadata
    page.tsx          # Landing page
```

More directories will land as features grow: `src/components/`, `src/lib/`, `src/server/`, `prisma/`.
