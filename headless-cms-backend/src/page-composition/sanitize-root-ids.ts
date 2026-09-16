import type { CompositionNode } from './types';

export type PersistedRootRef = {
  id: string;
  __component: string;
};

function rootId(node: CompositionNode): string | null {
  if (node.id == null || node.id === '') return null;
  return String(node.id);
}

/**
 * Root `page.blocks` items are Strapi dynamic-zone rows. Their `id` must already
 * belong to this page, or be omitted so Strapi creates a row. Nested `slots`
 * nodes use separate composition ids and must not be sent as root DZ ids.
 */
export function persistedRootRefs(tree: CompositionNode[]): PersistedRootRef[] {
  return tree.flatMap((node) => {
    const id = rootId(node);
    if (id == null) return [];
    if (node.__temp_key__) return [];
    return [{ id, __component: node.__component }];
  });
}

export function stripUnpersistedRootIds(
  blocks: CompositionNode[],
  options?: { persisted?: PersistedRootRef[] }
): CompositionNode[] {
  const persisted = options?.persisted;

  return blocks.map((node, index) => {
    const id = rootId(node);
    const hasTempKey =
      typeof node.__temp_key__ === 'string' && node.__temp_key__.length > 0;

    if (persisted) {
      const known =
        id != null &&
        persisted.some(
          (ref) => ref.id === id && ref.__component === node.__component
        );
      if (known) return node;

      const { id: _omit, ...rest } = node;
      return {
        ...rest,
        __temp_key__: hasTempKey ? node.__temp_key__ : `tmp${index}`,
      } as CompositionNode;
    }

    if (hasTempKey && id != null) {
      const { id: _omit, ...rest } = node;
      return rest as CompositionNode;
    }

    return node;
  });
}
