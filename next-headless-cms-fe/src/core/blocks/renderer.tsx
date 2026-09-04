import { Suspense, type ReactNode } from "react";
import type { BlockInstance } from "@core/types/page";
import { logger } from "@shared/lib/logger";
import { resolveBlock } from "./registry";
import { pickSearchParams } from "./search-params";
import type {
  BlockRendererProps,
  RenderBlockNodeArgs,
  UnknownBlockProps,
  ValidateBlockPropsArgs,
} from "./types";

function blockReactKey(block: BlockInstance, index: number): string {
  return `${block.type}-${block.id}-${index}`;
}

function validateBlockProps({ type, schema, props }: ValidateBlockPropsArgs): void {
  if (!schema || process.env.NODE_ENV !== "development") return;
  const result = schema.safeParse(props);
  if (!result.success) {
    logger.warn(`Block "${type}" props failed schema validation`, {
      issues: result.error.issues.map(
        (i) => `${i.path.join(".") || "(root)"}: ${i.message}`
      ),
    });
  }
}

function isBlockVisible(block: BlockInstance, locale: string): boolean {
  const v = block.visibility;
  if (!v) return true;
  if (v.locales && !v.locales.includes(locale)) return false;
  if (v.dateRange) {
    const now = Date.now();
    if (v.dateRange.from && now < Date.parse(v.dateRange.from)) return false;
    if (v.dateRange.to && now > Date.parse(v.dateRange.to)) return false;
  }
  return true;
}

async function renderBlockNode({
  block,
  index,
  ctx,
}: RenderBlockNodeArgs): Promise<ReactNode> {
  const key = blockReactKey(block, index);
  const definition = resolveBlock(ctx.tenant, block.type);

  if (!definition) {
    if (process.env.NODE_ENV === "development") {
      return <UnknownBlock key={key} type={block.type} />;
    }
    return null;
  }

  if (!isBlockVisible(block, ctx.locale)) return null;

  const allowlist = definition.acceptSearchParams;
  const searchParams = ctx.searchParams ?? {};
  const propsWithRequest =
    allowlist && allowlist.length > 0
      ? {
          ...block.props,
          ...pickSearchParams(searchParams, allowlist),
        }
      : block.props;

  let extraData: Record<string, unknown> = {};
  if (definition.dataContract) {
    try {
      extraData = await definition.dataContract(propsWithRequest, {
        tenant: ctx.tenant,
        locale: ctx.locale,
        slug: ctx.slug,
        searchParams,
      });
    } catch (error) {
      logger.error(`Data contract failed for block ${block.type}`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const mergedProps = { ...propsWithRequest, ...extraData };
  validateBlockProps({
    type: block.type,
    schema: definition.schema,
    props: mergedProps,
  });

  const slotEntries = block.slots ? Object.entries(block.slots) : [];
  const renderedSlots: Record<string, ReactNode> = {};

  for (const [slotName, children] of slotEntries) {
    const nodes = await Promise.all(
      children.map((child, childIndex) =>
        renderBlockNode({ block: child, index: childIndex, ctx })
      )
    );
    renderedSlots[slotName] = <>{nodes}</>;
  }

  const Component = definition.component;
  const defaultChildren = renderedSlots.default;

  return (
    <Suspense key={key} fallback={<BlockSkeleton />}>
      <Component {...mergedProps} blockId={block.id} slotContents={renderedSlots}>
        {defaultChildren}
      </Component>
    </Suspense>
  );
}

export async function BlockRenderer({
  blocks,
  tenant,
  locale,
  slug,
  searchParams = {},
}: BlockRendererProps) {
  const ctx = { tenant, locale, slug, searchParams };
  const renderedBlocks = await Promise.all(
    blocks.map((block, index) => renderBlockNode({ block, index, ctx }))
  );

  return <>{renderedBlocks}</>;
}

function UnknownBlock({ type }: UnknownBlockProps) {
  return (
    <div className="border-2 border-dashed border-amber-400 bg-amber-50 p-4 rounded-lg text-sm text-amber-800 my-4">
      Unknown block type: <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">{type}</code>
    </div>
  );
}

function BlockSkeleton() {
  return <div className="animate-pulse bg-muted h-48 rounded-lg my-4" />;
}
