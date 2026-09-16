import type { BoxStyle } from "@shared/utils/box-style";

export type GridColumnCount = "1" | "2" | "3" | "4";

export type GridProps = BoxStyle & {
  columnsMobile?: GridColumnCount;
  columnsTablet?: GridColumnCount;
  columnsDesktop?: GridColumnCount;
  gap?: string;
  blockId?: string;
};
