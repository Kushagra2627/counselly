# Backend — InsForge Infrastructure

This directory contains backend infrastructure assets managed through the InsForge platform.

## Structure

```
backend/
├── migrations/          # PostgreSQL migration SQL files
│   ├── 20261002004434_init-counselly-schema.sql
│   └── 20261003_stage3_verification.sql
└── functions/           # InsForge Edge Functions (future use)
```

## Migrations

Database migrations are applied via the InsForge CLI from the **project root**:

```bash
# From project root — list applied migrations
npx @insforge/cli db migrations list

# Apply a new migration
npx @insforge/cli db import backend/migrations/<filename>.sql
```

> **Note:** The InsForge CLI reads migration history from the remote database, not from the local filesystem. Migration files are stored here for version control and documentation purposes.

## Schema Overview

See [`docs/architecture/database-schema.md`](../docs/architecture/database-schema.md) for the full schema reference.
