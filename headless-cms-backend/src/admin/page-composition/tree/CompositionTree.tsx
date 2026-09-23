import { useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import {
  DndContext,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Button, Dialog, Flex, IconButton, Typography } from '@strapi/design-system';
import { ChevronDown, ChevronRight, Drag, Trash } from '@strapi/icons';
import type { CompositionNode } from '../../../page-composition/types';
import { componentTypeName, isLeafType } from '../../../page-composition/nest-rules';
import { displayNameForType } from '../fields/field-catalog';
import { summaryFor } from './block-summary';
import { type NodePath, getAt, getSlotsDefault } from './tree-ops';

type Props = {
  tree: CompositionNode[];
  selected: NodePath | null;
  tenant?: string;
  disabled?: boolean;
  onSelect: (path: NodePath | null) => void;
  onReorder: (parentPath: NodePath | null, fromIndex: number, toIndex: number) => void;
  onDelete: (path: NodePath) => void;
};

function pathsEqual(a: NodePath | null, b: NodePath): boolean {
  if (!a || a.length !== b.length) return false;
  return a.every((value, i) => value === b[i]);
}

function nodeDragId(node: CompositionNode, path: NodePath): string {
  const own = node.id ?? node.__temp_key__;
  return own != null ? String(own) : `p${path.join('.')}`;
}

function collectDragIds(nodes: CompositionNode[], prefix: NodePath, map: Map<string, NodePath>): void {
  nodes.forEach((node, i) => {
    const path = [...prefix, i];
    map.set(nodeDragId(node, path), path);
    const children = getSlotsDefault(node);
    if (children.length > 0) collectDragIds(children, path, map);
  });
}

function TreeGutter({ children }: { children?: ReactNode }) {
  return (
    <Box
      style={{
        width: 26,
        minWidth: 26,
        height: 26,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children ?? null}
    </Box>
  );
}

type RowProps = {
  node: CompositionNode;
  path: NodePath;
  tree: CompositionNode[];
  selected: NodePath | null;
  tenant?: string;
  disabled?: boolean;
  collapsed: Set<string>;
  onToggleCollapse: (id: string) => void;
  onSelect: (path: NodePath | null) => void;
  onRequestDelete: (path: NodePath) => void;
};

function TreeRow({
  node,
  path,
  tree,
  selected,
  tenant,
  disabled,
  collapsed,
  onToggleCollapse,
  onSelect,
  onRequestDelete,
}: RowProps) {
  const id = nodeDragId(node, path);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const type = componentTypeName(node.__component);
  const active = pathsEqual(selected, path);
  const children = getSlotsDefault(node);
  const isLeaf = isLeafType(type);
  const isCollapsed = collapsed.has(id);
  const summary = summaryFor(node);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    minWidth: 0,
    maxWidth: '100%',
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Flex
        alignItems="center"
        gap={1}
        hasRadius
        background={active ? 'primary100' : undefined}
        style={{
          cursor: 'pointer',
          minWidth: 0,
          width: '100%',
          overflow: 'hidden',
          paddingTop: 5,
          paddingBottom: 5,
          paddingLeft: 4,
          paddingRight: 4,
        }}
        onClick={(event: MouseEvent) => {
          event.stopPropagation();
          onSelect(path);
        }}
      >
        <TreeGutter>
          {!isLeaf && children.length > 0 ? (
            <IconButton
              label={isCollapsed ? `Expand ${displayNameForType(type)}` : `Collapse ${displayNameForType(type)}`}
              variant="ghost"
              size="S"
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                onToggleCollapse(id);
              }}
            >
              {isCollapsed ? <ChevronRight /> : <ChevronDown />}
            </IconButton>
          ) : null}
        </TreeGutter>
        {!disabled && (
          <TreeGutter>
            <IconButton label={`Drag to reorder ${displayNameForType(type)}`} variant="ghost" size="S" {...attributes} {...listeners}>
              <Drag />
            </IconButton>
          </TreeGutter>
        )}
        <Box style={{ flex: '1 1 0%', minWidth: 0, overflow: 'hidden' }}>
          <Typography
            fontWeight={active ? 'bold' : 'regular'}
            variant="pi"
            ellipsis
            style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {summary}
          </Typography>
          {summary !== displayNameForType(type) && (
            <Typography
              variant="pi"
              textColor="neutral500"
              ellipsis
              style={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '1.05rem',
              }}
            >
              {displayNameForType(type)}
            </Typography>
          )}
        </Box>
        {!disabled && (
          <TreeGutter>
            <IconButton
              label={`Delete ${displayNameForType(type)}`}
              variant="ghost"
              size="S"
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                onRequestDelete(path);
              }}
            >
              <Trash />
            </IconButton>
          </TreeGutter>
        )}
      </Flex>
      {!isLeaf && !isCollapsed && children.length > 0 && (
        <Box style={{ paddingLeft: 12, minWidth: 0, overflow: 'hidden' }} paddingBottom={1}>
          <SortableContext
            items={children.map((child, i) => nodeDragId(child, [...path, i]))}
            strategy={verticalListSortingStrategy}
          >
            {children.map((child, i) => (
              <TreeRow
                key={nodeDragId(child, [...path, i])}
                node={child}
                path={[...path, i]}
                tree={tree}
                selected={selected}
                tenant={tenant}
                disabled={disabled}
                collapsed={collapsed}
                onToggleCollapse={onToggleCollapse}
                onSelect={onSelect}
                onRequestDelete={onRequestDelete}
              />
            ))}
          </SortableContext>
        </Box>
      )}
    </Box>
  );
}

