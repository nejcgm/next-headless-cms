"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageLightbox } from "@shared/components/ui/image-lightbox";
import type { HotelInfoProps } from "./types";

export function HotelInfo({ hotel }: HotelInfoProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!hotel) {
    return (
      <section className="py-20 px-4 bg-[var(--color-background)]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[var(--color-muted-foreground)]">Hotel information unavailable</p>
        </div>
      </section>
    );
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const displayImages = hotel.images.slice(0, 5);
  const hasMoreImages = hotel.images.length > 5;

  return (
    <section className="py-16 lg:py-24 px-4 bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto">
        {/* Image Gallery Grid */}
        <div className="mb-12">
          {displayImages.length > 0 ? (
            <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[500px] lg:h-[600px]">
              {/* Main large image */}
              <div
                className="col-span-2 row-span-2 relative rounded-[var(--radius)] overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(0)}
              >
                <Image
                  src={displayImages[0]}
                  alt={`${hotel.name} — main photo`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Click to view gallery</span>
                </div>
              </div>

              {/* Secondary images */}
              {displayImages.slice(1, 4).map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="relative rounded-[var(--radius)] overflow-hidden cursor-pointer group"
                  onClick={() => openLightbox(i + 1)}
                >
                  <Image
                    src={url}
                    alt={`${hotel.name} — photo ${i + 2}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 25vw, 12vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}

              {/* Fifth image with "View All" overlay if there are more */}
              {displayImages[4] && (
                <div
                  className="relative rounded-[var(--radius)] overflow-hidden cursor-pointer group"
                  onClick={() => openLightbox(4)}
                >
                  <Image
                    src={displayImages[4]}
                    alt={`${hotel.name} — photo 5`}
                    fill
                    className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                      hasMoreImages ? "brightness-75" : ""
                    }`}
                    sizes="(max-width: 1024px) 25vw, 12vw"
                  />
                  {hasMoreImages && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        +{hotel.images.length - 5} more
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              )}

              {/* Show all button in empty slot if less than 5 images */}
              {displayImages.length < 5 && hotel.images.length > displayImages.length && (
                <div
                  className="relative rounded-[var(--radius)] overflow-hidden cursor-pointer bg-[var(--color-muted)] flex items-center justify-center group"
                  onClick={() => openLightbox(displayImages.length)}
                >
                  <span className="text-[var(--color-text-primary)] font-medium group-hover:text-[var(--color-primary)] transition-colors">
                    View all {hotel.images.length} photos
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[400px] bg-[var(--color-muted)] rounded-[var(--radius)] flex items-center justify-center">
              <p className="text-[var(--color-muted-foreground)]">No images available</p>
            </div>
          )}

          {/* View All Gallery Button */}
          {hotel.images.length > 0 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => openLightbox(0)}
                className="flex items-center gap-2 px-6 py-3 border border-[var(--color-border)] rounded-[var(--radius)] text-[var(--color-text-primary)] hover:bg-[var(--color-muted)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View all {hotel.images.length} photos
              </button>
            </div>
          )}
        </div>

        {/* Hotel Info Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Rating */}
            <div>
              <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                <h1 className="font-heading text-4xl lg:text-5xl font-bold text-[var(--color-primary)]">
                  {hotel.name}
                </h1>
                {hotel.rating > 0 && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-[var(--color-primary)]/5 rounded-[var(--radius)]">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-[var(--color-primary)]">
                        {hotel.rating}
                      </span>
                      <span className="text-[var(--color-muted-foreground)] text-sm">/10</span>
                    </div>
                    <div className="text-sm text-[var(--color-muted-foreground)]">
                      {hotel.reviewCount > 0 && <p>{hotel.reviewCount} reviews</p>}
                      <p className="text-[var(--color-primary)]">Excellent</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              {hotel.city && (
                <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
                  <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>
                    {hotel.address}, {hotel.city}, {hotel.country} {hotel.zip}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {hotel.description && (
              <div className="prose max-w-none">
                <p className="text-lg text-[var(--color-text-primary)] leading-relaxed">
                  {hotel.description}
                </p>
              </div>
            )}

            {/* Important Info */}
            {hotel.importantInfo && (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-[var(--radius)]">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-amber-800">{hotel.importantInfo}</p>
                </div>
              </div>
            )}

            {/* Amenities / Facilities */}
            {hotel.facilities.length > 0 && (
              <div>
                <h3 className="font-heading text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                  Hotel amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.facilities.slice(0, 12).map((facility, i) => (
                    <div
                      key={`${facility}-${i}`}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius)] bg-[var(--color-muted)]/50"
                    >
                      <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[var(--color-text-primary)] text-sm">{facility}</span>
                    </div>
                  ))}
                </div>
                {hotel.facilities.length > 12 && (
                  <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                    +{hotel.facilities.length - 12} more amenities
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Check-in/out & Quick Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Check-in/out Card */}
              <div className="p-6 bg-white border border-[var(--color-border)] rounded-[var(--radius)] shadow-sm">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Property info</h3>

                <div className="space-y-4">
                  {(hotel.checkin || hotel.checkout) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Check-in</p>
                        <p className="font-semibold text-[var(--color-text-primary)]">
                          {hotel.checkin || "Flexible"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-muted-foreground)] mb-1">Check-out</p>
                        <p className="font-semibold text-[var(--color-text-primary)]">
                          {hotel.checkout || "Flexible"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Policies */}
                  <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
                    {hotel.petsAllowed !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {hotel.petsAllowed ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          )}
                        </svg>
                        <span className={hotel.petsAllowed ? "text-green-700" : "text-red-600"}>
                          Pets {hotel.petsAllowed ? "allowed" : "not allowed"}
                        </span>
                      </div>
                    )}
                    {hotel.childAllowed !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {hotel.childAllowed ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          )}
                        </svg>
                        <span className={hotel.childAllowed ? "text-green-700" : "text-red-600"}>
                          Children {hotel.childAllowed ? "welcome" : "not allowed"}
                        </span>
                      </div>
                    )}
                    {hotel.stars && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-[var(--color-text-primary)]">{hotel.stars}-star property</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <a
                href="/rooms"
                className="block w-full py-4 bg-[var(--color-primary)] text-white text-center font-semibold rounded-[var(--radius)] hover:bg-[var(--color-primary)]/90 transition-colors"
              >
                View Rooms & Rates
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={hotel.images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        altPrefix={hotel.name}
      />
    </section>
  );
}
