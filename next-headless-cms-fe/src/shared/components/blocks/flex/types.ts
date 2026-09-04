import type { BoxStyleProps } from "@shared/utils/box-style";

export type FlexProps = BoxStyleProps & {
  direction?: "row" | "column";
  gap?: "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
  blockId?: string;
};
