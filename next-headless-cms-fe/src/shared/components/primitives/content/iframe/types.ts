import type { BoxStyle } from "@shared/utils/box-style";

export type IframeProps = BoxStyle & {
  src: string;
  title: string;
  allowFullscreen?: boolean;
  aspect?: "auto" | "16:9" | "4:3" | "1:1" | "21:9";
  blockId?: string;
};
