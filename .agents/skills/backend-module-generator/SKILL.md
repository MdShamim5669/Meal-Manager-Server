---
name: backend-module-generator
description: Generate feature-based Express backend modules including route, controller, service, validation, constant, and interface files following project conventions.
---

# Backend Module Generator Skill

Use this skill when scaffolding a new feature module in `src/modules/<feature_name>/`.

## Module Directory Pattern
Each module should contain:
- `src/modules/<feature>/<feature>.constant.ts`: Module constants, searchable & filterable field lists.
- `src/modules/<feature>/<feature>.validation.ts`: Zod validation schemas.
- `src/modules/<feature>/<feature>.interface.ts`: Explicit TypeScript types, DTOs & filter request type definitions.
- `src/modules/<feature>/<feature>.service.ts`: Business logic and Prisma DB operations.
- `src/modules/<feature>/<feature>.controller.ts`: Request/response handling and Zod validation parsing.
- `src/modules/<feature>/<feature>.route.ts`: Express router setup.

## Steps
1. Create directory `src/modules/<feature>/`.
2. Define module constants in `<feature>.constant.ts`.
3. Define request validation schemas (Zod) in `<feature>.validation.ts`.
4. Export explicit type definitions (`I<Entity>FilterRequest`, `I<Entity>Create`, `I<Entity>Update`, `I<Entity>`) in `<feature>.interface.ts`.
5. Implement DB query logic using `prisma` client in `<feature>.service.ts`.
6. Parse request inputs using Zod validation and handle responses in `<feature>.controller.ts`.
7. Export router in `<feature>.route.ts`.
8. Import and register the new module router in `src/routes/index.ts`.
