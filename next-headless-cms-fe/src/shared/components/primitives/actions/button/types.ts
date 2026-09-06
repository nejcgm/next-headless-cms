import type { BoxStyle } from "@shared/utils/box-style";

export type ButtonBlockProps = BoxStyle & {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "outline";
  blockId?: string;
};
