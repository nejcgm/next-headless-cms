<!--
Sync Impact Report
- Version: 1.3.6 → 1.4.0
- Modified principles: VII. Clean, Maintainable Code (file placement: no constant-only files; one shallow feature folder)
- Added sections: VIII. Composable Page Tree
- Removed sections: none
- Follow-up: domain detail stays in knowledge/block-system.md; no template changes
-->

# Headless CMS Constitution

## Core Principles

### I. One Build, One Tenant (NON-NEGOTIABLE)

Every dev, CI, and production build MUST set `TENANT_ID` to exactly one tenant folder (`vukans-bike`, `resort-example`, etc.). Each tenant gets an isolated bundle: `@tenant` alias, tenant blocks/templates, and optional mock data. Cross-tenant imports and bundled code are forbidden. Verify with `pnpm verify:build` after tenant builds.

### II. Strict Layer Boundaries

Dependency direction is fixed: `app/` → `core/` → `shared/` and `app/` → `tenants/` → `shared/`. `core/` MUST NOT import from `tenants/` except documented exceptions (`fetcher`, `mock.adapter`, `resolver`, `init`). `shared/` MUST NOT import from `tenants/`. New cross-boundary imports require refactoring shared types/functions first — never widening exceptions casually.

### III. Single Route, Block Composition

There is ONE page route: `next-headless-cms-fe/src/app/[domain]/[[...slug]]/page.tsx`. All pages render via the block registry and tenant templates. Dynamic URLs (e.g. `/bikes/:slug`, `/rooms/:id`) use slug-pattern matching in the CMS adapter — never new Next.js route files per page.

### IV. Spec Kit Single Source of Truth (NON-NEGOTIABLE)

Agent guidance for this monorepo lives in Spec Kit only:

| Artifact | Path |
|----------|------|
| Constitution | `.specify/memory/constitution.md` |
| Project index & sync map | `.specify/memory/project-context.md` |
| Domain knowledge | `.specify/memory/knowledge/*.md` |
| Tenant catalogs | `specs/_catalogs/{tenant-id}.md` |
| Feature work | `specs/{nnn-feature}/` |

When behavior changes, update the matching Spec Kit artifact **in the same change set** (see sync map in `project-context.md`). Do not maintain parallel agent files that **restate** domain guidance. Thin always-on discovery bridges that **only point** at Spec Kit paths are allowed (Cursor `.cursor/rules/speckit-agent-bootstrap.mdc`, Claude Code `CLAUDE.md`).

### Agent bootstrap (NON-NEGOTIABLE)

Agents MUST load Spec Kit memory in this order before domain design or implementation:

1. This constitution  
2. `.specify/memory/project-context.md` (index + sync map)  
3. Every relevant `.specify/memory/knowledge/*.md` for the task domain (use the knowledge index)  
4. `specs/_catalogs/{tenant-id}.md` when the work is tenant-specific  
5. Active `specs/{nnn-feature}/` when implementing a feature  

Spec Kit commands that only name the constitution are incomplete for this monorepo until steps 2–4 are done.

Human docs (`README.md`, `next-headless-cms-fe/README.md`, `headless-cms-backend/README.md`) remain for people and MUST stay consistent with Spec Kit when they overlap. READMEs may include a short Spec Kit pointer only.

### V. Minimal, Focused Changes (NON-NEGOTIABLE for agents)

Prefer the smallest correct diff. Reuse existing blocks, adapters, templates, and conventions. Do not over-engineer. Do not add unrelated refactors to feature PRs. Match surrounding code style.

**No drive-by edits (NON-NEGOTIABLE)**: When adding or changing one primitive, block, utility, or page tree, do **not** also “improve,” restyle, or bugfix sibling files that are outside the requested change. Examples of forbidden drive-bys: editing `button` while adding `link`; changing global `iframe` / `text` defaults for one page’s look; opportunistic `mailto`/`tel` fixes on unrelated components.

- Put page-specific look in **mock/CMS props** (box styles, variants) or in the **new** primitive — not by mutating other shared leaves.
- If a real bug in a sibling is noticed, **mention it** and wait for an explicit ask (or a separate task) before touching it.
- Spec Kit / catalog updates still apply for behavior you *did* intentionally change — do not expand the code diff to match.

### VI. Data Adapter Contract

