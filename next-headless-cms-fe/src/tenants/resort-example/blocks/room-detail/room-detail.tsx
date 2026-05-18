"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageLightbox } from "@shared/components/ui/image-lightbox";
import type { Room, Hotel } from "../../integrations/grmovsek-hotel/types";
import type { AvailabilityResult } from "../../integrations/grmovsek-hotel/client";

interface RoomDetailProps {
  room: Room;
  hotel: Hotel;
  availability?: AvailabilityResult | null;
  initialCheckin?: string;
  initialCheckout?: string;
  unavailableDates?: string[];
}

export function RoomDetail({
  room,
  hotel,
  availability,
  initialCheckin,
  initialCheckout,
  unavailableDates = [],
}: RoomDetailProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [checkin, setCheckin] = useState(initialCheckin || "");
  const [checkout, setCheckout] = useState(initialCheckout || "");
  const [guests, setGuests] = useState(room.maxAdults);
  const [dateError, setDateError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  // All room photos for the gallery
  const allPhotos = room.mainPhoto ? [room.mainPhoto, ...room.photos] : room.photos;

  // Check if a date is unavailable
  const isDateUnavailable = (date: string): boolean => unavailableDates.includes(date);

  // Get the next available date after a given date
  const getNextAvailableDate = (fromDate: string): string | null => {
    const date = new Date(fromDate);
    for (let i = 1; i <= 30; i++) {
      date.setDate(date.getDate() + 1);
      const dateStr = date.toISOString().split("T")[0];
      if (!isDateUnavailable(dateStr)) return dateStr;
    }
    return null;
  };

  // Validate date selection
  const validateDates = (checkinDate: string, checkoutDate: string): string | null => {
    if (!checkinDate || !checkoutDate) return null;
    if (isDateUnavailable(checkinDate)) return "Check-in date is not available";
    if (isDateUnavailable(checkoutDate)) return "Check-out date is not available";

    const current = new Date(checkinDate);
    const end = new Date(checkoutDate);
    while (current < end) {
      const dateStr = current.toISOString().split("T")[0];
      if (isDateUnavailable(dateStr)) {
        return `Date ${dateStr} is not available for booking`;
      }
      current.setDate(current.getDate() + 1);
    }
    return null;
  };

  const handleCheckinChange = (value: string) => {
    setCheckin(value);
    setDateError(null);
    if (checkout && value >= checkout) {
      const nextAvailable = getNextAvailableDate(value);
      if (nextAvailable) setCheckout(nextAvailable);
    }
  };

  const handleCheckoutChange = (value: string) => {
    setCheckout(value);
    setDateError(null);
  };

  const handleCheckAvailability = () => {
    if (!checkin || !checkout) {
      setDateError("Please select both check-in and check-out dates");
      return;
    }
    const error = validateDates(checkin, checkout);
    if (error) {
      setDateError(error);
      return;
    }
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set("checkin", checkin);
    params.set("checkout", checkout);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  };

  const unavailableMessage = unavailableDates.length > 0
    ? `${unavailableDates.length} dates in the next 60 days are fully booked`
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header / Breadcrumb */}
      <div className="border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            <a href="/" className="hover:text-[var(--color-primary)] transition-colors">Home</a>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <a href="/rooms" className="hover:text-[var(--color-primary)] transition-colors">Rooms</a>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[var(--color-text-primary)] font-medium">{room.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Room Title - Mobile */}
        <div className="lg:hidden mb-6">
          <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)] mb-2">
            {room.name}
          </h1>
          {room.views.length > 0 && (
            <p className="text-[var(--color-text-primary)] font-medium">
              {room.views.join(" · ")}
            </p>
          )}
        </div>

        {/* Image Gallery */}
        <div className="mb-8 lg:mb-12">
          {allPhotos.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4">
              {/* Main Image */}
              <div className="lg:col-span-3 relative">
                <div
                  className="relative aspect-[16/10] lg:aspect-[16/9] rounded-[var(--radius)] overflow-hidden cursor-pointer group bg-[var(--color-muted)]"
                  onClick={() => setLightboxOpen(true)}
                >
                  <Image
                    src={allPhotos[selectedImageIndex]}
                    alt={room.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 75vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Zoom icon */}
                  <div className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-[var(--color-text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>

                  {/* Image counter */}
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 text-white text-sm rounded-full">
                    {selectedImageIndex + 1} / {allPhotos.length}
                  </div>
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="lg:col-span-1">
                <div className="flex lg:flex-col gap-2 lg:gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] scrollbar-hide">
                  {allPhotos.slice(0, 8).map((photo, i) => (
                    <button
                      key={`thumb-${i}`}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`flex-shrink-0 relative w-20 h-14 lg:w-full lg:h-24 rounded-[var(--radius)] overflow-hidden transition-all ${
                        selectedImageIndex === i
                          ? "ring-2 ring-[var(--color-primary)] ring-offset-2"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={photo}
                        alt={`${room.name} thumbnail ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 80px, 25vw"
                      />
                    </button>
                  ))}
                  {allPhotos.length > 8 && (
                    <button
                      onClick={() => setLightboxOpen(true)}
                      className="flex-shrink-0 relative w-20 h-14 lg:w-full lg:h-24 rounded-[var(--radius)] overflow-hidden bg-[var(--color-muted)] flex items-center justify-center"
                    >
                      <span className="text-[var(--color-text-primary)] font-medium text-sm">
                        +{allPhotos.length - 8}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-[var(--color-muted)] rounded-[var(--radius)] flex items-center justify-center">
              <p className="text-[var(--color-muted-foreground)]">No images available</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left column - Room details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Room Title - Desktop */}
            <div className="hidden lg:block">
              <h1 className="font-heading text-4xl font-bold text-[var(--color-primary)] mb-3">
                {room.name}
              </h1>
              {room.views.length > 0 && (
                <p className="text-[var(--color-text-primary)] font-medium text-lg">
                  {room.views.join(" · ")}
                </p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-muted)]/50 rounded-[var(--radius)]">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Guests</p>
                  <p className="font-semibold text-[var(--color-text-primary)]">Up to {room.maxOccupancy}</p>
                </div>
              </div>
              {room.sizeM2 > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-muted)]/50 rounded-[var(--radius)]">
                  <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <div>
                    <p className="text-sm text-[var(--color-muted-foreground)]">Size</p>
                    <p className="font-semibold text-[var(--color-text-primary)]">{room.sizeM2} m²</p>
                  </div>
                </div>
              )}
              {room.bedTypes.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-muted)]/50 rounded-[var(--radius)]">
                  <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <div>
                    <p className="text-sm text-[var(--color-muted-foreground)]">Beds</p>
                    <p className="font-semibold text-[var(--color-text-primary)]">{room.bedTypes.join(", ")}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {room.description && (
              <div>
                <h3 className="font-heading text-xl font-semibold text-[var(--color-text-primary)] mb-3">
                  About this room
                </h3>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed whitespace-pre-line">
                  {room.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {room.amenities.length > 0 && (
              <div>
                <h3 className="font-heading text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                  Room amenities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {room.amenities.map((amenity, i) => (
                    <div
                      key={`${amenity}-${i}`}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius)] bg-[var(--color-muted)]/30 hover:bg-[var(--color-muted)]/50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[var(--color-text-primary)] text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Booking Card */}
              <div className="bg-white rounded-[var(--radius)] border border-[var(--color-border)] p-6 shadow-sm">
                <h3 className="font-heading text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                  Check availability
                </h3>

                {/* Availability notice */}
                {unavailableMessage && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                    <div className="flex items-center gap-2 text-amber-800">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {unavailableMessage}
                    </div>
                  </div>
                )}

                {/* Date picker */}
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={checkin}
                      min={today}
                      onChange={(e) => handleCheckinChange(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all ${
                        checkin && isDateUnavailable(checkin)
                          ? "border-red-500 bg-red-50"
                          : "border-[var(--color-border)]"
                      }`}
                    />
                    {checkin && isDateUnavailable(checkin) && (
                      <p className="mt-1.5 text-sm text-red-600">This date is not available</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={checkout}
                      min={checkin || today}
                      onChange={(e) => handleCheckoutChange(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all ${
                        checkout && isDateUnavailable(checkout)
                          ? "border-red-500 bg-red-50"
                          : "border-[var(--color-border)]"
                      }`}
                    />
                    {checkout && isDateUnavailable(checkout) && (
                      <p className="mt-1.5 text-sm text-red-600">This date is not available</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                      Guests
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-[var(--color-border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
                    >
                      {Array.from({ length: room.maxOccupancy }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "guest" : "guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {dateError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    {dateError}
                  </div>
                )}

                <button
                  onClick={handleCheckAvailability}
                  disabled={!checkin || !checkout || !!dateError || isDateUnavailable(checkin) || isDateUnavailable(checkout)}
                  className="w-full py-4 bg-[var(--color-primary)] text-white font-semibold rounded-[var(--radius)] hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Check Availability
                </button>

                {/* Availability results */}
                {availability && (
                  <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                    {availability.available && availability.rates.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold">Available for your dates!</span>
                        </div>

                        <div className="space-y-3">
                          {availability.rates.slice(0, 3).map((rate) => (
                            <div
                              key={rate.rateId}
                              className="p-4 bg-[var(--color-muted)]/30 rounded-[var(--radius)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold text-[var(--color-text-primary)]">
                                    {rate.boardName}
                                  </p>
                                  <p className="text-sm text-[var(--color-muted-foreground)]">
                                    {rate.name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-[var(--color-primary)] text-xl">
                                    {formatPrice(rate.totalPrice.amount, rate.totalPrice.currency)}
                                  </p>
                                  <p className="text-xs text-[var(--color-muted-foreground)]">
                                    total
                                  </p>
                                </div>
                              </div>

                              {rate.cancellationPolicies && rate.cancellationPolicies.length > 0 && (
                                <p className="text-xs text-green-700 mt-2">
                                  Free cancellation until {new Date(rate.cancellationPolicies[0].deadline).toLocaleDateString()}
                                </p>
                              )}

                              <button className="w-full mt-3 py-2.5 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold rounded-[var(--radius)] hover:bg-[var(--color-primary)] hover:text-white transition-all">
                                Book Now
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-700">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Not available for selected dates</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Hotel Info Card */}
              <div className="p-5 bg-white rounded-[var(--radius)] border border-[var(--color-border)]">
                <h4 className="font-semibold text-[var(--color-text-primary)] mb-2">{hotel.name}</h4>
                <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
                  {hotel.city}, {hotel.country}
                </p>
                {hotel.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="bg-[var(--color-primary)] text-white text-sm font-bold px-2 py-1 rounded">
                      {hotel.rating}
                    </span>
                    <span className="text-sm text-[var(--color-muted-foreground)]">/ 10</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={allPhotos}
        initialIndex={selectedImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        altPrefix={room.name}
      />
    </div>
  );
}
