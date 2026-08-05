# Data Model

## Entities

### Member
- `id`, `name`, `role` (manager | member), `active` (bool), `joined_date`

### MealEntry
- `id`, `member_id`, `date`, `meal_count` (decimal, supports 0.5 steps),
  `period_id`

### Expense
- `id`, `date`, `category` (market | utility), `amount`, `paid_by`
  (member_id), `description`, `receipt_photo` (optional), `period_id`

### Deposit
- `id`, `member_id`, `date`, `amount`, `period_id`

### DutyRoster
- `id`, `member_id`, `date`, `status` (scheduled | done | missed),
  `period_id`

### Period
A "month" that gets closed and archived.
- `id`, `label` (e.g. "July 2026"), `start_date`, `end_date`, `status`
  (active | closed)
- Computed on close: `total_meals`, `total_expense`, `meal_rate`,
  per-member balances

## Relationships

- A `Household` has many `Member`s and many `Period`s.
- Each `Period` contains `MealEntry`, `Expense`, `Deposit`, and
  `DutyRoster` rows, all scoped by `period_id`.
- `MealEntry`, `Expense` (via `paid_by`), `Deposit`, and `DutyRoster` all
  belong to a `Member`.

(See the ER diagram exported from the original spec for the visual
version of this — household → member/period → meal_entry/expense/
deposit/duty_roster.)

## Prisma schema (source of truth for the backend)

The canonical schema lives at `backend/prisma/schema.prisma`. Summary:

```prisma
model Member {
  id        String   @id @default(uuid())
  name      String
  pin       String
  role      Role     @default(MEMBER)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  meals     MealEntry[]
  expenses  Expense[]
  deposits  Deposit[]
}

model MealEntry {
  id        String   @id @default(uuid())
  memberId  String
  date      DateTime
  mealCount Float
  periodId  String
  member    Member   @relation(fields: [memberId], references: [id])
}

model Expense {
  id          String   @id @default(uuid())
  amount      Float
  category    String
  date        DateTime
  paidBy      String
  periodId    String
  description String?
  member      Member   @relation(fields: [paidBy], references: [id])
}

model Deposit {
  id       String   @id @default(uuid())
  memberId String
  amount   Float
  date     DateTime
  periodId String
  member   Member   @relation(fields: [memberId], references: [id])
}

model Period {
  id        String   @id @default(uuid())
  label     String
  startDate DateTime
  endDate   DateTime
  status    String   @default("active")
}

enum Role {
  MANAGER
  MEMBER
}
```

> **Note:** the source spec's Prisma sketch omitted `DutyRoster` and
> `description` on `Expense`, and didn't scope `Member` to a household.
> Both are added here since the PRD explicitly requires a duty roster
> screen, an expense description field, and (per the ER diagram in the
> original file) a `Household` parent entity. See
> `backend/prisma/schema.prisma` for the corrected, complete version.
