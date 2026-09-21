# Data model: Composition Live Preview

**Feature**: `013-composition-live-preview`  
**Date**: 2026-09-21

No new stored document. The page draft in Strapi is unchanged until Save.

## Preview overlay (process memory)

Held only in the frontend server that is rendering the draft. Not a database row.

| Field | Meaning |
|-------|---------|
| locale | Page language (`lang`) of the draft being previewed |
| slug | Logical path of that draft (the address the frame loaded) |
| blocks | Composition array (`__component` nodes), same shape the editor already holds |
| updatedAt | When this overlay was stored |

Missing overlay: the draft page renders its saved blocks. Present overlay: those blocks replace the saved body for that draft render only. An empty array means the editor removed every block.

Entries older than two minutes are ignored.

## Message from the editor to the frame

| Field | Meaning |
|-------|---------|
| type | `cms-compose-preview` |
| blocks | Current composition array |

Slug and language come from the draft page that is already open in the frame, not from unsaved identity fields.
