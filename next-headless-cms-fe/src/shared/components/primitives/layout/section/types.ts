import type { BoxStyle } from "@shared/utils/box-style";

export type SectionProps = Omit<BoxStyle, "padding" | "backgroundColor"> & {
  padding?: "sm" | "md" | "lg";
  backgroundImage?: string;
  backgroundFit?: "cover" | "contain";
  overlay?: number;
  anchorId?: string;
  surface?: "background" | "muted" | "accent" | "foreground";
  heroHeight?: "standard" | "tall";
  justify?: "start" | "center" | "end";
  align?: "start" | "center" | "end";
  blockId?: string;
};
