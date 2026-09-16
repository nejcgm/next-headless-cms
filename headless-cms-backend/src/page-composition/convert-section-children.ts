import type { CompositionNode, SlotsMap } from './types';
import { componentTypeName } from './nest-rules';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function convertSlots(slots: SlotsMap | string | undefined): SlotsMap | undefined {
  if (slots == null) return undefined;
  const parsed: unknown = typeof slots === 'string' ? JSON.parse(slots) : slots;
  if (!isPlainObject(parsed)) return undefined;
  const next: SlotsMap = {};
  for (const [key, val] of Object.entries(parsed)) {
    if (!Array.isArray(val)) continue;
    next[key] = val.map((child) => convertNode(child as CompositionNode));
  }
  return next;
}

export function convertNode(node: CompositionNode): CompositionNode {
  if (!isPlainObject(node)) return node;

  const out: CompositionNode = { ...node };
  const type = componentTypeName(String(out.__component || ''));

  if (type === 'section' && Array.isArray(out.children)) {
    out.slots = {
      default: out.children.map((child) => convertNode(child)),
    };
    delete out.children;
  } else if (out.slots != null) {
    out.slots = convertSlots(out.slots);
    delete out.children;
  } else if (Array.isArray(out.children)) {
    delete out.children;
  }

  if (out.slots) {
    out.slots = convertSlots(out.slots);
  }

  return out;
}

export function convertPageBlocks(blocks: unknown): CompositionNode[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((block) => convertNode(block as CompositionNode));
}
