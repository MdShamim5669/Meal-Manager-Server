# Meal Manager — Product Requirements Document

## 1. App summary

A web app for a shared house/mess/hostel to track daily meals, shared
expenses, and member deposits, and automatically calculate who owes money
and who's owed money at the end of each month. Replaces a manual Google
Sheet.

**Primary users:** a small group (5–15 people) sharing meals and costs.
One person acts as **Manager** (adds expenses, marks meals, closes the
month); everyone else can view their own numbers and log their own daily
meals.

Support both English and Bangla labels for money/meal terms where natural
(e.g. "Meal rate (মিল রেট)").

## 2. Core data model

See `docs/DATA_MODEL.md` for the full field list and ER diagram. Entities:
**Member, MealEntry, Expense, Deposit, DutyRoster, Period.**

## 3. Core calculations

- `meal_rate = total_expense_in_period / total_meals_in_period`
- `individual_cost(member) = meal_rate * member.total_meals_in_period`
- `balance(member) = member.total_deposit_in_period - individual_cost(member)`
  - Positive balance = the member is owed money (show in **green**)
  - Negative balance = the member owes money (show in **red**)
- **Settlement optimizer** (nice-to-have): given all balances, compute the
  minimum set of person-to-person transfers to settle the month (classic
  debt-simplification: match largest creditor with largest debtor
  repeatedly).

## 4. Pages / screens

### Dashboard (home)
- Current period summary cards: total meals, meal rate, total expense,
  total deposit
- Member balance table (name, meals, deposit, balance — color coded
  green/red)
- "Today's market duty" card showing who's scheduled, with a mark-done
  action
- Comparison to last period's meal rate (small trend indicator)

### Daily meals
- Calendar-style grid: rows = members, columns = days of the current month
- Tap a cell to enter meal count for that member/day (supports 0, 0.5, 1,
  2...)
- Running total column per member

### Expenses
- Two tabs: Market expenses / Utility expenses
- List view: date, description, paid by, amount
- Add expense form: date, category, amount, paid by, description, optional
  photo
- Running total per category and combined total

### Deposits
- List view: date, member, amount
- Add deposit form
- Running total per member and combined total

### Duty roster
- Simple rotating schedule (auto-suggest next person, manager can
  override)
- Mark days done/missed
- History of past duty days

### Member management (manager only)
- Add/remove/deactivate members
- Assign manager role

### Period history
- List of closed months
- Click into any past month to see its final numbers (read-only)
- Small chart comparing meal rate across months over time

## 5. Roles & permissions

- **Manager:** full access — add expenses/deposits, manage members, close
  the period, edit anyone's meal entries
- **Member:** can log their own daily meals, view dashboard, view their
  own balance and history; cannot edit expenses/deposits or other
  members' data

For v1, a simple shared login or per-member PIN is enough — this doesn't
need enterprise auth.

## 6. Design direction

- Clean, flat, minimal — no heavy gradients or decoration; this is a
  utility app people will check daily on their phones
- Mobile-first responsive layout (single column on mobile, dashboard grid
  on desktop)
- Color use should be functional, not decorative: green = owed money, red
  = owes money, neutral grays/blues for everything else
- Metric cards for key numbers (meal count, meal rate, total expense,
  total deposit) at the top of the dashboard
- Tables for line-item data (expenses, deposits, balances)
- Bangla text should render correctly (use a font that supports Bengali
  script, e.g. Noto Sans Bengali, alongside the Latin UI font)

## 7. Suggested build order

1. Member management + auth (simple)
2. Daily meal entry grid
3. Expense + deposit logging
4. Dashboard with live calculations
5. Duty roster
6. Period close/archive + history view
7. Settlement optimizer (stretch goal)

## 8. Known issues from the current spreadsheet to explicitly avoid

- Don't let empty/unused rows produce error states in calculations —
  default missing values to 0
- Store expense line items as structured rows, not concatenated text
  strings
- Store deposits as a transaction log (member, date, amount), not one
  column per date
- Make "duty done/not done" a proper status field with a timestamp, not a
  free-text dropdown

## 9. Non-goals for v1

- Enterprise-grade auth (OAuth providers, SSO, MFA)
- Multi-household support (each deployment serves one household)
- Push notifications
