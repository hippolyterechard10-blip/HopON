# HopOn Design System

Source of truth: `constants/colors.ts`, `constants/typography.ts`, `constants/spacing.ts`.

## Colors — Eucalyptus (locked Day 3 sprint · May 13, 2026)

Eucalyptus green primary. Lululemon reference. Muted status signals — **never alarming**, never full red.

| Token        | Hex       | Role                                                |
| ------------ | --------- | --------------------------------------------------- |
| `g900`       | `#0B2F23` | Welcome screen background · darkest shade          |
| `g800`       | `#114836` | Deep headers (groom dark zone)                      |
| `g700`       | `#18604F` | Dark hero cards (trainer / owner-trainer)           |
| `g600`       | `#207A66` | Brand text · links                                  |
| `g500`       | `#2A957F` | **Anchor · Primary CTA · brand fill**               |
| `g400`       | `#36B399` | —                                                   |
| `g300`       | `#5CC0A4` | Dots · mid accents                                  |
| `g200`       | `#95CDBA` | Light accents · avatars                             |
| `g100`       | `#D6EFE1` | Brand tag background                                |
| `g50`        | `#ECFBF6` | Very light background · tints                       |
| `bg`         | `#F3F5F3` | App background                                      |
| `surface`    | `#FFFFFF` | Cards                                               |
| `ink1` → `ink3` | `#181D18` → `#8A908A` | Text levels                              |
| `ok` / `warn` / `alert` | green / amber / terracotta — muted, with matching `*Bg` and `*Dot` companions |

**Why Eucalyptus** (Day 3): Optimal compromise — universal, works on every UI element. Mint = "too girly" for the masculine target. Teal = goes out of style. Jade = flat on buttons. Cypress = too dark, less modern.

**Usage rule**: moderate use — primary CTAs only. The rest stays in ink/surface/border neutrals.

## Typography

- **Body / UI:** DM Sans (400 / 500 / 600)
- **Hero:** DM Serif Display Italic
- **Scale:** 8 · 9 · 10 · 11 · 12 · 14 · 16 · 18 · 24 · 32 · 40 px
- **Letter spacing:** `-0.3` to `-0.5` on large headings; `+1.2` on `eyebrow`.
- **Compressed variant** for `HORSE · TYPE · TIME` rows (medium-weight, +0.4 tracking).

## Spacing

`2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56` — referenced as `spacing.xxs`…`spacing["4xl"]`.

## Radii

`4 · 8 · 12 · 16 · 20 · 9999 (full)`.

## Shadows

Two presets: `soft` (cards), `raised` (sheets / modals). Color tinted to `#0B2F23` for eucalyptus-tinged elevation.

## Components

Implemented in `components/ui/`:

- `Text` — variant-driven typographic primitive
- `Card` — `default | elevated | dark`, configurable padding
- `Button` — `primary | secondary | ghost | destructive`, three sizes
- `Tag` — `neutral | ok | warn | alert | brand`
- `StatusDot` — 6 / 8 / 10 px green-amber-terracotta-neutral dot
- `AlertBar` — left-bar accent row (never full red background)
- `Input` — labeled input with focus / error / helper states
- `Skeleton` — animated loading placeholder
- `EmptyState` — first-time-empty placeholder card

## UX hard rules

1. One glance, one action.
2. Zero-scroll home for 80% of use cases.
3. Compressed copy (`BELLA · MEDS · 12:00`).
4. Three visual levels: NOW · TODAY · BACKGROUND.
5. Urgent = muted terracotta tint + 2px left bar + `!`. **Never** a full red background.
6. Calmer than WhatsApp.
7. Context-automatic.
8. 1-tap updates — swipe or tap.
