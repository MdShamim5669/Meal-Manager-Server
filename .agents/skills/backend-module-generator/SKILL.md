---
name: backend-module-generator
description: Generate feature-based Express backend modules including route, controller, service, validation, and interface files following project conventions.
---

# Backend Module Generator Skill

Use this skill when scaffolding a new feature module in `src/modules/<feature_name>/`.

## Module Directory Pattern
Each module should contain:
- `src/modules/<feature>/<feature>.validation.ts`: Zod validation schemas.
- `src/modules/<feature>/<feature>.interface.ts`: Data types and DTO definitions.
- `src/modules/<feature>/<feature>.service.ts`: Business logic and Prisma DB operations.
- `src/modules/<feature>/<feature>.controller.ts`: Request/response handling and Zod validation parsing.
- `src/modules/<feature>/<feature>.route.ts`: Express router setup.

## Steps
1. Create directory `src/modules/<feature>/`.
2. Define request validation schemas (Zod) in `<feature>.validation.ts`.
3. Infer and export TypeScript types in `<feature>.interface.ts`.
4. Implement DB query logic using `prisma` client in `<feature>.service.ts`.
5. Parse request inputs using Zod validation and handle responses in `<feature>.controller.ts`.
6. Export router in `<feature>.route.ts`.
7. Import and register the new module router in `src/routes/index.ts`.
