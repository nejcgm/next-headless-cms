# Tasks: Cursor Rules to Spec Kit Full Migration

**Input**: Design documents from `/specs/001-cursor-to-speckit/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  
**Tests**: Not requested in spec — validation via quickstart + inventory parity only  

**Organization**: Setup → Foundational → US1–US4 → Polish  

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Parallelizable (different files, no incomplete blockers)
- **[Story]**: [US1]…[US4] on user-story phase tasks only

## Path Conventions

- Spec Kit memory: `.specify/memory/`
- Knowledge: `.specify/memory/knowledge/`
- Catalogs: `specs/_catalogs/`
- Feature: `specs/001-cursor-to-speckit/`
- Frontend: `next-headless-cms-fe/`
- Backend: `headless-cms-backend/`
- Legacy rules (delete only in US4): `.cursor/rules/`, `next-headless-cms-fe/.cursor/rules/`, `headless-cms-backend/.cursor/rules/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create Spec Kit directories and confirm feature pointers  

- [X] T001 Create directory `.specify/memory/knowledge/` at repo root
- [X] T002 Create directory `specs/_catalogs/` at repo root
- [X] T003 Confirm `.specify/feature.json` points to `specs/001-cursor-to-speckit` and `contracts/migration-inventory.md` lists all 17 rows

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Agent SoT skeleton and sync contract ready before content migration  

**⚠️ CRITICAL**: No user story content migration until this phase completes  

- [X] T004 Finalize Spec Kit SoT wording in `.specify/memory/constitution.md` (Principle IV + FE/BE monorepo constraints per FR-001)
- [X] T005 Finalize index + sync map (Spec Kit paths only) in `.specify/memory/project-context.md` per FR-002 and `contracts/agent-doc-sync.md`
- [X] T006 [P] Ensure `.specify/templates/plan-template.md` Technical Context / source tree covers both `next-headless-cms-fe/` and `headless-cms-backend/` (FR-006)
- [X] T007 [P] Ensure `.specify/templates/tasks-template.md` Path Conventions list Spec Kit knowledge/catalogs and both packages (FR-006)
- [X] T008 Align `contracts/migration-inventory.md` status legend with implementation workflow (`pending` → `migrated` → `verified` → `deleted`)

---

## Phase 3: User Story 1 — Spec Kit is the only agent context (P1)

**Goal**: Agents navigate FE + BE guidance solely via Spec Kit memory/index (structure complete; content filled in US2)  

**Independent Test**: With project-context + constitution open (no `.mdc` required for navigation), an agent can locate architecture, blocks, Strapi, and catalog paths for both packages  

### Implementation

- [X] T009 [US1] Document agent load order (constitution → project-context → knowledge/catalog) in `.specify/memory/project-context.md`
- [X] T010 [P] [US1] Add knowledge index table rows for all 11 planned files in `.specify/memory/project-context.md` (mark missing files until US2 creates them)
- [X] T011 [P] [US1] Add tenant catalog table pointing to `specs/_catalogs/vukans-bike.md` and `specs/_catalogs/resort-example.md` in `.specify/memory/project-context.md`
- [X] T012 [US1] Add backend-first-class note (FR-013) to `.specify/memory/project-context.md` and `.specify/memory/constitution.md` Quality Gates
- [X] T013 [US1] Update `.cursor/rules/monorepo.mdc` Spec Kit section to say Spec Kit is SoT and this `.mdc` is legacy until US4 cutover (temporary bridge only)

**Checkpoint**: Index and constitution alone describe where FE + BE agent docs will live  

---

## Phase 4: User Story 2 — Every legacy rule migrated without loss (P1)

**Goal**: Lift-and-adapt all 17 `.mdc` sources into knowledge docs + catalogs; inventory → `migrated`  

**Independent Test**: Each inventory row has a Spec Kit target file with section parity vs source (parity checklist items draft-complete); no orphan `.mdc` content  

### Frontend / monorepo knowledge (parallelizable)

- [X] T014 [P] [US2] Migrate `project-architecture.mdc` + monorepo layout into `.specify/memory/knowledge/architecture.md`; set inventory rows 1/3 → `migrated`
- [X] T015 [P] [US2] Migrate `block-system.mdc` into `.specify/memory/knowledge/block-system.md`; set inventory row 4 → `migrated`
- [X] T016 [P] [US2] Migrate `deployment.mdc` into `.specify/memory/knowledge/deployment.md`; set inventory row 5 → `migrated`
- [X] T017 [P] [US2] Migrate `typescript-conventions.mdc` into `.specify/memory/knowledge/typescript.md`; set inventory row 6 → `migrated`
- [X] T018 [P] [US2] Migrate `i18n.mdc` into `.specify/memory/knowledge/i18n.md`; set inventory row 7 → `migrated`
- [X] T019 [P] [US2] Migrate `mock-data-pages.mdc` into `.specify/memory/knowledge/mock-data.md`; set inventory row 8 → `migrated`
- [X] T020 [P] [US2] Migrate `new-tenant-checklist.mdc` into `.specify/memory/knowledge/new-tenant.md` (point catalogs to `specs/_catalogs/`); set inventory row 9 → `migrated`
- [X] T021 [P] [US2] Migrate `tenant-integrations.mdc` into `.specify/memory/knowledge/integrations.md`; set inventory row 11 → `migrated`

