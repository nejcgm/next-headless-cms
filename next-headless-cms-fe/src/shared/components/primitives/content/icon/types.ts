import type { BoxStyle } from "@shared/utils/box-style";
import type { ICON_NAMES } from "./icon-names";

export type IconName = (typeof ICON_NAMES)[number];

export type IconProps = BoxStyle & {
  name: IconName;
  label?: string;
  size?: number;
  blockId?: string;
};
