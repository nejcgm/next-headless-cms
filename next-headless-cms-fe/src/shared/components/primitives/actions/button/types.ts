import type { ReactNode } from "react";
import type { BoxStyle } from "@shared/utils/box-style";

export type ButtonBlockProps = Omit<
  BoxStyle,
  "minWidth" | "minHeight" | "maxWidth" | "maxHeight" | "fontSize" | "fontWeight" | "borderRadius" | "overflow"
> & {
  href: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  fontSize?: number;
  fontWeight?: number;
  textAlign?: "left" | "center" | "right";
  borderRadius?: number;
  overflow?: "visible" | "hidden";
  accessibleLabel?: string;
  blockId?: string;
  children?: ReactNode;
};
