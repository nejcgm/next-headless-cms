import type { BoxStyle } from "@shared/utils/box-style";

export type GridColumns =
  | 1
  | 2
  | 3
  | 4
  | {
      mobile: 1 | 2 | 3 | 4;
      tablet?: 1 | 2 | 3 | 4;
      desktop?: 1 | 2 | 3 | 4;
    };

// Strapi enumeration fields are always strings ("1"-"4"), unlike the legacy
// `columns` field which carries real numbers — kept distinct rather than coerced
// at the schema boundary so the Strapi-sourced shape is self-evident here.
export type GridColumnCount = "1" | "2" | "3" | "4";

export type GridProps = BoxStyle & {
  columns?: GridColumns;
  columnsMobile?: GridColumnCount;
  columnsTablet?: GridColumnCount;
  columnsDesktop?: GridColumnCount;
  gap?: "sm" | "md" | "lg";
  blockId?: string;
};