### Backend knowledge (parallelizable; first-class FR-013)

- [X] T022 [P] [US2] Migrate `headless-cms-backend/.cursor/rules/strapi-backend.mdc` into `.specify/memory/knowledge/strapi-backend.md`; set inventory row 14 → `migrated`
- [X] T023 [P] [US2] Migrate `headless-cms-backend/.cursor/rules/content-model.mdc` into `.specify/memory/knowledge/content-model.md`; set inventory row 15 → `migrated`
- [X] T024 [P] [US2] Migrate `headless-cms-backend/.cursor/rules/api-contract.mdc` into `.specify/memory/knowledge/api-contract.md`; set inventory row 16 → `migrated`

### Sync maps + catalogs

- [X] T025 [US2] Fold `rules-sync.mdc` (FE) + backend `rules-sync.mdc` + `tenant-context.mdc` into `.specify/memory/project-context.md` sync map; set inventory rows 2/10/17 → `migrated`
- [X] T026 [P] [US2] Migrate `tenants/vukans-bike/catalog.mdc` into `specs/_catalogs/vukans-bike.md`; rewrite maintenance pointers to Spec Kit; set inventory row 12 → `migrated`
- [X] T027 [P] [US2] Migrate `tenants/resort-example/catalog.mdc` into `specs/_catalogs/resort-example.md`; rewrite maintenance pointers to Spec Kit; set inventory row 13 → `migrated`
- [X] T028 [US2] Strip YAML frontmatter and replace “update this `.mdc`” language with Spec Kit paths across all new knowledge/catalog files under `.specify/memory/knowledge/` and `specs/_catalogs/`
- [X] T029 [US2] Run Phase A file-existence checks from `specs/001-cursor-to-speckit/quickstart.md` and fix any missing paths

**Checkpoint**: All 17 inventory rows are `migrated` (not yet `verified`)  

---

## Phase 5: User Story 3 — Sync and tooling point at Spec Kit (P2)

**Goal**: Scaffold + human READMEs use Spec Kit paths; audience split enforced (FR-007, FR-008, FR-014)  

**Independent Test**: `create:tenant` would write `specs/_catalogs/`; READMEs are human-readable for FE+BE with short Spec Kit pointer only; sync map lists Spec Kit paths only  

### Implementation

- [X] T030 [US3] Update `next-headless-cms-fe/scripts/create-tenant.js` to create `specs/_catalogs/{id}.md` instead of `.cursor/rules/tenants/{id}/catalog.mdc`
- [X] T031 [US3] Update `next-headless-cms-fe/scripts/create-tenant.js` (and printed checklist) to instruct updating `.specify/memory/project-context.md` tenant table, not `tenant-context.mdc`
- [X] T032 [P] [US3] Update `next-headless-cms-fe/scripts/check-tenant-setup.js` expectations for Spec Kit catalog path if it currently requires `.mdc` catalogs
- [X] T033 [US3] Rewrite `headless-cms-backend/README.md` as human-readable project README (run/seed/env/npm); replace stock Strapi boilerplate (FR-008)
- [X] T034 [P] [US3] Ensure root `README.md` stays human-oriented (scripts, layout) and add short Spec Kit pointer only (SC-009)
- [X] T035 [P] [US3] Add short Spec Kit pointer to `headless-cms-backend/README.md` (1–2 lines / link)
- [X] T036 [P] [US3] Add short Spec Kit pointer in `next-headless-cms-fe/docs/README.md` (and align `DEVELOPMENT.md` / `STRAPI-MIGRATION.md` links to Spec Kit knowledge without dumping agent encyclopedias)
- [X] T037 [US3] Update `.specify/memory/knowledge/new-tenant.md` so happy path never creates new `.mdc` catalogs (SC-005)
- [X] T038 [US3] Verify `rg "\.cursor/rules" next-headless-cms-fe/scripts/create-tenant.js` finds no required new-catalog `.mdc` writes (quickstart Phase C)

**Checkpoint**: Humans use READMEs; agents use Spec Kit; scaffold does not recreate `.mdc` catalogs  

---

## Phase 6: User Story 4 — Safe removal of legacy Cursor rules (P3)

