"use client";

import Image from "next/image";
import { useState } from "react";
import type { BikeDetailProps } from "./types";
import { formatCurrency } from "@shared/utils/format";

export function BikeDetail({ bike, labels }: BikeDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!bike) {
    return (
      <section className="py-16 px-4 bg-[var(--color-background)]">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-heading text-2xl font-bold text-[var(--color-foreground)]">
            {labels.notFoundTitle}
          </h1>
          <p className="text-[var(--color-muted-foreground)] mt-2">
            {labels.notFoundBody}
          </p>
          <a
            href={labels.notFoundCtaHref}
            className="inline-block mt-6 px-6 py-3 bg-[var(--color-primary)] text-white rounded-[var(--radius)] hover:opacity-90 transition-opacity"
          >
            {labels.notFoundCtaLabel}
          </a>
        </div>
      </section>
    );
  }

  const allImages = bike.images?.length ? bike.images : [bike.image];

  return (
    <section className="py-8 md:py-12 px-4 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-[var(--color-muted-foreground)]">
          <a href={labels.breadcrumbHomeHref} className="hover:text-[var(--color-primary)]">
            {labels.breadcrumbHome}
          </a>
          <span className="mx-2">/</span>
          <a href={labels.breadcrumbBikesHref} className="hover:text-[var(--color-primary)]">
            {labels.breadcrumbBikes}
          </a>
          <span className="mx-2">/</span>
          <span className="text-[var(--color-foreground)]">{bike.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-muted)]">
              <Image
                src={allImages[selectedImageIndex]}
                alt={bike.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative aspect-square cursor-pointer overflow-hidden rounded-[var(--radius)] border-2 bg-[var(--color-muted)] transition-all ${
                      i === selectedImageIndex
                        ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                        : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${bike.name} - ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 25vw, 12vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full uppercase tracking-wide">
                {bike.category}
              </span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mt-3">
                {bike.name}
              </h1>
              <p className="text-[var(--color-muted-foreground)] text-lg mt-2">
                {bike.shortDescription}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 py-4 border-y border-[var(--color-border)]">
              <span className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">
                {formatCurrency(bike.price, "EUR")}
              </span>
              {bike.compareAtPrice && (
                <span className="text-xl text-[var(--color-muted-foreground)] line-through">
                  {formatCurrency(bike.compareAtPrice, "EUR")}
                </span>
              )}
              {!bike.inStock && (
                <span className="ml-auto text-sm font-semibold text-red-500 px-3 py-1 bg-red-500/10 rounded-full">
                  {labels.outOfStock}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-heading text-lg font-semibold text-[var(--color-foreground)] mb-2">
                {labels.descriptionHeading}
              </h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                {bike.description}
              </p>
            </div>

            {/* Specs */}
            {bike.specs && Object.keys(bike.specs).length > 0 && (
              <div>
                <h2 className="font-heading text-lg font-semibold text-[var(--color-foreground)] mb-3">
                  {labels.specsHeading}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(bike.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-3 bg-[var(--color-muted)] rounded-[var(--radius)] border border-[var(--color-border)]"
                    >
                      <p className="text-xs text-[var(--color-muted-foreground)] uppercase">
                        {key}
                      </p>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {bike.tags && bike.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {bike.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs bg-[var(--color-muted)] text-[var(--color-muted-foreground)] rounded-full border border-[var(--color-border)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Contact CTA */}
            <div className="pt-4">
              <p className="text-[var(--color-muted-foreground)] text-sm mb-4">
                {labels.contactTeaser}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={labels.contactPhoneHref}
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[var(--color-primary)] text-white font-semibold rounded-[var(--radius)] hover:opacity-90 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {labels.contactPhoneLabel}
                </a>
                <a
                  href={labels.contactCtaHref}
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold rounded-[var(--radius)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {labels.contactCtaLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
