import type { BlockRegistry } from "./types";

const sharedBlocks: BlockRegistry = {};
const tenantBlocks: Record<string, BlockRegistry> = {};

export function registerSharedBlocks(blocks: BlockRegistry) {
  Object.assign(sharedBlocks, blocks);
}

export function registerTenantBlocks(tenantId: string, blocks: BlockRegistry) {
  tenantBlocks[tenantId] = { ...tenantBlocks[tenantId], ...blocks };
}

export function resolveBlock(tenantId: string, blockType: string) {
  return tenantBlocks[tenantId]?.[blockType] ?? sharedBlocks[blockType] ?? null;
}