import type { BoxStyle } from "@shared/utils/box-style";

export type IconName = "map-pin" | "phone" | "mail";

export type IconProps = BoxStyle & {
  name: IconName;
  label?: string;
  size?: "sm" | "md" | "lg";
  blockId?: string;
};
