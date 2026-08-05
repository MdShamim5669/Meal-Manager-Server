# API Spec & Backend Task Checklist

Base URL: `VITE_API_BASE_URL` (frontend) / served by Express (backend),
mounted under `/api`.

## Auth (`modules/auth/`)
- [ ] `POST /auth/setup` — create household + first Manager
- [ ] `POST /auth/login` — member picks name + PIN, returns a JWT
- [ ] `auth.service.ts` — PIN hashing/verification (`utils/hash.util.ts`)
      and JWT issuing (`utils/jwt.util.ts`)
- [ ] `middlewares/auth.middleware.ts` — verify JWT on every protected
      route, attach `req.user`
- [ ] `middlewares/role.middleware.ts` — `requireManager` blocks the
      route unless `req.user.role === 'manager'`

## Members (`modules/member/`)
- [ ] `GET /members` — list all (any logged-in user)
- [ ] `POST /members` — add member (manager only)
- [ ] `PATCH /members/:id` — edit role/active status (manager only)

## Meals (`modules/meal/`)
- [ ] `GET /meals?periodId=` — list meal entries for the current period
- [ ] `PUT /meals/:memberId/:date` — set a meal count for one member/day
  - Enforce: a Member can only write to their own `memberId`; a Manager
    can write to any
  - Enforce: reject writes if the period is closed

## Expenses (`modules/expense/`)
- [ ] `GET /expenses?periodId=` — list expenses
- [ ] `POST /expenses` — add (manager only)
- [ ] `PATCH /expenses/:id` / `DELETE /expenses/:id` — edit/delete
      (manager only)

## Deposits (`modules/deposit/`)
- [ ] `GET /deposits?periodId=` — list deposits
- [ ] `POST /deposits` — add (manager only)

## Duty roster (`modules/roster/`)
- [ ] `GET /roster?periodId=`
- [ ] `PATCH /roster/:id` — mark done (member can mark only their own;
      manager can mark/reassign any)

## Calculations & period lifecycle (`modules/period/`)
- [ ] `period.service.ts` — pure functions: `mealRate()`,
      `individualCost()`, `balance()`, `settlementOptimizer()` (reads
      from meal/expense/deposit services, doesn't duplicate their data
      access)
- [ ] Unit tests for these functions specifically, with edge cases: zero
      meals, zero expense, uneven deposits
- [ ] `GET /period/dashboard?periodId=` — returns everything the
      dashboard needs already computed, so the frontend isn't
      recalculating on the client
- [ ] `POST /period/close` — manager only: locks current period,
      snapshots final balances, opens a new period
- [ ] `GET /period` — list past periods for the History screen
- [ ] `GET /period/:id` — read-only detail of a closed period

## Cross-cutting
- [ ] Centralized error-handling middleware (consistent error response
      shape)
- [ ] Input validation with Zod on every POST/PATCH body
- [ ] CORS configured to only allow the frontend's deployed domain
- [ ] Environment variables for `DATABASE_URL`, `JWT_SECRET`,
      `CORS_ORIGIN`, `PORT`

## Setup checklist
- [ ] Initialize Node + TypeScript project, install Express, Prisma, Zod,
      bcrypt, jsonwebtoken
- [ ] `modules/` folder with `auth/`, `member/`, `meal/`, `expense/`,
      `deposit/`, `roster/`, `period/` subfolders, each with
      `.route.ts`, `.controller.ts`, `.service.ts`, `.model.ts`,
      `.interface.ts`
- [ ] Prisma models for: Member, Period, MealEntry, Expense, Deposit,
      DutyRoster
- [ ] Run first migration, confirm tables exist in the database
- [ ] `app.ts` mounts each module's route file; `server.ts` just starts
      the server

### Why `period` holds the calculation logic
Meal rate, balances, and the settlement optimizer all need data from
meals + expenses + deposits together, scoped to one period. Rather than
duplicating that logic in the meal/expense/deposit modules,
`period.service.ts` reads from the other modules' services and does the
math in one place. Each other module stays focused on just its own CRUD.
