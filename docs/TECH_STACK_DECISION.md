# Tech Stack Decision

## Why this doc exists

The uploaded spec (`Meal_Manager_Spec_v2.docx`) actually contains **two
different, conflicting stack proposals** pasted one after another:

| | Stack A (original spec, §9–10) | Stack B (pasted addendum) |
|---|---|---|
| Frontend framework | React + Vite | Next.js (App Router) |
| Styling | Tailwind + shadcn/ui | Tailwind + shadcn/ui |
| Auth | Custom JWT + bcrypt (PIN-based, per §5 "doesn't need enterprise auth") | Clerk + BetterAuth |
| Email | — | Resend |
| State | React hooks / context | Zustand |
| Backend | Node/Express, feature-based modules | Node/Express, feature-based modules (same) |
| ORM/DB | Prisma + PostgreSQL | Prisma + PostgreSQL (same) |

Stack A and Stack B can't both be "the" frontend — a Vite SPA and a
Next.js App Router project are structurally different (routing, env var
prefixes, `pages/` vs `app/`, no Next API routes vs optional ones), and
Clerk directly contradicts the PRD's own §5, which explicitly says a
simple PIN-based login is enough and this app "doesn't need enterprise
auth."

## Decision: go with Stack A

This repo scaffolds **Stack A** (Vite + React + Express + custom
JWT/PIN auth) because:

1. It matches what the PRD itself specifies for auth (§5).
2. It's simpler and cheaper to run for a 5–15 person household app —
   Clerk/BetterAuth/Resend add signup cost and complexity this app
   doesn't need.
3. It was the original, deliberate design (§9a/§9b) rather than a
   later pasted suggestion.

## If you'd rather use Stack B

If Next.js + Clerk is actually the direction you want (e.g. you like
Clerk's UI for auth, or you're more comfortable with Next.js), that's a
reasonable alternative — just know it changes:

- `frontend/src/pages/*` → `frontend/app/**/page.tsx`
- `.env` → `.env.local`, and env vars need the `NEXT_PUBLIC_` prefix
  instead of `VITE_`
- Auth module in the backend becomes optional/thinner, since Clerk
  handles session management — you'd mainly still need `role.middleware.ts`
  to gate manager-only routes
- Add `RESEND_API_KEY` if you want email notifications (not in the
  original PRD scope — would be a new feature, e.g. "email me when the
  period closes")

Tell me if you want a second scaffold built for Stack B and I'll generate
it separately, so the two don't get mixed in one folder again.
