import type { BoxStyle } from "@shared/utils/box-style";

export type StackProps = BoxStyle & {
  gap?: "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
  blockId?: string;
};
