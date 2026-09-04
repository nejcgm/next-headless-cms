import type { BoxStyle } from "@shared/utils/box-style";

export type FlexProps = BoxStyle & {
  direction?: "row" | "column";
  gap?: "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
  blockId?: string;
};
