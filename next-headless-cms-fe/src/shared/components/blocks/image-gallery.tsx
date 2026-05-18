"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@shared/utils/cn";

interface Image {
  src: string;
  alt: string;
}

interface ImageGalleryProps {
  heading?: string;
  images: Image[];
  columns?: 2 | 3 | 4;
  lightbox?: boolean;
}

export function ImageGallery({ heading, images, columns = 4, lightbox = false }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  }[columns];

  return (
    <section className="py-16 px-4 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">
        {heading && (
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-10 text-center text-[var(--color-foreground)]">
            {heading}
          </h2>
        )}
        <div className={cn("grid gap-4", gridCols)}>
          {images.map((image, index) => (
            <div
              key={index}
              className={cn(
                "group relative aspect-square cursor-pointer overflow-hidden rounded-[var(--radius)]",
                columns === 4 && index === 0 ? "col-span-2 row-span-2" : ""
              )}
              onClick={() => lightbox && setSelectedImage(image)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes={
                  columns === 4 && index === 0
                    ? "(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
                    : "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Image
            src={selectedImage.src}
            alt={selectedImage.alt}
            width={1600}
            height={1200}
            className="max-h-[90vh] max-w-full object-contain"
            sizes="100vw"
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setSelectedImage(null)}
          >
            &times;
          </button>
        </div>
      )}
    </section>
  );
}
