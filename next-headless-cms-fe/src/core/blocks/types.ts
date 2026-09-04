import type { ComponentType } from "react";
import type { ZodSchema } from "zod";
import type { BlockInstance } from "@core/types/page";

export type SearchParamsInput = Record<
  string,
  string | string[] | undefined
>;

export type NormalizedSearchParams = Record<string, string | undefined>;

export interface BlockRenderContext {
  tenant: string;
  locale: string;
  slug?: string;
  searchParams: NormalizedSearchParams;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry accepts heterogeneous block props
type BlockComponent = ComponentType<any>;

export interface SlotPolicy {
  allow: string[];
  maxItems?: number;
}

export interface CompositionPolicy {
  level: 1 | 2 | 3;
  maxDepth: number;
  slots: Record<string, SlotPolicy>;
}

export interface BlockDefinition {
  component: BlockComponent;
  schema?: ZodSchema;
  policy?: CompositionPolicy;
  dataContract?: DataContractFn;
  acceptSearchParams?: string[];
}

export type DataContractFn = (
  props: Record<string, unknown>,
  ctx: BlockRenderContext
) => Promise<Record<string, unknown>>;

export type BlockRegistry = Record<string, BlockDefinition>;

export interface BlockRendererProps {
  blocks: BlockInstance[];
  tenant: string;
  locale: string;
  slug?: string;
  searchParams?: NormalizedSearchParams;
}

export interface RenderBlockNodeArgs {
  block: BlockInstance;
  index: number;
  ctx: {
    tenant: string;
    locale: string;
    slug?: string;
    searchParams: BlockRendererProps["searchParams"];
  };
}

export interface ValidateBlockPropsArgs {
  type: string;
  schema: ZodSchema | undefined;
  props: Record<string, unknown>;
}

export interface UnknownBlockProps {
  type: string;
}
