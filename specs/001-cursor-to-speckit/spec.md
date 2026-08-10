# Feature Specification: Cursor Rules to Spec Kit Migration

**Feature Branch**: `001-cursor-to-speckit`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "I already have some cursor rules written for this project but I'm migrating from that to spec kit so I'd like for you to adjust the speckit files based on what you can gather about this project." — **Amended 2026-08-10**: full migration to Spec Kit as single source of truth; remove legacy Cursor `.mdc` context files after migration is complete. — **Clarify 2026-08-10**: backend (`headless-cms-backend/`) is fully in scope alongside the frontend.

## Clarifications

### Session 2026-08-10

- Q: Must the Strapi backend package be fully included in this migration (rules → Spec Kit, then delete backend `.mdc`)? → A: Yes — backend is fully in scope with the frontend (equal coverage for `headless-cms-backend/.cursor/rules/`).
- Q: After Spec Kit holds agent guidance, how should READMEs relate to Spec Kit for frontend and backend? → A: READMEs are human-readable docs for both FE and BE; Spec Kit is for agents (not a substitute for package READMEs).
- Q: May human READMEs include a Spec Kit pointer? → A: Short Spec Kit pointer only (1–2 lines / link) in root and package READMEs; no agent encyclopedias in README bodies.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Spec Kit is the only agent context (Priority: P1)

As a developer using AI assistance, I want all project guidance to live in Spec Kit memory and knowledge docs so agents do not load duplicate Cursor rules and Spec Kit stays the single source of truth.

**Why this priority**: Dual context (`.mdc` + Spec Kit) causes drift, excess tokens, and conflicting instructions. Full migration is the goal.

**Independent Test**: With legacy `.mdc` rules removed, an agent completing a typical **frontend** task (blocks, tenants, deploy) or **backend** task (Strapi schema, content model, REST contract, seed) still finds all required guidance solely under `.specify/` and `specs/`.

**Acceptance Scenarios**:

1. **Given** Spec Kit knowledge docs are complete, **When** a developer asks about layer boundaries, blocks, Strapi `lang`, content types, REST populate/cache tags, or tenant catalogs, **Then** answers come from Spec Kit artifacts without needing `.cursor/rules/**/*.mdc` in frontend **or** backend packages.
2. **Given** migration verification passes, **When** legacy `.mdc` rule files are deleted (including `headless-cms-backend/.cursor/rules/`), **Then** no required project guidance is missing (audit checklist 100% covered for both packages).
3. **Given** a new feature request that touches Strapi and/or Next.js, **When** `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` runs, **Then** generated artifacts follow monorepo paths for **both** packages and constitution gates without referencing deleted rule paths.

---

### User Story 2 - Every legacy rule is migrated without loss (Priority: P1)

As a maintainer, I want every Cursor rule file’s content transferred into Spec Kit-standard artifacts so no architectural knowledge is lost when `.mdc` files are removed.

**Why this priority**: Premature deletion without a content audit would break agent quality. Completeness is mandatory before removal.

**Independent Test**: For each of the 17 legacy rule files, a mapping row shows target Spec Kit path(s) and an audit confirms content parity.

**Acceptance Scenarios**:

1. **Given** the migration inventory, **When** audited against each `.mdc` file, **Then** every file maps to one or more Spec Kit targets with no “orphan” content.
2. **Given** tenant catalogs for `vukans-bike` and `resort-example`, **When** migrated, **Then** Spec Kit catalogs retain blocks, templates, pages, data contracts, and integrations.
3. **Given** Strapi content-model and API-contract rules, **When** migrated, **Then** Spec Kit knowledge docs retain schemas, query patterns, cache tags, and `lang` constraints.

---

### User Story 3 - Sync and tooling point at Spec Kit (Priority: P2)

As a developer changing code, I want “update docs in the same change” guidance to point at Spec Kit knowledge paths (not `.mdc`), and tenant scaffolding to create Spec Kit catalogs.

**Why this priority**: Without rewiring sync maps and scaffold scripts, new work recreates the old dual-context problem.

**Independent Test**: `create:tenant` writes a catalog under Spec Kit catalogs; project-context sync table lists Spec Kit paths only.

**Acceptance Scenarios**:

