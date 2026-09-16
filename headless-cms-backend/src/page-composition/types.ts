export type SlotsMap = {
  default?: CompositionNode[];
  [slot: string]: CompositionNode[] | undefined;
};

export type CompositionNode = {
  __component: string;
  id?: number | string;
  __temp_key__?: string;
  slots?: SlotsMap | string;
  children?: CompositionNode[];
  [key: string]: unknown;
};

export type ValidateResult = { ok: true } | { ok: false; message: string };
