import type { BoxStyleProps } from "@shared/utils/box-style";

export type SectionProps = Omit<BoxStyleProps, "padding"> & {
  padding?: "sm" | "md" | "lg";
  backgroundImage?: string;
  backgroundFit?: "cover" | "contain";
  overlay?: number;
  anchorId?: string;
  surface?: string;
  justify?: "start" | "center" | "end";
  align?: "start" | "center" | "end";
  blockId?: string;
};
