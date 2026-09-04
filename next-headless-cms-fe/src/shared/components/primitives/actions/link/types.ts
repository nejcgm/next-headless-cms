import type { BoxStyle } from "@shared/utils/box-style";

export type LinkBlockProps = BoxStyle & {
  label: string;
  href: string;
  variant?: "accent" | "muted";
  showArrow?: boolean;
  blockId?: string;
};
