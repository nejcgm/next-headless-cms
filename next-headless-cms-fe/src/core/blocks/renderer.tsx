import { Suspense } from "react";
import type { BlockInstance } from "@core/types/page";
import { resolveBlock } from "./registry";
import { cn } from "@shared/utils/cn";

interface Props {
  blocks: BlockInstance[];
  tenant: string;
  locale: string;
  slug?: string;
}

export async function BlockRenderer({ blocks, tenant, locale, slug }: Props) {
  const renderedBlocks = await Promise.all(
    blocks.map(async (block) => {
      const definition = resolveBlock(tenant, block.type);
      
      if (!definition) {
        if (process.env.NODE_ENV === "development") {
          return <UnknownBlock key={block.id} type={block.type} />;
        }
        return null;
      }

      // Check visibility conditions
      if (block.visibility) {
        // Skip if locale doesn't match
        if (block.visibility.locales && !block.visibility.locales.includes(locale)) {
          return null;
        }
      }

      let extraData = {};
      if (definition.dataContract) {
        try {
          extraData = await definition.dataContract(block.props, { tenant, locale, slug });
        } catch (error) {
          console.error(`Data contract failed for block ${block.type}:`, error);
        }
      }

      const Component = definition.component;

      return (
        <Suspense key={block.id} fallback={<BlockSkeleton />}>
          <Component {...block.props} {...extraData} blockId={block.id} />
        </Suspense>
      );
    })
  );

  return <>{renderedBlocks}</>;
}

function UnknownBlock({ type }: { type: string }) {
  return (
    <div className="border-2 border-dashed border-amber-400 bg-amber-50 p-4 rounded-lg text-sm text-amber-800 my-4">
      Unknown block type: <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">{type}</code>
    </div>
  );
}

function BlockSkeleton() {
  return <div className="animate-pulse bg-muted h-48 rounded-lg my-4" />;
}
