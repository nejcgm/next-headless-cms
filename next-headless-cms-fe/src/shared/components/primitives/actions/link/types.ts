import type { ReactNode } from "react";
import type { BoxStyle } from "@shared/utils/box-style";

export type LinkBlockProps = Pick<
  BoxStyle,
  "padding" | "backgroundColor" | "color" | "borderWidth" | "borderStyle" | "borderColor"
> & {
  href: string;
  target?: "_self" | "_blank";
  showArrow?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "link";
  fontSize?: number;
  fontWeight?: number;
  textAlign?: "left" | "center" | "right";
  borderRadius?: number;
  accessibleLabel?: string;
  blockId?: string;
  children?: ReactNode;
};
