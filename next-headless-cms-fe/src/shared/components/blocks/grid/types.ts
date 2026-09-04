import type { BoxStyleProps } from "@shared/utils/box-style";

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

export type GridProps = BoxStyleProps & {
  columns?: GridColumns;
  gap?: "sm" | "md" | "lg";
  blockId?: string;
};
