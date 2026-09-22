import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Box, Button, Flex, IconButton, Typography } from '@strapi/design-system';
import { Collapse, Expand, Plus } from '@strapi/icons';
import { useField } from '@strapi/admin/strapi-admin';
import type { CompositionNode } from '../../page-composition/types';
import { componentTypeName } from '../../page-composition/nest-rules';
import { convertPageBlocks } from '../../page-composition/convert-section-children';
import {
  persistedRootRefs,
  stripUnpersistedRootIds,
} from '../../page-composition/sanitize-root-ids';
import { validatePageBlocks } from '../../page-composition/validate';
import { ErrorMessage } from './error/ErrorMessage';
import { JsonFallback } from './error/JsonFallback';
import { displayNameForType } from './fields/field-catalog';
import { FieldInspector } from './fields/FieldInspector';
import { CompositionPreview } from './preview/CompositionPreview';
import { widenPageEditColumn } from './preview/edit-layout';
import { CompositionTree } from './tree/CompositionTree';
import {
  type NodePath,
  addChild,
  addRoot,
  deleteAt,
  pasteCopy,
  getAt,
  getSlotsDefault,
  reorderSiblings,
  resolveAddTarget,
  updateNode,
} from './tree/tree-ops';

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
  const [fullscreen, setFullscreen] = useState(false);
  const [clipboard, setClipboard] = useState<CompositionNode | null>(null);
  const actionsRef = useRef<{ copy: () => void; paste: () => void }>({
    copy: () => undefined,
    paste: () => undefined,
  });

  const tree = useMemo(() => {
    const raw = blocksField.value;
    return Array.isArray(raw) ? convertPageBlocks(raw) : [];
  }, [blocksField.value]);
  const tenant = typeof tenantField.value === 'string' ? tenantField.value : undefined;

  useEffect(() => {
    const marker = document.querySelector('[data-page-composition]');
    if (!(marker instanceof HTMLElement)) return undefined;
    return widenPageEditColumn(marker);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      if (key !== 'c' && key !== 'v') return;
      const target = event.target;
      const surface = document.querySelector('[data-page-composition]');
      if (!(target instanceof Node) || !surface?.contains(target)) return;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return;
      }
      event.preventDefault();
      if (key === 'c') actionsRef.current.copy();
      else actionsRef.current.paste();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [fullscreen]);

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

  const copySelected = () => {
    if (!selectedNode) return;
    setClipboard(structuredClone(selectedNode));
    setSurfaceError(null);
  };

  const pasteClipboard = () => {
    if (!clipboard) {
      setSurfaceError('Copy a block first.');
      return;
    }
    if (!selected) {
      setSurfaceError('Select a block to paste into.');
      return;
    }
    const result = pasteCopy(tree, selected, clipboard, tenant);
    if (result.error) {
      setSurfaceError(result.error);
      return;
    }
    if (applyTree(result.tree)) return;
    const parent = getAt(result.tree, selected);
    const kids = parent ? getSlotsDefault(parent) : [];
    setSelected([...selected, Math.max(0, kids.length - 1)]);
  };

  actionsRef.current = { copy: copySelected, paste: pasteClipboard };

  const addTarget = resolveAddTarget(tree, selected, tenant);
  const addTargetNode = addTarget.path ? getAt(tree, addTarget.path) : null;
  const addTargetLabel = addTargetNode
    ? displayNameForType(componentTypeName(addTargetNode.__component))
    : null;

  return (
    <Box
      background="neutral0"
      borderColor="neutral200"
      hasRadius={!fullscreen}
      padding={4}
      marginBottom={fullscreen ? 0 : 4}
      data-page-composition="true"
      style={
        fullscreen
          ? {
              position: 'fixed',
              inset: 0,
              zIndex: 400,
              width: '100vw',
              height: '100dvh',
              maxHeight: '100dvh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 0,
              overflow: 'hidden',
              boxSizing: 'border-box',
            }
          : { width: '100%' }
      }
    >
      <Box background="neutral0" style={{ position: 'sticky', top: 0, zIndex: 2, flexShrink: 0 }}>
        <Flex justifyContent="space-between" alignItems="center" gap={2}>
          <Typography variant="beta">Page composition</Typography>
          <IconButton
            label={fullscreen ? 'Exit full screen' : 'Open full screen'}
            variant="ghost"
            size="S"
            onClick={() => setFullscreen((value) => !value)}
          >
            {fullscreen ? <Collapse /> : <Expand />}
          </IconButton>
        </Flex>
        <ErrorMessage>{surfaceError}</ErrorMessage>
        <Flex justifyContent="space-between" alignItems="center" paddingTop={4} paddingBottom={2}>
          <Typography variant="delta">Page body</Typography>
          {!disabled && (
            <Flex gap={2}>
              <Button size="S" variant="tertiary" disabled={!selectedNode} onClick={copySelected}>
                Copy
              </Button>
              <Button size="S" variant="secondary" disabled={!clipboard} onClick={pasteClipboard}>
                Paste
              </Button>
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
            </Flex>
          )}
        </Flex>
      </Box>
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 16,
          width: '100%',
          minWidth: 0,
          minHeight: fullscreen ? 0 : 520,
          height: fullscreen ? undefined : 'calc(100vh - 220px)',
          flex: fullscreen ? '1 1 auto' : undefined,
          overflow: fullscreen ? 'hidden' : undefined,
        }}
      >
        <div
          style={{
            flex: '0 0 280px',
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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
        </div>
        <div style={{ flex: '1 1 auto', minWidth: 0, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
          <CompositionPreview blocks={tree} disabled={disabled} />
        </div>
        <div style={{ flex: '0 0 280px', minWidth: 0, minHeight: 0, overflow: 'auto' }}>
          <FieldInspector
            node={selectedNode}
            disabled={disabled}
            onChange={(patch) => {
              if (!selected) return;
              applyTree(updateNode(tree, selected, patch));
            }}
          />
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        <JsonFallback tree={tree} tenant={tenant} disabled={disabled} onApply={applyTree} />
      </div>
    </Box>
  );
}
