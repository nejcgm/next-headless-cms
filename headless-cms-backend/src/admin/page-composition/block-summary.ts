import type { CompositionNode } from '../../page-composition/types';
import { componentTypeName, isLeafType } from '../../page-composition/nest-rules';
import { displayNameForType } from './field-catalog';

const MAX_LENGTH = 40;

function truncate(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= MAX_LENGTH) return trimmed;
  return `${trimmed.slice(0, MAX_LENGTH - 1)}…`;
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

const SOURCE_FIELD: Record<string, string | null> = {
  text: 'content',
  icon: 'name',
  accordion: 'title',
  iframe: 'title',
  gallery: 'heading',
  'product-list': 'heading',
  'bike-detail': null,
};

function ownSummary(node: CompositionNode, type: string): string | null {
  if (type === 'image') {
    const alt = str(node.alt);
    if (alt) return truncate(alt);
    const src = str(node.src);
    if (src) return truncate(src.split('/').pop() ?? src);
    return null;
  }

  const field = SOURCE_FIELD[type];
  if (!field) return null;
  const value = str(node[field]);
  return value ? truncate(value) : null;
}

function getSlotsDefaultChildren(node: CompositionNode): CompositionNode[] {
  const raw = node.slots;
  if (raw == null) return [];
  const slots = typeof raw === 'string' ? safeParse(raw) : raw;
  const children = slots?.default;
  return Array.isArray(children) ? children : [];
}

function safeParse(raw: string): { default?: CompositionNode[] } | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function summaryFor(node: CompositionNode): string {
  const type = componentTypeName(node.__component);

  const adminName = str(node.adminName);
  if (adminName) return truncate(adminName);

  const own = ownSummary(node, type);
  if (own) return own;

  if (!isLeafType(type)) {
    const children = getSlotsDefaultChildren(node);
    for (const child of children) {
      const childSummary = summaryFor(child);
      const childType = componentTypeName(child.__component);
      if (childSummary !== displayNameForType(childType)) {
        return truncate(`${displayNameForType(type)}: ${childSummary}`);
      }
    }
    if (children.length > 0) {
      return `${displayNameForType(type)} (${children.length})`;
    }
  }

  return displayNameForType(type);
}