Frontend reads content through `CmsAdapter` (`mock` or `strapi` per tenant config). Strapi queries filter by `tenant` + `lang` (custom field — **not** Strapi i18n plugin). REST contract changes require coordinated updates: backend schema, `strapi.adapter.ts`, frontend types, and Spec Kit `knowledge/api-contract.md` + `knowledge/content-model.md` in one change set.

### VII. Clean, Maintainable Code (NON-NEGOTIABLE for agents)

Agents and contributors MUST write code that a human teammate can read, change, and trust later.

- **Comments** (NON-NEGOTIABLE): Keep comments **minimal**. Prefer clear names and structure over narration.
  - **Do not** put comments inside `interface` / `type` declarations (no field JSDoc, no inline `//` on properties). Document CMS contracts, defaults, and injection rules in Spec Kit knowledge/catalogs instead.
  - **Do not** add comments that restate the next line, label obvious steps (“fetch data”, “validate dates”, “Axios instance with defaults”), narrate control flow, or leave “AI essay” / boilerplate file headers (`/** page controller */`, placeholder register/bootstrap essays).
  - **Do** comment in implementation when intent is non-obvious (**why**, not what): invariants, workarounds, security, subtle domain rules, build/tooling edge cases (`distDir`, middleware matchers).
  - **Exception — lint/type suppressions**: `eslint-disable` / `@ts-*` directives **are allowed** (with a short reason) wherever required, including next to types — e.g. `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry accepts heterogeneous block props`.
  - **Do** keep JS `@param` / `@typedef` in untyped scripts when they aid tooling.
- **Readability**: Prefer straightforward, human-readable TypeScript/JS — small functions, explicit names, no clever one-liners that hide control flow.
- **Maintainability**: Match existing patterns in the touched package. Avoid drive-by abstractions and unused helpers. Delete dead code you introduce; do not leave TODOs that restate the task.
- **Abstraction**: Introduce types, helpers, or layers only when they remove real duplication or clarify a boundary. Prefer the project’s existing folder layout over new parallel trees. Do not add a file that only exports a couple of constants; keep those next to their only caller.
- **Folder structure**: Place code where the monorepo already expects it (`app/` thin, `core/` engine, `tenants/{id}/` tenant UI/data, `shared/` reusable UI, Strapi under `headless-cms-backend/src/{api,components}/`). Do not invent alternate package layouts for the same concern. When a feature grows, group its files into **one** shallow folder by role (tree, fields, preview). Do not add a generic `utils/` dump, and do not nest deeper than that without a real boundary. Each shared or tenant component gets **its own folder** (`component` + `types.ts` + `schema.ts` when it is a content block).
- **Interfaces & types**: Prefer explicit interfaces/types at public boundaries (adapters, block props, contracts, shared helpers). Avoid `any` except established registry exceptions. Keep frontend `PageData` / navigation / block props aligned with the content model when those contracts change.

### VIII. Composable Page Tree (NON-NEGOTIABLE)

A page is a **tree of a small shared vocabulary**, not a catalog of page-specific sections. Do not add `HeroSection`, `FAQSection`, `FeatureSection`, or similar when existing nodes can express that layout.

**Three levels.** The CMS tree may contain all three. Domain detail (names, allowlists, depth caps) lives in `knowledge/block-system.md`.

1. **Primitives (L1)** — one job each. Layout arranges children (`section`, `flex`, `grid`). Content displays something (`text`, `image`, `icon`, `iframe`). Actions are `button` and `link`. Do not add a primitive when an existing one already covers the case (`flex` with `direction: "column"` is the column layout; there is no separate stack).
2. **Compositions (L2)** — authored subtrees of L1. An FAQ is accordion → text. A media row is flex → image + text + button. The tree **is** the section. There is no second component type named after the section.
3. **Compounds (L3)** — one atomic node when the thing has its own behavior, data, or state that a primitive tree would fake (product list, bike detail, booking). Composable in the tree (a flex may contain a product list). Not decomposable into dozens of CMS nodes. Shared compounds stay tenant-agnostic; tenant look and copy live in the page tree or in `tenants/{id}/`, never as a branded component under `shared/`.

**How to write a new piece of UI**

