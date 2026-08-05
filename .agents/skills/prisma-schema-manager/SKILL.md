---
name: prisma-schema-manager
description: Manage and extend modular Prisma schemas in prisma/schema/ directory and synchronize database changes.
---

# Prisma Schema Manager Skill

Use this skill when modifying database models, adding new tables, or updating schema relationships.

## Multi-File Schema Structure
All schema files are located under `prisma/schema/`:
- `schema.prisma`: Client generator & datasource configuration.
- `enums.prisma`: Enums definition file.
- `<model_name>.prisma`: Individual model schema files.

## Workflow
1. For new models, create `<model_name>.prisma` in `prisma/schema/`.
2. For enum updates, edit `prisma/schema/enums.prisma`.
3. Validate schema changes by running:
   ```bash
   npx prisma validate
   ```
4. Push updates to Neon database:
   ```bash
   npx prisma db push
   ```
