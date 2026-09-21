import type { CompositionNode } from '../../../page-composition/types';
import {
  allowlistFor,
  isLeafType,
  rootTypesForTenant,
  toComponentUid,
} from '../../../page-composition/nest-rules';
import { nextCompositionId, nextTempKey } from '../../../page-composition/ids';
import { parseSlots, wouldExceedMaxDepth } from '../../../page-composition/validate';
import { createDefaultNode } from '../fields/field-catalog';

export type NodePath = number[];

export function getSlotsDefault(node: CompositionNode): CompositionNode[] {
  try {
    return parseSlots(node.slots).default ?? [];
  } catch {
    return [];
  }
}

export function getAt(tree: CompositionNode[], path: NodePath): CompositionNode | null {
  if (path.length === 0) return null;
  let node: CompositionNode | undefined = tree[path[0]];
  if (!node) return null;
  for (let i = 1; i < path.length; i++) {
    node = getSlotsDefault(node)[path[i]];
    if (!node) return null;
  }
  return node;
}

function replaceAt(
  tree: CompositionNode[],
  path: NodePath,
  updater: (node: CompositionNode) => CompositionNode | null
): CompositionNode[] {
  if (path.length === 0) return tree;

  const walk = (nodes: CompositionNode[], depth: number): CompositionNode[] => {
    const index = path[depth];
    return nodes.map((node, i) => {
      if (i !== index) return node;
      if (depth === path.length - 1) {
        const next = updater(node);
        return next;
      }
      const children = getSlotsDefault(node);
      const nextChildren = walk(children, depth + 1).filter(Boolean) as CompositionNode[];
      return {
        ...node,
        slots: { ...parseSlots(node.slots), default: nextChildren },
      };
    }).filter((node): node is CompositionNode => node != null);
  };

  return walk(tree, 0);
}

export function updateNode(
  tree: CompositionNode[],
  path: NodePath,
  patch: Record<string, unknown>
): CompositionNode[] {
  return replaceAt(tree, path, (node) => ({ ...node, ...patch }));
}

export function deleteAt(tree: CompositionNode[], path: NodePath): CompositionNode[] {
  if (path.length === 1) {
    return tree.filter((_, i) => i !== path[0]);
  }
  const parentPath = path.slice(0, -1);
  const index = path[path.length - 1];
  return replaceAt(tree, parentPath, (parent) => ({
    ...parent,
    slots: {
      ...parseSlots(parent.slots),
      default: getSlotsDefault(parent).filter((_, i) => i !== index),
    },
  }));
}

export function reorderSiblings(
  tree: CompositionNode[],
  parentPath: NodePath | null,
  fromIndex: number,
  toIndex: number
): CompositionNode[] {
  if (fromIndex === toIndex) return tree;

  const reorder = (items: CompositionNode[]): CompositionNode[] => {
    if (
      fromIndex < 0 ||
      fromIndex >= items.length ||
      toIndex < 0 ||
      toIndex >= items.length
    ) {
      return items;
    }
    const copy = [...items];
    const [item] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, item);
    return copy;
  };

  if (parentPath == null) return reorder(tree);

  return replaceAt(tree, parentPath, (parent) => ({
    ...parent,
    slots: { ...parseSlots(parent.slots), default: reorder(getSlotsDefault(parent)) },
  }));
}

export function addRoot(
  tree: CompositionNode[],
  type: string
): CompositionNode[] {
  const node = createDefaultNode(type, { tempKey: nextTempKey(tree) });
  return [...tree, node];
}

export function canAddChild(
  parent: CompositionNode,
  childType: string,
  tenant?: string
): boolean {
  if (isLeafType(parent.__component)) return false;
  const allow = allowlistFor(parent.__component, tenant);
  if (!allow.includes(childType)) return false;
  const child: CompositionNode = { __component: toComponentUid(childType) };
  return !wouldExceedMaxDepth(parent, child);
}

export function addChild(
  tree: CompositionNode[],
  parentPath: NodePath,
  type: string,
  tenant?: string
): CompositionNode[] {
  const parent = getAt(tree, parentPath);
  if (!parent || !canAddChild(parent, type, tenant)) return tree;
  const child = createDefaultNode(type, { id: nextCompositionId(tree) });
  return replaceAt(tree, parentPath, (node) => ({
    ...node,
    slots: {
      ...parseSlots(node.slots),
      default: [...getSlotsDefault(node), child],
    },
  }));
}

export function allowedAdds(
  parent: CompositionNode | null,
  tenant?: string,
  forRoot?: boolean
): string[] {
  if (forRoot || !parent) {
    return rootTypesForTenant(tenant);
  }
  if (isLeafType(parent.__component)) return [];
  return allowlistFor(parent.__component, tenant).filter((type) =>
    canAddChild(parent, type, tenant)
  );
}

export function resolveAddTarget(
  tree: CompositionNode[],
  selected: NodePath | null,
  tenant?: string
): { path: NodePath | null; types: string[]; disabled: boolean } {
  if (selected) {
    const node = getAt(tree, selected);
    const types = node ? allowedAdds(node, tenant, false) : [];
    return { path: selected, types, disabled: types.length === 0 };
  }
  return { path: null, types: allowedAdds(null, tenant, true), disabled: false };
}