- If it is image + text + button (or the same shape), compose L1. Do not register a new shared section.
- If it needs its own state, fetch, or domain rules, add one L3 node in the right place: `shared/components/ui/{name}/` when every tenant can use it, `tenants/{id}/blocks/{name}/` when it is that tenant’s.
- Non-CMS chrome (lightbox, progress bar) is not a page node. Put it under `shared/components/static/` or `shared/components/navigation/`.
- Leaves do not accept children. Parents accept only their allowlist, in named **slots**, up to that type’s **max depth**. Do not give every node arbitrary `children`.
- A new nest rule is written twice and kept identical: frontend `composition-allow.ts` (registry policy) and Strapi `nest-rules.ts`. The admin cannot import the Next app.

## Monorepo Constraints

| Package | Tooling | Purpose |
|---------|---------|---------|
| `next-headless-cms-fe/` | **pnpm** only | Next.js 15 multi-tenant CMS |
| `headless-cms-backend/` | **npm** | Strapi v5 content API |
| `.github/workflows/` | repo root | CI + manual Vercel deploys per tenant |

Run pnpm only inside `next-headless-cms-fe/`. CI sets `working-directory: next-headless-cms-fe` for frontend jobs.

**Tenants today:** `vukans-bike` is the live **product** tenant (`dataAdapter: "strapi"`). `resort-example` is a **build-isolation fixture** (`dataAdapter: "mock"`) — not a peer product. New tenants should be plug-and-play via scaffold + Spec Kit catalog; pattern off `vukans-bike` (see `knowledge/new-tenant.md`).

## Quality Gates

- **Lint**: matrix per tenant (`pnpm lint:bike`, `pnpm lint:resort`)
- **Type-check**: `pnpm type-check` in frontend
- **Types-style**: `pnpm check:types-style` in frontend (no inline component prop literals; 3+ args → options object) — agents MUST run after component/type edits; CI enforces with type-check
- **Build isolation**: `pnpm verify:build` after `pnpm build:{tenant}`
- **Strapi schema changes**: `npm run types:generate` in backend; re-seed if content shape changes
- **Secrets**: never commit `.env`; production must not use default `REVALIDATE_SECRET`
- **Docs**: Spec Kit knowledge/catalog updated when described behavior changes
- **Backend Spec Kit**: `strapi-backend`, `content-model`, and `api-contract` knowledge docs are first-class (same bar as frontend knowledge)
- **Code quality**: diffs follow Principle VII (minimal comments, clear types, correct folder placement) and Principle VIII (compose primitives before adding a section component)

## Development Workflow

1. **New features**: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` (each command MUST run Agent bootstrap above)
2. **Bug fixes / small edits**: Agent bootstrap → relevant knowledge + catalog; open a feature spec if the contract changes
3. Before tenant-specific work: read `specs/_catalogs/{tenant-id}.md`
4. Header/footer live in tenant **templates**, not domain layout
5. Do not add route-level `loading.tsx` when templates own chrome (use `NavigationProgressBar` + block-level Suspense)

## Governance

This constitution defines non-negotiable architectural and process constraints. Amendments require updating `.specify/memory/constitution.md` and noting the change in the active feature spec or a dedicated governance spec.

**Amendments**

- **1.3.1** — Human frontend docs are `next-headless-cms-fe/README.md` only (removed `docs/` folder); Spec Kit remains agent SoT.
- **1.3.2** — Principle VII comments: explicit keep/remove rules (no narrating or obvious JSDoc; keep why/contract/tooling comments).
- **1.3.3** — No comments inside `interface` / `type` bodies; contracts live in Spec Kit. Lint/`@ts-*` suppressions remain allowed with a reason.
- **1.3.4** — Agent bootstrap: constitution → project-context → knowledge → catalogs (wired into Spec Kit skills + thin Cursor bootstrap rule).
- **1.3.5** — Principle V: no drive-by edits to unrelated shared primitives/utilities while adding or redesigning something else; page look via props or the new primitive only.
- **1.3.6** — Claude Code Spec Kit integration (`.claude/skills/speckit-*`) plus thin `CLAUDE.md` bootstrap; Cursor remains the default integration.
- **1.4.0** — Principle VIII: pages are a tree of primitives, compositions, and atomic compounds. Principle VII: no constant-only files; one shallow feature folder; one folder per component.

**Version**: 1.4.0 | **Ratified**: 2026-08-10 | **Last Amended**: 2026-09-22
