import type { BlockInstance } from "@core/types/page";
import { resolveBlock, resolveBlockPolicy } from "@core/blocks/registry";
import type { CompositionPolicy } from "@core/blocks/types";
import { logger } from "@shared/lib/logger";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

const DEFAULT_LEAF_POLICY: CompositionPolicy = {
  level: 3,
  maxDepth: 1,
  slots: {},
};

function componentTypeName(component: string): string {
  return component.includes(".") ? component.split(".").pop()! : component;
}

function subtreeHeight(node: BlockInstance): number {
  if (!node.slots) return 1;
  let maxChild = 0;
  for (const children of Object.values(node.slots)) {
    for (const child of children) {
      maxChild = Math.max(maxChild, subtreeHeight(child));
    }
  }
  return 1 + maxChild;
}

function warnCompose(message: string, meta?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") {
    logger.warn(message, meta);
  }
}

function stripProps(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (key === "__component" || key === "slots") continue;
    if (Array.isArray(val)) {
      result[key] = val.map((item) =>
        isPlainObject(item) ? stripProps(item) : item
      );
    } else if (isPlainObject(val)) {
      result[key] = stripProps(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

export function toValidatedBlockInstance({
  raw,
  index,
  tenantId,
}: {
  raw: unknown;
  index: number;
  tenantId: string;
}): BlockInstance | null {
  if (!isPlainObject(raw)) return null;

  const { __component, id, slots: rawSlots, ...rest } = raw;
  if (typeof __component !== "string") return null;

  const type = componentTypeName(__component);
  const definition = resolveBlock(tenantId, type);

  if (!definition) {
    warnCompose(`Compose: unknown block type dropped`, { type });
    return null;
  }

  const props = stripProps(rest as Record<string, unknown>);

  if (definition.schema) {
    const parsed = definition.schema.safeParse(props);
    if (!parsed.success) {
      warnCompose(`Compose: props failed schema for "${type}"`, {
        issues: parsed.error.issues.map(
          (i) => `${i.path.join(".") || "(root)"}: ${i.message}`
        ),
      });
      return null;
    }
  }

  const policy =
    resolveBlockPolicy(tenantId, type) ??
    definition.policy ??
    DEFAULT_LEAF_POLICY;
  const blockId =
    typeof id === "number" || typeof id === "string"
      ? String(id)
      : `${type}-${index}`;

  const node: BlockInstance = {
    id: blockId,
    type,
    props,
  };

  if (!isPlainObject(rawSlots) || Object.keys(policy.slots).length === 0) {
    if (isPlainObject(rawSlots) && Object.keys(rawSlots).length > 0) {
      warnCompose(`Compose: slots ignored on leaf/non-nesting type`, { type });
    }
    return node;
  }

  const slots: Record<string, BlockInstance[]> = {};

  for (const [slotName, slotRaw] of Object.entries(rawSlots)) {
    const slotPolicy = policy.slots[slotName];
    if (!slotPolicy) {
      warnCompose(`Compose: unknown slot dropped`, { type, slotName });
      continue;
    }
    if (!Array.isArray(slotRaw)) {
      warnCompose(`Compose: slot value is not an array`, { type, slotName });
      continue;
    }

    const children: BlockInstance[] = [];
    for (let i = 0; i < slotRaw.length; i++) {
      if (
        slotPolicy.maxItems != null &&
        children.length >= slotPolicy.maxItems
      ) {
        warnCompose(`Compose: slot maxItems exceeded`, { type, slotName });
        break;
      }

      const child = toValidatedBlockInstance({
        raw: slotRaw[i],
        index: i,
        tenantId,
      });
      if (!child) continue;

      if (!slotPolicy.allow.includes(child.type)) {
        warnCompose(`Compose: child type not allowlisted`, {
          type,
          slotName,
          childType: child.type,
        });
        continue;
      }

      children.push(child);
    }

    if (children.length > 0) {
      slots[slotName] = children;
    }
  }

  if (Object.keys(slots).length > 0) {
    node.slots = slots;
  }

  if (subtreeHeight(node) > policy.maxDepth) {
    warnCompose(`Compose: maxDepth exceeded; nested slots dropped`, {
      type,
      maxDepth: policy.maxDepth,
      height: subtreeHeight(node),
    });
    delete node.slots;
  }

  return node;
}
