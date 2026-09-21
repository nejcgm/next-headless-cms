import "server-only";

import type { BlockInstance } from "@core/types/page";
import { toValidatedBlockInstance } from "@core/data/strapi/compose-validate";
import type { ComposePreviewWrite, LiveBlocksArgs } from "./types";

const TTL_MS = 120_000;

type Overlay = {
  blocks: BlockInstance[];
  updatedAt: number;
};

const store = new Map<string, Overlay>();

function keyFor(locale: string, slug: string): string {
  return `${locale}:${slug}`;
}

export function writeComposePreview({
  locale,
  slug,
  rawBlocks,
  tenantId,
}: ComposePreviewWrite): void {
  const blocks = rawBlocks.flatMap((item, index) => {
    const block = toValidatedBlockInstance({ raw: item, index, tenantId });
    return block ? [block] : [];
  });
  store.set(keyFor(locale, slug), { blocks, updatedAt: Date.now() });
}

export function readComposePreview(locale: string, slug: string): BlockInstance[] | null {
  const entry = store.get(keyFor(locale, slug));
  if (!entry) return null;
  if (Date.now() - entry.updatedAt > TTL_MS) {
    store.delete(keyFor(locale, slug));
    return null;
  }
  return entry.blocks;
}

export function blocksForLiveCompose({
  enabled,
  locale,
  slug,
  saved,
}: LiveBlocksArgs): BlockInstance[] {
  if (!enabled) return saved;
  return readComposePreview(locale, slug) ?? saved;
}
