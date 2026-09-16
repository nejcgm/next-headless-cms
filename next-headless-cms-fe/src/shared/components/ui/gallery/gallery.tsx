"use client";

import { useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "@shared/utils/cn";
import { toBoxStyle, toCssSize } from "@shared/utils/box-style";
import { ImageLightbox } from "@shared/components/static/image-lightbox/image-lightbox";
import type { GalleryColumnCount, GalleryProps } from "./types";

const GRID_COLS: Record<GalleryColumnCount, string> = {
  "1": "grid-cols-1",
  "2": "grid-cols-2",
  "3": "grid-cols-3",
  "4": "grid-cols-4",
};

const GRID_COLS_MD: Record<GalleryColumnCount, string> = {
  "1": "md:grid-cols-1",
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-3",
  "4": "md:grid-cols-4",
};

const GRID_COLS_LG: Record<GalleryColumnCount, string> = {
  "1": "lg:grid-cols-1",
  "2": "lg:grid-cols-2",
  "3": "lg:grid-cols-3",
  "4": "lg:grid-cols-4",
};

const COLUMNS: Record<GalleryColumnCount, string> = {
  "1": "columns-1",
  "2": "columns-2",
  "3": "columns-3",
  "4": "columns-4",
};

const COLUMNS_MD: Record<GalleryColumnCount, string> = {
  "1": "md:columns-1",
  "2": "md:columns-2",
  "3": "md:columns-3",
  "4": "md:columns-4",
};

const COLUMNS_LG: Record<GalleryColumnCount, string> = {
  "1": "lg:columns-1",
  "2": "lg:columns-2",
  "3": "lg:columns-3",
  "4": "lg:columns-4",
};

export function Gallery({
  heading,
  subheading,
  layout = "grid",
  columnsMobile = "2",
  columnsTablet = "3",
  columnsDesktop,
  gap = "16",
  children,
  className,
  slotNodes,
  ...box
}: GalleryProps & { children?: ReactNode; className?: string; blockId?: string }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const imageSrcs = useMemo(() => {
    const imageNodes = slotNodes?.default ?? [];
    return imageNodes
      .filter((node) => node.type === "image")
      .map((node) => (typeof node.props.src === "string" ? node.props.src : ""))
      .filter(Boolean);
  }, [slotNodes]);

  const layoutClass =
    layout === "masonry"
      ? cn(
          COLUMNS[columnsMobile],
          columnsTablet && COLUMNS_MD[columnsTablet],
          columnsDesktop && COLUMNS_LG[columnsDesktop],
          "[&>*]:mb-4 [&>*]:break-inside-avoid"
        )
      : cn(
          "grid",
          GRID_COLS[columnsMobile],
          columnsTablet && GRID_COLS_MD[columnsTablet],
          columnsDesktop && GRID_COLS_LG[columnsDesktop]
        );

  const handleGridClick = (event: MouseEvent<HTMLDivElement>) => {
    const container = gridRef.current;
    if (!container || imageSrcs.length === 0) return;
    let el = event.target as HTMLElement | null;
    while (el && el.parentElement !== container) el = el.parentElement;
    if (!el) return;
    const index = Array.from(container.children).indexOf(el);
    if (index === -1) return;
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section
      className={cn("py-16 md:py-24 px-4 bg-[var(--color-background)]", className)}
      style={toBoxStyle(box)}
    >
      <div className="max-w-6xl mx-auto">
        {(heading || subheading) && (
          <div className="text-center mb-10">
            {heading && (
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-3">
                {heading}
              </h2>
            )}
            {subheading && (
              <p className="text-[var(--color-muted-foreground)] text-lg max-w-3xl mx-auto">
                {subheading}
              </p>
            )}
          </div>
        )}
        <div
          ref={gridRef}
          className={cn(layoutClass, imageSrcs.length > 0 && "[&>*]:cursor-zoom-in")}
          style={{ gap: toCssSize(gap) }}
          onClick={imageSrcs.length > 0 ? handleGridClick : undefined}
        >
          {children}
        </div>
      </div>

      <ImageLightbox
        images={imageSrcs}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        altPrefix={heading ?? "Image"}
      />
    </section>
  );
}
