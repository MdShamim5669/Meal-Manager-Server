---
name: backend-module-generator
description: Generate feature-based Express backend modules including route, controller, service, and interface files following project conventions.
---

# Backend Module Generator Skill

Use this skill when scaffolding a new feature module in `src/modules/<feature_name>/`.

## Module Directory Pattern
Each module should contain:
- `src/modules/<feature>/<feature>.interface.ts`: Data types and DTO definitions.
- `src/modules/<feature>/<feature>.service.ts`: Business logic and Prisma DB operations.
- `src/modules/<feature>/<feature>.controller.ts`: Request/response handling and Zod validation.
- `src/modules/<feature>/<feature>.route.ts`: Express router setup.

## Steps
1. Create directory `src/modules/<feature>/`.
2. Define request validation schemas (Zod) and TypeScript types in `<feature>.interface.ts`.
3. Implement DB query logic using `prisma` client in `<feature>.service.ts`.
4. Wrap async controller methods with try/catch or async handler in `<feature>.controller.ts`.
5. Export router in `<feature>.route.ts`.
6. Import and register the new module router in `src/routes/index.ts`.
