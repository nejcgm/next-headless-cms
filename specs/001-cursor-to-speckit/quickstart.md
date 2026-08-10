# Quickstart: Validate Spec Kit Migration & Cutover

**Feature**: `001-cursor-to-speckit`  
**Purpose**: Runnable checks proving Spec Kit is complete and legacy rules can be removed safely.

## Prerequisites

- Repo root: `headless-cms/`
- Spec Kit installed (`.specify/` present)
- This feature active: `.specify/feature.json` → `specs/001-cursor-to-speckit`

## Phase A — Structure exists

```bash
# From repo root
test -f .specify/memory/constitution.md
test -f .specify/memory/project-context.md
test -d .specify/memory/knowledge
test -f .specify/memory/knowledge/architecture.md
test -f .specify/memory/knowledge/block-system.md
test -f .specify/memory/knowledge/deployment.md
test -f .specify/memory/knowledge/typescript.md
test -f .specify/memory/knowledge/i18n.md
test -f .specify/memory/knowledge/mock-data.md
test -f .specify/memory/knowledge/new-tenant.md
test -f .specify/memory/knowledge/integrations.md
test -f .specify/memory/knowledge/strapi-backend.md
test -f .specify/memory/knowledge/content-model.md
test -f .specify/memory/knowledge/api-contract.md
test -f specs/_catalogs/vukans-bike.md
test -f specs/_catalogs/resort-example.md
```

**Expected**: All commands succeed (exit 0).

## Phase B — Inventory verified

1. Open `contracts/migration-inventory.md`.
2. Confirm all 17 rows are `verified`.
3. Spot-check 3 domains (architecture, api-contract, vukans-bike catalog) against original `.mdc` while files still exist.

## Phase C — Sync map points only at Spec Kit

```bash
# Should find Spec Kit paths in project-context sync section
rg "knowledge/|specs/_catalogs" .specify/memory/project-context.md

# After tooling update, scaffold/docs should not require new .mdc catalogs
rg "\.cursor/rules" next-headless-cms-fe/scripts/create-tenant.js || true
```

**Expected before cutover**: create-tenant writes `specs/_catalogs/`.  
**Expected after cutover**: no required agent guidance under `.cursor/rules`.

## Phase D — Spec Kit workflow still works

```bash
# Sanity: feature.json points at this feature during migration
cat .specify/feature.json
```

Then manually: run `/speckit-specify` on a trivial throwaway feature **or** confirm plan templates reference `next-headless-cms-fe/` / `headless-cms-backend/` (see `.specify/templates/plan-template.md`).

## Phase E — Cutover (only after A–D)

1. Grep for stale references:

```bash
rg -n "\.cursor/rules/.*\.mdc" \
  --glob '!**/node_modules/**' \
  --glob '!**/.next*/**' \
  README.md \
  next-headless-cms-fe/docs \
  next-headless-cms-fe/scripts \
  .specify \
  specs \
  headless-cms-backend/scripts || true
```

2. Fix any remaining required references to point at Spec Kit.
3. Delete legacy rule trees:

```bash
# Illustrative — actual delete happens in implement tasks after audit
# rm -rf .cursor/rules
# rm -rf next-headless-cms-fe/.cursor/rules
# rm -rf headless-cms-backend/.cursor/rules
```

4. Confirm skills remain:

```bash
ls .cursor/skills/speckit-*
```

5. Mark inventory rows `deleted`.

## Phase F — Post-cutover smoke

| Check | Pass criteria |
|-------|----------------|
| Constitution readable | Opens; version footer present |
| Project-context index | Lists all knowledge files + both catalogs |
| Agent Q&A sample | Can answer “single page route?” and “lang vs locale?” from Spec Kit only |
| Human docs | README links Spec Kit workflow |

## Related contracts

- [migration-inventory.md](./contracts/migration-inventory.md)
- [agent-doc-sync.md](./contracts/agent-doc-sync.md)
- [target-layout.md](./contracts/target-layout.md)
- [data-model.md](./data-model.md)
