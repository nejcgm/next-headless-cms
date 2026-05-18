"use client";

import { useState } from "react";
import type { BookingWidgetProps } from "./types";

export function BookingWidget({ heading = "Check Availability", layout = "inline" }: BookingWidgetProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const isInline = layout === "inline";

  return (
    <section className="py-8 px-4 bg-[var(--color-primary)] text-white">
      <div className="max-w-4xl mx-auto">
        {heading && (
          <h2 className="font-heading text-2xl font-bold mb-6 text-center">{heading}</h2>
        )}
        <form
          className={
            isInline
              ? "flex flex-col md:flex-row gap-4 items-end"
              : "flex flex-col gap-4 max-w-md mx-auto"
          }
        >
          <div className={isInline ? "flex-1" : "w-full"}>
            <label className="block text-sm mb-1 text-white/80">Check-in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--radius)] text-[var(--color-text-primary)]"
            />
          </div>
          <div className={isInline ? "flex-1" : "w-full"}>
            <label className="block text-sm mb-1 text-white/80">Check-out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--radius)] text-[var(--color-text-primary)]"
            />
          </div>
          <div className={isInline ? "flex-1" : "w-full"}>
            <label className="block text-sm mb-1 text-white/80">Guests</label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--radius)] text-[var(--color-text-primary)]"
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5">5+ Guests</option>
            </select>
          </div>
          <button
            type="submit"
            className={
              isInline
                ? "bg-white text-[var(--color-primary)] px-8 py-3 rounded-[var(--radius)] font-semibold hover:bg-opacity-90 transition-colors"
                : "w-full bg-white text-[var(--color-primary)] px-8 py-3 rounded-[var(--radius)] font-semibold hover:bg-opacity-90 transition-colors"
            }
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
