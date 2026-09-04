import type { BoxStyleProps } from "@shared/utils/box-style";

export type ButtonBlockProps = BoxStyleProps & {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
  blockId?: string;
};
