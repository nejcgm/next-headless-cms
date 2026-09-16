import type { CompositionNode } from './types';

function collectIds(node: CompositionNode, ids: number[]): void {
  const raw = node.id;
  if (typeof raw === 'number' && Number.isFinite(raw)) ids.push(raw);
  else if (typeof raw === 'string' && /^\d+$/.test(raw)) ids.push(Number(raw));

  const slots = node.slots;
  if (!slots || typeof slots === 'string') return;
  for (const children of Object.values(slots)) {
    if (!Array.isArray(children)) continue;
    for (const child of children) collectIds(child, ids);
  }
}

export function nextCompositionId(tree: CompositionNode[]): number {
  const ids: number[] = [];
  for (const node of tree) collectIds(node, ids);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}

export function nextTempKey(tree: CompositionNode[]): string {
  return `tmp${nextCompositionId(tree)}`;
}
