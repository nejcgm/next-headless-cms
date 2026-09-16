import type { BoxStyle } from "@shared/utils/box-style";

export type SectionProps = Omit<BoxStyle, "backgroundColor" | "overflow" | "minHeight"> & {
  backgroundImage?: string;
  backgroundFit?: "cover" | "contain";
  backgroundPosition?: "center" | "top" | "bottom" | "left" | "right";
  overlay?: number;
  anchorId?: string;
  width?: "full" | "contained";
  minHeight?: "standard" | "tall";
  surface?: "background" | "muted" | "accent" | "foreground";
  divider?: "none" | "top" | "bottom" | "both";
  overflow?: "visible" | "hidden";
  blockId?: string;
};
