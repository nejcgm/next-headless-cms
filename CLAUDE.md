# Spec Kit agent bootstrap

Before coding or Spec Kit work in this monorepo, **Read** (do not guess):

1. `.specify/memory/constitution.md` — non‑negotiable principles
2. `.specify/memory/project-context.md` — knowledge index + sync map (**start here for which docs to open**)
3. Matching `.specify/memory/knowledge/*.md` for the domain you are changing
4. `specs/_catalogs/{tenant-id}.md` when touching a tenant

Domain truth lives in Spec Kit memory (`knowledge/`, catalogs), not in agent skill files. Spec Kit skills are workflow glue only. Update matching knowledge/catalog files in the same change set when behavior changes (see sync map in `project-context.md`).

## Spec Kit commands (Claude Code)

Restart Claude Code after cloning or after `.claude/` changes. Then type:

- `/speckit-specify` or `/speckit.specify`
- `/speckit-plan` or `/speckit.plan`
- `/speckit-tasks` or `/speckit.tasks`
- `/speckit-implement` or `/speckit.implement`

Hyphen names are the skills (`.claude/skills/speckit-*/`). Dotted names are aliases (`.claude/commands/speckit.*.md`). Older Spec Kit docs used only the dotted form.

