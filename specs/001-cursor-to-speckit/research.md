# Research: Cursor Rules → Spec Kit Full Migration

**Feature**: `001-cursor-to-speckit`  
**Date**: 2026-08-10

## R1 — Single source of truth location

**Decision**: Put durable agent guidance in Spec Kit under:

| Path | Role |
|------|------|
| `.specify/memory/constitution.md` | Non-negotiable principles & quality gates (always-on) |
| `.specify/memory/project-context.md` | Index + sync map (replaces `rules-sync.mdc`) |
| `.specify/memory/knowledge/*.md` | Domain guides migrated from topical `.mdc` files |
| `specs/_catalogs/{tenant-id}.md` | Per-tenant catalogs |
| `specs/{nnn-feature}/` | Feature work only |

**Rationale**: Spec Kit already loads constitution for plan/specify flows. A `knowledge/` tree under memory keeps always-relevant domain docs next to constitution without polluting feature folders. Catalogs under `specs/_catalogs/` stay versioned with product knowledge and are easy to discover. Feature dirs stay reserved for incremental work.

**Alternatives considered**:

| Alternative | Rejected because |
|-------------|------------------|
| Keep `.mdc` forever + Spec Kit for features only | Dual context; user’s goal is one SoT and less noise |
| Put all knowledge inside constitution only | Constitution becomes unreadably large; Spec Kit expects principles ≠ encyclopedias |
| Only `specs/_knowledge/` without memory index | Agents lose a stable “start here” pointer constitution already provides |

---

## R2 — What to delete vs keep

**Decision**:

| Keep | Delete after audit |
|------|--------------------|
| `.cursor/skills/speckit-*` | `.cursor/rules/**/*.mdc` (repo root) |
| `.specify/**` | `next-headless-cms-fe/.cursor/rules/**/*.mdc` |
| `next-headless-cms-fe/docs/**` (human) | `headless-cms-backend/.cursor/rules/**/*.mdc` |
| `README.md` | Empty `.cursor/rules/` dirs if unused |

**Rationale**: Skills are Spec Kit invocation glue. Human docs serve people. Rules were the dual agent context the user wants removed.

**Alternatives considered**: Move `.mdc` to archive folder — rejected; still invites drift and accidental loads.

---

## R3 — Content migration strategy

**Decision**: Lift-and-adapt each `.mdc` into knowledge/catalog markdown:

1. Strip YAML frontmatter (`description`, `globs`, `alwaysApply`).
2. Rewrite “update this `.mdc`” → “update Spec Kit path X”.
3. Preserve tables, constraints, examples, and file paths.
4. Mark inventory row complete only when section parity checklist passes.

**Rationale**: Existing rules are already accurate and battle-tested; rewriting from memory risks omission (especially Strapi `lang`, block registries, cache tags).

**Alternatives considered**: Summarize-only migration — rejected; loses agent-critical detail (SC-004 requires parity).

---

## R4 — Sync map replacement

**Decision**: `project-context.md` owns a **Path → Update these Spec Kit docs** table equivalent to `rules-sync.mdc`, pointing only at Spec Kit paths after cutover.

**Rationale**: Living documentation sync is a constitution principle; the map must survive rule deletion.

---

## R5 — Tenant scaffold

**Decision**: Update `create:tenant.js` (and checklist knowledge doc) to write `specs/_catalogs/{id}.md` and update `project-context.md` tenant table. Stop creating `.cursor/rules/tenants/{id}/catalog.mdc`.

**Rationale**: New tenants must not reintroduce `.mdc` catalogs after cutover.

---

## R6 — Phased delivery order

**Decision**:

1. **Expand memory** — constitution + project-context index  
2. **Migrate knowledge** — all topical `.mdc` → `knowledge/*.md`  
3. **Migrate catalogs** — both tenants → `specs/_catalogs/`  
4. **Retarget tooling** — scaffold, README, docs links, templates  
5. **Audit** — inventory 100% + parity checklist  
6. **Cutover** — delete `.mdc` rules; grep for stale references  

**Rationale**: Deletion last prevents knowledge loss. Tooling retarget before delete prevents regenerating old paths.

---

## R7 — Spec Kit standards alignment

**Decision**: Follow Spec Kit artifact roles strictly:

- `spec.md` — WHAT/WHY (user/business)  
- `plan.md` — HOW (technical approach)  
- `research.md` — decisions (this file)  
- `data-model.md` — entities for the migration knowledge system  
- `contracts/` — agent-facing documentation contracts / sync obligations  
- `quickstart.md` — validation steps for migration & cutover  
- `tasks.md` — later via `/speckit-tasks`  

**Rationale**: Matches Spec Kit 0.15 workflow and keeps this feature itself a reference for future specs.

---

## Unresolved → Resolved

| Former uncertainty | Resolution |
|--------------------|------------|
| Keep `.mdc` during transition? | No long-term; transition is phases 1–5, deletion is phase 6 of **this** feature |
| Where do catalogs live? | `specs/_catalogs/{tenant-id}.md` |
| Keep human docs? | Yes |
| Keep Spec Kit skills? | Yes |
