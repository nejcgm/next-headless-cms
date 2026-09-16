import type { CompositionNode, SlotsMap, ValidateResult } from './types';
import {
  ROOT_COMPONENTS,
  allowlistFor,
  componentTypeName,
  isLeafType,
  maxDepthFor,
  toComponentUid,
} from './nest-rules';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

export function parseSlots(slots: CompositionNode['slots']): SlotsMap {
  if (slots == null) return {};
  if (typeof slots === 'string') {
    let parsed: unknown;
    try {
      parsed = JSON.parse(slots);
    } catch {
      throw new Error('Invalid slots JSON');
    }
    if (!isPlainObject(parsed)) throw new Error('Invalid slots JSON');
    return parsed as SlotsMap;
  }
  return slots;
}

export function subtreeHeight(node: CompositionNode): number {
  let slots: SlotsMap;
  try {
    slots = parseSlots(node.slots);
  } catch {
    return 1;
  }
  let maxChild = 0;
  for (const children of Object.values(slots)) {
    if (!Array.isArray(children)) continue;
    for (const child of children) {
      maxChild = Math.max(maxChild, subtreeHeight(child));
    }
  }
  return 1 + maxChild;
}

function validateNode(
  node: unknown,
  tenant: string | undefined,
  parentAllow: string[] | null
): string | null {
  if (!isPlainObject(node) || typeof node.__component !== 'string') {
    return 'Each block must have a __component';
  }

  const typed = node as CompositionNode;
  const type = componentTypeName(typed.__component);
  const uid = toComponentUid(type);

  if (parentAllow === null) {
    if (!(ROOT_COMPONENTS as readonly string[]).includes(uid)) {
      return `Unknown root block type "${uid}"`;
    }
  } else if (!parentAllow.includes(type)) {
    return `"${type}" is not allowed here`;
  }

  let slots: SlotsMap;
  try {
    slots = parseSlots(typed.slots);
  } catch {
    return `Invalid slots JSON on "${type}"`;
  }

  const defaultChildren = slots.default ?? [];
  const hasChildren = defaultChildren.length > 0;

  if (isLeafType(type) && hasChildren) {
    return `"${type}" cannot have nested blocks`;
  }

  if (type === 'link' || type === 'button') {
    const childTypes = defaultChildren
      .filter(isPlainObject)
      .map((child) => componentTypeName(String((child as CompositionNode).__component)));
    const hasText = childTypes.includes('text');
    const hasIcon = childTypes.includes('icon');
    if (hasIcon && !hasText && !typed.accessibleLabel) {
      return `"${type}" needs an accessible label when it has only an icon and no text`;
    }
  }

  if (hasChildren) {
    const allow = allowlistFor(type, tenant);
    for (const child of defaultChildren) {
      const childError = validateNode(child, tenant, allow);
      if (childError) return childError;
    }
  }

  if (subtreeHeight(typed) > maxDepthFor(type)) {
    return `"${type}" exceeds its nesting depth cap`;
  }

  return null;
}

export function validatePageBlocks(
  blocks: unknown,
  tenant?: string
): ValidateResult {
  if (blocks == null) return { ok: true };
  if (!Array.isArray(blocks)) {
    return { ok: false, message: 'Page blocks must be an array' };
  }

  for (const block of blocks) {
    const error = validateNode(block, tenant, null);
    if (error) return { ok: false, message: error };
  }

  return { ok: true };
}

export function wouldExceedMaxDepth(
  parent: CompositionNode,
  child: CompositionNode
): boolean {
  const next: CompositionNode = {
    ...parent,
    slots: {
      ...parseSlots(parent.slots),
      default: [...(parseSlots(parent.slots).default ?? []), child],
    },
  };
  return subtreeHeight(next) > maxDepthFor(parent.__component);
}
