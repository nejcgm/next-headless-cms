import type { BlockInstance } from "@core/types/page";

export type ComposePreviewListenerProps = {
  locale: string;
  slug: string;
  adminOrigin: string;
};

export type ComposePreviewWrite = {
  locale: string;
  slug: string;
  rawBlocks: unknown[];
  tenantId: string;
};

export type LiveBlocksArgs = {
  enabled: boolean;
  locale: string;
  slug: string;
  saved: BlockInstance[];
};

export type ComposePreviewRequest =
  | {
      ok: true;
      locale: string;
      slug: string;
      blocks: unknown[];
    }
  | {
      ok: false;
      status: number;
      error: string;
    };