1. **Given** a code change to blocks or Strapi schema, **When** an agent follows sync rules, **Then** it updates Spec Kit knowledge/catalog files — not deleted `.mdc` paths.
2. **Given** `pnpm create:tenant`, **When** scaffolding completes, **Then** a Spec Kit tenant catalog is created (and no new `.cursor/rules/tenants/*/catalog.mdc` is required).
3. **Given** human docs (root + frontend + backend READMEs and `docs/`), **When** migration completes, **Then** they remain **human-oriented** (setup, scripts, how to run) for both packages; agent-oriented guidance lives in Spec Kit only.

---

### User Story 4 - Safe removal of legacy Cursor rules (Priority: P3)

As a maintainer, I want a clear cutover checklist so `.mdc` rule files can be deleted only after Spec Kit coverage is verified.

**Why this priority**: Removal is the end state of this feature but must not precede verification.

**Independent Test**: Cutover checklist all checked; repo search finds no references requiring deleted `.mdc` paths for agent guidance.

**Acceptance Scenarios**:

1. **Given** Spec Kit coverage audit passes, **When** cutover runs, **Then** listed `.mdc` rule files under repo root, frontend, and backend `.cursor/rules/` are removed.
2. **Given** Spec Kit skills under `.cursor/skills/speckit-*`, **When** cutover runs, **Then** those skills remain (they are Spec Kit tooling, not legacy rules).
3. **Given** post-cutover, **When** a developer runs a Spec Kit command, **Then** constitution and knowledge docs are discoverable without legacy rules.

---

### Edge Cases

- What happens if human docs (`README`, `docs/`) overlap Spec Kit knowledge? **Audience split**: READMEs and `docs/` are for humans (both frontend and backend packages); Spec Kit is for agents. Keep facts aligned where they overlap; do not move agent encyclopedias into READMEs or delete human docs.
- What happens if a skill or script still references `.mdc` paths after migration? Cutover checklist requires grepping and updating those references first.
- What happens if only one package changes after cutover? Spec Kit knowledge docs are split by domain so agents load only relevant sections via project-context index.
- What if Spec Kit constitution and a feature spec disagree? Active feature spec + amended constitution win; knowledge docs are updated in the same change set.
- What if backend README is still Strapi boilerplate? Migration MUST replace/upgrade it into a **human-readable** project README for `headless-cms-backend/` (how to run, seed, env) — not leave stock Strapi-only docs as the package face.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST maintain a project constitution at `.specify/memory/constitution.md` with all non-negotiable monorepo constraints formerly in architecture/monorepo rules.
- **FR-002**: System MUST maintain `.specify/memory/project-context.md` as the navigational index (replacing `rules-sync.mdc`) mapping code areas → Spec Kit knowledge paths.
- **FR-003**: System MUST host durable domain knowledge under `.specify/memory/knowledge/` covering **frontend and backend** domains: architecture, blocks, deployment, TypeScript, i18n, mock data, new-tenant, integrations, Strapi backend overview, content model, and API contract — content-complete vs legacy `.mdc` sources in **both** `next-headless-cms-fe/.cursor/rules/` and `headless-cms-backend/.cursor/rules/`.
- **FR-004**: System MUST host tenant catalogs under `specs/_catalogs/{tenant-id}.md` for every existing tenant, migrated from `tenants/*/catalog.mdc`.
- **FR-005**: System MUST provide a migration inventory mapping each of the 17 legacy rule files (frontend + backend + monorepo root) to Spec Kit target path(s).
- **FR-006**: System MUST update Spec Kit templates (plan, tasks, constitution) so generated work uses monorepo paths for **both** `next-headless-cms-fe/` and `headless-cms-backend/` and Spec Kit sync obligations.
- **FR-007**: System MUST update tenant scaffolding so new tenants get Spec Kit catalogs (not new `.mdc` catalogs).
- **FR-008**: System MUST maintain **human-readable** documentation for both packages: root `README.md`, frontend docs under `next-headless-cms-fe/docs/` (and frontend-facing README content as applicable), and a project-specific `headless-cms-backend/README.md` (replace stock Strapi boilerplate with human setup/run/seed guidance). Spec Kit MUST remain the **agent** single source of truth — READMEs MUST NOT become a second agent rulebook. Root and package READMEs MUST include a **short** Spec Kit discoverability pointer only (about 1–2 lines or a single link to `.specify/memory/` / Spec Kit workflow) — not a full agent guide.
- **FR-009**: After coverage audit passes, System MUST delete legacy Cursor **rule** `.mdc` files under `.cursor/rules/`, `next-headless-cms-fe/.cursor/rules/`, and `headless-cms-backend/.cursor/rules/` (backend package included — no backend rules left behind).
- **FR-010**: System MUST NOT delete Spec Kit skills (`.cursor/skills/speckit-*`) or human documentation under `next-headless-cms-fe/docs/`.
- **FR-011**: Feature workflow MUST remain `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` with sequential `specs/{nnn-feature}/` directories.
- **FR-012**: Living-doc sync MUST require same-change-set updates to Spec Kit knowledge/catalog/constitution when code behavior they describe changes (including Strapi schema/API changes).
- **FR-013**: Backend Spec Kit coverage MUST be first-class: `strapi-backend.md`, `content-model.md`, and `api-contract.md` are mandatory deliverables with the same parity bar as frontend knowledge docs; cutover MUST NOT proceed if any backend inventory row is unverified.
- **FR-014**: Audience separation MUST be enforced: humans → READMEs/`docs/`; agents → `.specify/` + `specs/`. Changes that affect how people run the apps update human READMEs; changes that affect agent constraints update Spec Kit. A short Spec Kit pointer in READMEs is allowed for discoverability and does not violate this separation.

