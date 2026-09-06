import type { BoxStyle } from "@shared/utils/box-style";

export type LinkBlockProps = BoxStyle & {
  label: string;
  href: string;
  variant?: "primary" | "muted";
  showArrow?: boolean;
  blockId?: string;
};
