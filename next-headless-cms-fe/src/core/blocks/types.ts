import type { ComponentType } from "react";
import type { ZodSchema } from "zod";
import type { NormalizedSearchParams } from "./search-params";

export interface BlockRenderContext {
  tenant: string;
  locale: string;
  slug?: string;
  searchParams: NormalizedSearchParams;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry accepts heterogeneous block props
type BlockComponent = ComponentType<any>;

export interface BlockDefinition {
  component: BlockComponent;
  schema?: ZodSchema;
  dataContract?: DataContractFn;
  acceptSearchParams?: string[];
}

export type DataContractFn = (
  props: Record<string, unknown>,
  ctx: BlockRenderContext
) => Promise<Record<string, unknown>>;

export type BlockRegistry = Record<string, BlockDefinition>;