### Key Entities

- **Constitution**: Non-negotiable principles and quality gates.
- **Project Context**: Index of packages, knowledge docs, catalogs, and sync map.
- **Knowledge Document**: Durable domain guidance (architecture, Strapi, blocks, etc.).
- **Tenant Catalog**: Per-tenant blocks, templates, pages, integrations.
- **Legacy Rule File**: Source `.mdc` to migrate then delete.
- **Feature Spec Directory**: `specs/{nnn-name}/` for feature work.
- **Cutover Checklist**: Verification gate before `.mdc` deletion.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 17 legacy rule files appear in the migration inventory with a Spec Kit target and “content migrated” status before cutover (includes all 4 backend rule files).
- **SC-002**: After cutover, a contributor can answer architecture, block, deploy, per-tenant, **and backend** questions (content types, REST contract, `lang` vs `locale`, seed) using only Spec Kit paths in under 2 minutes.
- **SC-007**: Backend cutover is blocked until `strapi-backend`, `content-model`, `api-contract`, and backend sync inventory rows are `verified` (same gate as frontend).
- **SC-008**: A new human contributor can start frontend and backend using package/root READMEs alone (without opening Spec Kit); an agent task after cutover can complete using Spec Kit alone (without `.mdc` rules).
- **SC-009**: Root and package READMEs each contain at most a short Spec Kit pointer (discoverability), with no duplicated agent rule content from knowledge docs.
- **SC-003**: Agent context for routine tasks no longer requires loading any deleted `.mdc` rule file (zero required references remain in sync maps / scaffolding).
- **SC-004**: Spec Kit knowledge + catalogs pass a parity checklist against each legacy rule’s sections (no critical section left “TODO”).
- **SC-005**: New tenant scaffold creates a Spec Kit catalog; creating a new `.mdc` catalog is not part of the happy path.
- **SC-006**: Post-cutover repo search for agent-guidance `.mdc` rule paths finds zero remaining required references (skills and third-party Cursor config excluded as applicable).

## Assumptions

- Spec Kit 0.15.2 with `cursor-agent` integration remains the workflow tooling.
- **Audience split**: READMEs (root, FE, BE) and `next-headless-cms-fe/docs/` are for humans; Spec Kit (`.specify/`, `specs/`) is for agents. READMEs may include a short Spec Kit pointer only.
- Spec Kit **skills** under `.cursor/skills/` stay; only **rules** under `.cursor/rules/` (and package-level rule trees) are removed.
- Content is migrated by copying/adapting existing rule text into Spec Kit structure — not reinventing architecture.
- Cutover (deletion) is the last phase of this same feature, gated by audit — not a separate unspecified project.
- Backend stock Strapi README is replaced/upgraded into a human project README as part of this feature.

## Out of Scope

- Changing application runtime architecture (routes, adapters, Strapi schemas) except docs/scaffolding that point at Spec Kit
- Configuring Strapi webhooks or preview (runtime ops — not the docs migration)
- Migrating CMS **content** or tenants themselves (seed data stays; agent rules migrate)
- Replacing human `docs/*.md` with Spec Kit (keep both; align links)
- **Not** out of scope: migrating and deleting **backend** Cursor rules (`headless-cms-backend/.cursor/rules/`) — those are in scope
