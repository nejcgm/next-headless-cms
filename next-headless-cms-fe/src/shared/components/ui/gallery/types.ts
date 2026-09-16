import type { ReactNode } from "react";
import type { BoxStyle } from "@shared/utils/box-style";
import type { BlockInstance } from "@core/types/page";

export type GalleryColumnCount = "1" | "2" | "3" | "4";

export type GalleryProps = BoxStyle & {
  heading?: string;
  subheading?: string;
  layout?: "grid" | "masonry";
  columnsMobile?: GalleryColumnCount;
  columnsTablet?: GalleryColumnCount;
  columnsDesktop?: GalleryColumnCount;
  gap?: string;
  blockId?: string;
  children?: ReactNode;
  slotNodes?: Record<string, BlockInstance[]>;
};