**Goal**: Parity audit → verify inventory → delete `.mdc` rule trees; keep Spec Kit skills  

**Independent Test**: Quickstart Phases B–F pass; no required agent guidance under deleted `.mdc` paths; `.cursor/skills/speckit-*` remain  

### Audit (before delete)

- [X] T039 [US4] Run parity checklist for each of 17 rows in `specs/001-cursor-to-speckit/contracts/migration-inventory.md`; set each row to `verified` only when checklist passes (FR-013 blocks cutover if any backend row fails)
- [X] T040 [P] [US4] Spot-check architecture, api-contract, and `specs/_catalogs/vukans-bike.md` against still-present source `.mdc` files
- [X] T041 [US4] Grep for stale `.cursor/rules/**/*.mdc` references in `README.md`, `next-headless-cms-fe/docs/`, `next-headless-cms-fe/scripts/`, `.specify/`, `specs/`, `headless-cms-backend/` (exclude skills); fix required refs to Spec Kit paths

### Cutover delete

- [X] T042 [US4] Delete legacy rules under `.cursor/rules/` (repo root) — do **not** delete `.cursor/skills/`
- [X] T043 [US4] Delete legacy rules under `next-headless-cms-fe/.cursor/rules/` (entire tree including `tenants/*/catalog.mdc`)
- [X] T044 [US4] Delete legacy rules under `headless-cms-backend/.cursor/rules/`
- [X] T045 [US4] Set all 17 inventory rows to `deleted` in `specs/001-cursor-to-speckit/contracts/migration-inventory.md`
- [X] T046 [US4] Confirm `ls .cursor/skills/speckit-*` still succeeds (FR-010)
- [X] T047 [US4] Run post-cutover smoke from `specs/001-cursor-to-speckit/quickstart.md` Phase F; fix gaps

**Checkpoint**: Cutover complete; Spec Kit is sole agent context; human READMEs intact  

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Consistency and handoff  

- [X] T048 [P] Remove temporary “legacy until cutover” wording from any remaining docs that still claim dual `.mdc` + Spec Kit SoT
- [X] T049 [P] Update `specs/001-cursor-to-speckit/plan.md` Next Command / status notes to reflect tasks complete when implementing
- [X] T050 Run full quickstart Phases A–F from `specs/001-cursor-to-speckit/quickstart.md` and record pass in `specs/001-cursor-to-speckit/checklists/requirements.md` Notes (or a cutover note file under the feature dir)
- [X] T051 [P] Ensure constitution version footer amended if Principle IV / gates changed during implement (`.specify/memory/constitution.md`)

---

## Dependencies & Execution Order

### Phase dependencies

```text
Phase 1 Setup
    → Phase 2 Foundational
        → Phase 3 US1 (index / SoT navigation)
        → Phase 4 US2 (content migration)  [can start after T008; ideally after US1 index]
            → Phase 5 US3 (tooling + human READMEs)
                → Phase 6 US4 (audit + delete)  [HARD GATE: all inventory verified]
                    → Phase 7 Polish
```

### User story dependencies

| Story | Depends on | Notes |
|-------|------------|-------|
| US1 | Foundational | Index/SoT navigation |
| US2 | Foundational (US1 recommended) | Content fill; backend + frontend |
| US3 | US2 (`migrated`) | Scaffold/docs assume knowledge paths exist |
| US4 | US2 + US3 | Must not delete until verified + tooling retargeted |

### Parallel opportunities

- **US2**: T014–T024 knowledge files in parallel; T026–T027 catalogs in parallel  
- **US3**: T034–T036 README/docs pointers in parallel after T033  
- **US4**: T040 spot-checks parallel; deletes T042–T044 sequential if preferred for safety  

### Parallel example (US2)

```bash
# After T008: migrate knowledge files concurrently
# T014 architecture, T015 blocks, T016 deploy, T017 typescript,
# T018 i18n, T019 mock-data, T020 new-tenant, T021 integrations,
# T022 strapi-backend, T023 content-model, T024 api-contract
```

---

## Implementation Strategy

### MVP (User Story 1 + Foundational)

Deliver constitution + project-context + empty knowledge dir index so agents know Spec Kit is SoT navigation target.  

### Incremental delivery

1. US2 — migrate all content (FE + BE) → inventory `migrated`  
2. US3 — scaffold + human READMEs  
3. US4 — verify + delete `.mdc`  

### Suggested MVP scope

**T001–T013** (Setup + Foundational + US1), then immediately continue US2 — MVP alone is incomplete without US2 content for real agent work.

---

## Notes

- No automated unit/integration test tasks (not requested in spec).  
- Validation = inventory parity + `quickstart.md`.  
- Never delete `.cursor/skills/speckit-*`.  
- Backend knowledge (T022–T024) is a hard cutover dependency (FR-013 / SC-007).
