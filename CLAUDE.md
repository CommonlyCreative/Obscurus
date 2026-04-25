@AGENTS.md

# Obscurus — Deadlock Scrimmage Platform

A competitive scrimmage organizer for the game Deadlock. Players connect via Discord, form 6-player teams, and host/join matches against other teams.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Data | MongoDB (`lib/database/mongo.ts`), Grafbase (`lib/database/grafbase.ts`) |
| API | Apollo Server 5 + GraphQL (`app/api/graphql/`) |
| Realtime | Socket.io (`server.mts`) |
| Auth | Discord OAuth |

---

## Deadlock domain — always use `lib/deadlock.ts`

Do not invent rank names. The real ranks are the `Rank` enum:

```ts
Rank.INITIATE | SEEKER | ALCHEMIST | ARCHANIST | RITUALIST |
EMISSARY | ARCHON | ORACLE | PHANTOM | ASCENDANT | ETERNUS
```

Use `calculateMMR(rank, division)` to compute MMR values.

Heroes are on the `Hero` object (e.g. `Hero.INFERNUS`, `Hero.YAMATO`). Do not hardcode hero names as strings when `lib/deadlock.ts` has the canonical list.

---

## Utilities — use these, do not re-implement them

- **`cn(...classes)`** from `lib/utils.ts` — merges Tailwind classes with clsx + tailwind-merge. Use this for all conditional class names instead of string concatenation.
- **`formatTimeAgo(date)`** from `lib/utils.ts` — formats a date as a relative string ("2h ago").
- **`constructURL(path?)`** from `lib/utils.ts` — builds absolute URLs from `NEXT_PUBLIC_PROD_URL`.

---

## Tailwind v4

Configuration lives **entirely in CSS**, not in `tailwind.config.ts`. The config file is not loaded.

All custom tokens are defined via `@theme inline` in `app/globals.css`:

| Token | Value | Class examples |
|---|---|---|
| `--color-primary` | `#e8bc87` (amber) | `bg-primary`, `text-primary`, `border-primary` |
| `--color-primary-dim` | `#c49a68` | `hover:bg-primary-dim` |
| `--color-secondary` | `#a5715f` (copper) | `bg-secondary` |
| `--color-surface` | `#1a1a1a` | `bg-surface` |
| `--color-surface-2` | `#222222` | `bg-surface-2` |
| `--color-edge` | `#2c2c2c` | `border-edge`, `divide-edge` |
| `--color-muted` | `#6b6b6b` | `text-muted` |
| `--color-dimmed` | `#9a9a9a` | `text-dimmed` |
| `--color-success` | `#4ade80` | `text-success` |
| `--color-danger` | `#f87171` | `text-danger` |
| `--color-discord` | `#5865f2` | `bg-discord` |

**Use canonical Tailwind v4 class names.** The IDE lints arbitrary values that have canonical equivalents:
- `w-[600px]` → `w-150` (1 unit = 4 px)
- `max-w-[400px]` → `max-w-100`
- `border-primary/[0.06]` → `border-primary/6`

**New tokens go in `app/globals.css` inside `@theme inline`** — never in `tailwind.config.ts`.

---

## Component organization

```
components/
  shared/       # Used across 2+ pages
  home/         # Only used on the home page
  profile/      # Only used on the profile page
  scrims/       # Only used on the scrims page
  Navbar.tsx    # Top-level, used in layout
```

When creating a component, ask: does it belong to one page only, or will it be reused? Place it accordingly. If a component moves to a second page, promote it to `shared/`.

---

## `"use client"` placement

Only add `"use client"` to the file that **directly uses** hooks or event handlers — never to page files unless the page itself has state. Components with `useState`/`useEffect` should be self-contained client components, allowing page files to remain server components.

---

## TypeScript

- Do not use `any`. Use proper types, generics, or `unknown`.
- Export interfaces from the component file that owns the data shape (e.g. `ProfileHeader.tsx` exports `Player`).
- Shared types for a feature area go in a `types.ts` within that component folder (e.g. `components/scrims/types.ts`).
- Next.js 16: `params` and `searchParams` page props are **Promises** — always `await` them or unwrap with `use()`.

---

## Mock data

All pages currently use mock data. Mock data lives in the **page file** (`app/*/page.tsx`) and is passed as props to components — not hardcoded inside components. When real data is wired up, the substitution should only touch the page file.

Exception: `MatchHistoryPanel` currently holds its own mock data — this is a known placeholder.

---

## Planned features

### Looking for Substitute (LFS) page
A dedicated page where managers of scheduled scrimmages can post open roster slots
and players can apply to fill them. Key behaviours:

- **Post**: A manager who has a `SCHEDULING` or `SCHEDULED` scrimmage with an open slot
  creates a `SubstituteRequest` (see `graphs/ai/scrimmage.graphql`).
- **Browse**: Any player can view open requests, filtered by status/org/match date.
- **Apply**: Players submit a `SubApplicant` with an optional message; they do **not** need
  to be members of the org.
- **Select**: The manager reviews applicants and calls `selectSubstitute`, which wires the
  chosen player into the roster and closes the request.
- Component home: `components/scrims/` (scrim-specific); the browse page lives at a
  route like `app/substitute/page.tsx`.
