"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ImageLightbox } from "@shared/components/ui/image-lightbox";
import type { GalleryProps } from "./types";

const INITIAL_VISIBLE_COUNT = 10;

export function Gallery({
  heading,
  subheading,
  images,
  defaultImageAlt,
  showLessLabel,
  showMorePrefix,
  showMoreSuffix,
  lightboxAltPrefix,
}: GalleryProps) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const totalImages = images.length;
  const limitedImages = useMemo(
    () => (expanded ? images : images.slice(0, INITIAL_VISIBLE_COUNT)),
    [expanded, images]
  );

  const allImageUrls = useMemo(() => images.map((image) => image.src), [images]);

  const cardClassForIndex = (idx: number): string => {
    if (idx % 7 === 0) return "col-span-2 row-span-2";
    if (idx % 5 === 0) return "row-span-2";
    return "";
  };

  return (
    <section className="py-16 md:py-24 px-4 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-3">
            {heading}
          </h2>
          {subheading && (
            <p className="text-[var(--color-muted-foreground)] text-lg max-w-3xl mx-auto">
              {subheading}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[120px] md:auto-rows-[140px] gap-3 md:gap-4">
          {limitedImages.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              className={`relative overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-muted)] cursor-zoom-in ${cardClassForIndex(index)}`}
              onClick={() => {
                const originalIndex = images.findIndex((img) => img.src === image.src);
                setLightboxIndex(originalIndex >= 0 ? originalIndex : index);
                setLightboxOpen(true);
              }}
            >
              <Image
                src={image.src}
                alt={image.alt ?? defaultImageAlt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {totalImages > INITIAL_VISIBLE_COUNT && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
            >
              {expanded
                ? showLessLabel
                : `${showMorePrefix}${totalImages - INITIAL_VISIBLE_COUNT}${showMoreSuffix}`}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {expanded ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                )}
              </svg>
            </button>
          </div>
        )}
      </div>

      <ImageLightbox
        images={allImageUrls}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        altPrefix={lightboxAltPrefix}
      />
    </section>
  );
}
