import type { ComponentType } from "react";
import type { ZodSchema } from "zod";

export interface BlockDefinition {
  component: ComponentType<any>;
  schema?: ZodSchema;
  dataContract?: DataContractFn;
}

export type DataContractFn = (
  props: Record<string, unknown>,
  ctx: { tenant: string; locale: string; slug?: string }
) => Promise<Record<string, unknown>>;

export type BlockRegistry = Record<string, BlockDefinition>;
