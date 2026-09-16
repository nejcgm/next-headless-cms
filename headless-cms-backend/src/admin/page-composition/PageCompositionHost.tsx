import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Box, Button, Flex, Typography } from '@strapi/design-system';
import { Plus } from '@strapi/icons';
import { useField } from '@strapi/admin/strapi-admin';
import type { CompositionNode } from '../../page-composition/types';
import { componentTypeName } from '../../page-composition/nest-rules';
import { convertPageBlocks } from '../../page-composition/convert-section-children';
import {
  persistedRootRefs,
  stripUnpersistedRootIds,
} from '../../page-composition/sanitize-root-ids';
import { validatePageBlocks } from '../../page-composition/validate';
import { CompositionTree } from './CompositionTree';
import { ErrorMessage } from './ErrorMessage';
import { displayNameForType } from './field-catalog';
import { FieldInspector } from './FieldInspector';
import { JsonFallback } from './JsonFallback';
import {
  type NodePath,
  addChild,
  addRoot,
  deleteAt,
  getAt,
  getSlotsDefault,
  reorderSiblings,
  resolveAddTarget,
  updateNode,
} from './tree-ops';

type Props = {
  name: string;
  disabled?: boolean;
};

function AddBlockMenu({
  types,
  label,
  ariaLabel,
  disabled,
  onPick,
}: {
  types: string[];
  label: string;
  ariaLabel: string;
  disabled?: boolean;
  onPick: (type: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <Box
      ref={rootRef}
      onClick={(event: MouseEvent) => event.stopPropagation()}
      style={{ position: 'relative', flexShrink: 0 }}
    >
      <Button
        size="S"
        variant="secondary"
        startIcon={<Plus />}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={disabled}
        onClick={() => !disabled && setOpen((value) => !value)}
      >
        {label}
      </Button>
      {open && !disabled && (
        <Box
          background="neutral0"
          borderColor="neutral150"
          hasRadius
          padding={1}
          shadow="filterShadow"
          role="menu"
          style={{
            position: 'absolute',
            zIndex: 20,
            minWidth: '100%',
            marginTop: 4,
          }}
        >
          {types.map((type) => (
            <Button
              key={type}
              size="S"
              variant="ghost"
              fullWidth
              onClick={() => {
                onPick(type);
                setOpen(false);
              }}
            >
              {displayNameForType(type)}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
}

export function PageCompositionHost({ name, disabled }: Props) {
  const blocksField = useField<CompositionNode[]>(name);
  const tenantField = useField<string>('tenant');

  const [selected, setSelected] = useState<NodePath | null>(null);
  const [surfaceError, setSurfaceError] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    const node = headerRef.current;
    if (!node) return;
    const measure = () => setHeaderHeight(node.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const tree = useMemo(() => {
    const raw = blocksField.value;
    return Array.isArray(raw) ? convertPageBlocks(raw) : [];
  }, [blocksField.value]);
  const tenant = typeof tenantField.value === 'string' ? tenantField.value : undefined;

  if (name !== 'blocks') return null;

  const applyTree = (next: CompositionNode[]): string | null => {
    try {
      const converted = stripUnpersistedRootIds(convertPageBlocks(next), {
        persisted: persistedRootRefs(tree),
      });
      const result = validatePageBlocks(converted, tenant);
      if (!result.ok) return result.message;
      setSurfaceError(null);
      blocksField.onChange(name, converted);
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong applying that change.';
      setSurfaceError(message);
      return message;
    }
  };

  const handleAdd = (parentPath: NodePath | null, type: string) => {
    const next = parentPath == null ? addRoot(tree, type) : addChild(tree, parentPath, type, tenant);
    if (applyTree(next)) return;
    if (parentPath == null) {
      setSelected([next.length - 1]);
      return;
    }
    const parent = getAt(next, parentPath);
    const kids = parent ? getSlotsDefault(parent) : [];
    setSelected([...parentPath, Math.max(0, kids.length - 1)]);
  };

  const selectedNode = selected ? getAt(tree, selected) : null;
  const addTarget = resolveAddTarget(tree, selected, tenant);
  const addTargetNode = addTarget.path ? getAt(tree, addTarget.path) : null;
  const addTargetLabel = addTargetNode
    ? displayNameForType(componentTypeName(addTargetNode.__component))
    : null;

  return (
    <Box background="neutral0" borderColor="neutral200" hasRadius padding={4} marginBottom={4}>
      <Box ref={headerRef} background="neutral0" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
        <Typography variant="beta">Page composition</Typography>
        <ErrorMessage>{surfaceError}</ErrorMessage>
        <Flex justifyContent="space-between" alignItems="center" paddingTop={4} paddingBottom={2}>
          <Typography variant="delta">Page body</Typography>
          {!disabled && (
            <AddBlockMenu
              types={addTarget.types}
              label={
                addTargetLabel
                  ? addTarget.disabled
                    ? `${addTargetLabel} can't nest`
                    : `Add to ${addTargetLabel}`
                  : 'Add block'
              }
              ariaLabel={addTargetLabel ? `Add inside ${addTargetLabel}` : 'Add top-level band'}
              disabled={addTarget.disabled}
              onPick={(type) => handleAdd(addTarget.path, type)}
            />
          )}
        </Flex>
      </Box>
      <Flex alignItems="flex-start" gap={6} wrap="wrap">
        <Box style={{ flex: '1 1 320px', minWidth: 0 }}>
          <CompositionTree
            tree={tree}
            selected={selected}
            tenant={tenant}
            disabled={disabled}
            onSelect={setSelected}
            onReorder={(parentPath, fromIndex, toIndex) => {
              const next = reorderSiblings(tree, parentPath, fromIndex, toIndex);
              if (applyTree(next)) return;
              setSelected(parentPath == null ? [toIndex] : [...parentPath, toIndex]);
            }}
            onDelete={(path) => {
              if (applyTree(deleteAt(tree, path))) return;
              setSelected(null);
            }}
          />
        </Box>
        <Box
          style={{
            flex: '1 1 280px',
            minWidth: 240,
            position: 'sticky',
            top: headerHeight + 16,
            maxHeight: 700,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
          }}
        >
          <FieldInspector
            node={selectedNode}
            disabled={disabled}
            onChange={(patch) => {
              if (!selected) return;
              applyTree(updateNode(tree, selected, patch));
            }}
          />
        </Box>
      </Flex>
      <JsonFallback tree={tree} tenant={tenant} disabled={disabled} onApply={applyTree} />
    </Box>
  );
}
