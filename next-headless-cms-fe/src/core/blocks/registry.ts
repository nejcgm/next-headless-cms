import type { BlockDefinition, BlockRegistry, CompositionPolicy } from "./types";

const sharedBlocks: BlockRegistry = {};
const tenantBlocks: Record<string, BlockRegistry> = {};
const tenantLayoutNestAllow: Record<string, string[]> = {};

export function registerSharedBlocks(blocks: BlockRegistry) {
  Object.assign(sharedBlocks, blocks);
}

export function registerTenantBlocks(tenantId: string, blocks: BlockRegistry) {
  tenantBlocks[tenantId] = { ...tenantBlocks[tenantId], ...blocks };
}

export function registerTenantLayoutNestAllow(
  tenantId: string,
  types: string[]
): void {
  const existing = tenantLayoutNestAllow[tenantId] ?? [];
  tenantLayoutNestAllow[tenantId] = [
    ...new Set([...existing, ...types]),
  ];
}

export function resolveBlock(
  tenantId: string,
  blockType: string
): BlockDefinition | null {
  return tenantBlocks[tenantId]?.[blockType] ?? sharedBlocks[blockType] ?? null;
}

function withTenantNestAllow(
  tenantId: string,
  policy: CompositionPolicy
): CompositionPolicy {
  const extras = tenantLayoutNestAllow[tenantId];
  if (!extras?.length || Object.keys(policy.slots).length === 0) {
    return policy;
  }

  const slots: CompositionPolicy["slots"] = {};
  for (const [slotName, slot] of Object.entries(policy.slots)) {
    slots[slotName] = {
      ...slot,
      allow: [...new Set([...slot.allow, ...extras])],
    };
  }
  return { ...policy, slots };
}

export function resolveBlockPolicy(
  tenantId: string,
  blockType: string
): CompositionPolicy | undefined {
  const policy = resolveBlock(tenantId, blockType)?.policy;
  if (!policy) return undefined;
  return withTenantNestAllow(tenantId, policy);
}