import type { BoxStyleProps } from "@shared/utils/box-style";

export type StackProps = BoxStyleProps & {
  gap?: "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
  blockId?: string;
};
