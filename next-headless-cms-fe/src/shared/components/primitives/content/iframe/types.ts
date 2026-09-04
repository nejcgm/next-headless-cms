import type { BoxStyle } from "@shared/utils/box-style";

export type IframeProps = BoxStyle & {
  src: string;
  title: string;
  allowFullscreen?: boolean;
  aspect?: "video" | "map" | "square";
};