export function CompositionTree(props: Props) {
  const { tree, tenant, disabled, onReorder, onDelete } = props;
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<NodePath | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const idPathMap = useMemo(() => {
    const map = new Map<string, NodePath>();
    collectDragIds(tree, [], map);
    return map;
  }, [tree]);

  function toggleCollapse(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromPath = idPathMap.get(String(active.id));
    const toPath = idPathMap.get(String(over.id));
    if (!fromPath || !toPath) return;
    const fromParent = fromPath.slice(0, -1);
    const toParent = toPath.slice(0, -1);
    if (fromParent.length !== toParent.length || fromParent.some((v, i) => v !== toParent[i])) {
      return;
    }
    const parentPath = fromParent.length > 0 ? fromParent : null;
    onReorder(parentPath, fromPath[fromPath.length - 1], toPath[toPath.length - 1]);
  }

  const deleteTargetNode = deleteTarget ? getAt(tree, deleteTarget) : null;

  return (
    <Box
      style={{ minWidth: 0, width: '100%', minHeight: '100%', flex: 1, overflow: 'auto' }}
      onClick={() => props.onSelect(null)}
    >
      {tree.length === 0 ? (
        <Typography variant="omega" textColor="neutral600">
          No blocks yet. Add a top-level band to start.
        </Typography>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={tree.map((node, i) => nodeDragId(node, [i]))}
            strategy={verticalListSortingStrategy}
          >
            {tree.map((node, i) => (
              <TreeRow
                key={nodeDragId(node, [i])}
                node={node}
                path={[i]}
                tree={tree}
                selected={props.selected}
                tenant={tenant}
                disabled={disabled}
                collapsed={collapsed}
                onToggleCollapse={toggleCollapse}
                onSelect={props.onSelect}
                onRequestDelete={setDeleteTarget}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
      <Dialog.Root
        open={deleteTarget != null}
        onOpenChange={(open: boolean) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <Dialog.Content>
          <Dialog.Header>Delete this block?</Dialog.Header>
          <Dialog.Body>
            {deleteTargetNode
              ? `Delete "${summaryFor(deleteTargetNode)}" and everything nested inside it? This cannot be undone.`
              : 'Delete this block and everything nested inside it? This cannot be undone.'}
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Cancel>
              <Button variant="tertiary">Cancel</Button>
            </Dialog.Cancel>
            <Dialog.Action>
              <Button
                variant="danger"
                onClick={() => {
                  if (deleteTarget) onDelete(deleteTarget);
                  setDeleteTarget(null);
                }}
              >
                Delete
              </Button>
            </Dialog.Action>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}
