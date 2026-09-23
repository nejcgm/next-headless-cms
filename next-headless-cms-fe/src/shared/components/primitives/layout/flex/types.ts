import type { BoxStyle } from "@shared/utils/box-style";

export type FlexProps = BoxStyle & {
  direction?: "row" | "column";
  gap?: string;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: boolean;
  backgroundImage?: string;
  overlay?: number;
  anchorId?: string;
  blockId?: string;
};
