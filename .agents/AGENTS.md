# Meal Manager Workspace Guidelines & Rules

## Codebase Architecture
- **Framework**: Express.js with TypeScript & Zod validation.
- **ORM**: Prisma ORM with modular multi-file schemas in `prisma/schema/`.
- **Database**: PostgreSQL (hosted on Neon).
- **Module Structure**: Feature-based architecture under `src/modules/`:
  - `src/modules/<feature>/<feature>.constant.ts` (Searchable/filterable fields & module constants)
  - `src/modules/<feature>/<feature>.validation.ts` (Zod validation schemas)
  - `src/modules/<feature>/<feature>.interface.ts` (TypeScript types, DTOs & filter request types)
  - `src/modules/<feature>/<feature>.service.ts` (Business logic & Prisma DB operations)
  - `src/modules/<feature>/<feature>.controller.ts` (Request handlers & validation parsing)
  - `src/modules/<feature>/<feature>.route.ts` (Express router setup)
- **Centralized Routing**: All module routers MUST be registered in `src/routes/index.ts`.

## Code & Error Handling Rules
1. **Error Handling**: Throw custom AppErrors (`BadRequestError`, `NotFoundError`, `ForbiddenError`, `UnauthorizedError`) caught by centralized `error.middleware.ts`.
2. **Environment Variables**: Always import validated environment variables from `src/config/env.ts` instead of directly accessing `process.env`.
3. **Prisma Schemas**: When adding/modifying models, add a dedicated `<model_name>.prisma` file inside `prisma/schema/` directory and ensure enums are updated in `prisma/schema/enums.prisma`.
