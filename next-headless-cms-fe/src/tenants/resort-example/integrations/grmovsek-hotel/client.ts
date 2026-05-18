import { env } from "@/env";
import { apiClient } from "@shared/lib/api-client";
import type { Hotel, Room, GrmovsekHotelDetail } from "./types";

const BASE_URL = env.LITEAPI_URL ?? "https://api.liteapi.travel/v3.0";
const API_KEY = env.LITEAPI_KEY ?? "";
export const HOTEL_ID = env.LITEAPI_HOTEL_ID ?? "lp65866c0e";

function normaliseRoom(raw: GrmovsekHotelDetail["rooms"][number]): Room {
  const mainPhoto = raw.photos.find((p) => p.mainPhoto)?.url || raw.photos[0]?.url || "";
  const bedLabel = raw.bedTypes
    .map((b) => `${b.quantity}× ${b.bedType}`)
    .join(", ");

  return {
    id: String(raw.id),
    name: raw.roomName,
    description: raw.description.replace(/<[^>]*>/g, "").trim(),
    sizeM2: raw.roomSizeSquare,
    maxOccupancy: raw.maxOccupancy,
    maxAdults: raw.maxAdults,
    maxChildren: raw.maxChildren,
    mainPhoto,
    photos: raw.photos.map((p) => p.url),
    amenities: raw.roomAmenities.map((a) => a.name),
    bedTypes: bedLabel ? [bedLabel] : [],
    views: raw.views.map((v) => v.view),
  };
}

function normaliseHotel(raw: GrmovsekHotelDetail): Hotel {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.hotelDescription.replace(/<[^>]*>/g, "").trim(),
    importantInfo: raw.hotelImportantInformation || "",
    city: raw.city,
    country: raw.country,
    address: raw.address,
    zip: raw.zip,
    rating: raw.rating,
    reviewCount: raw.reviewCount,
    stars: raw.starRating,
    mainPhoto: raw.main_photo,
    images: raw.hotelImages.map((img) => img.url),
    facilities: (raw.facilities || []).map((f) => f.name),
    checkin: raw.checkinCheckoutTimes?.checkin_start || "",
    checkout: raw.checkinCheckoutTimes?.checkout || "",
    petsAllowed: raw.petsAllowed,
    childAllowed: raw.childAllowed,
    rooms: (raw.rooms || []).map(normaliseRoom),
  };
}

export async function getHotel(hotelId: string = HOTEL_ID): Promise<Hotel | null> {
  if (!API_KEY) {
    console.warn("GrmovsekHotel: Missing API key");
    return null;
  }

  try {
    const json = await apiClient<{ data: GrmovsekHotelDetail }>(
      `${BASE_URL}/data/hotel`,
      {
        params: { hotelId },
        headers: {
          "X-API-Key": API_KEY,
        },
        next: { revalidate: 3600, tags: [`hotel-${hotelId}`] },
      }
    );

    if (!json?.data) {
      throw new Error("Unexpected GrmovsekHotel API response shape");
    }

    return normaliseHotel(json.data);
  } catch (error) {
    console.error("GrmovsekHotel: getHotel failed", error);
    return null;
  }
}

// Availability checking via /hotels/rates endpoint
export interface AvailabilityParams {
  hotelId: string;
  roomId: string;
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  adults?: number;
  children?: number[];
  currency?: string;
  guestNationality?: string;
}

export interface RateInfo {
  rateId: string;
  name: string;
  maxOccupancy: number;
  adultCount: number;
  childCount: number;
  boardType: string;
  boardName: string;
  price: {
    amount: number;
    currency: string;
  };
  totalPrice: {
    amount: number;
    currency: string;
  };
  cancellationPolicies?: Array<{
    deadline: string;
    penaltyPercent: number;
  }>;
}

export interface AvailabilityResult {
  available: boolean;
  rates: RateInfo[];
  hotelId: string;
}

export async function checkAvailability(
  params: AvailabilityParams
): Promise<AvailabilityResult | null> {
  if (!API_KEY) {
    console.warn("GrmovsekHotel: Missing API key");
    return null;
  }

  const {
    hotelId,
    checkin,
    checkout,
    adults = 2,
    children = [],
    currency = "EUR",
    guestNationality = "SI",
  } = params;

  try {
    const json = await apiClient<{
      data: {
        rates: Array<{
          hotelId: string;
          offers: Array<{
            rates: Array<{
              rateId: string;
              name: string;
              maxOccupancy: number;
              adultCount: number;
              childCount: number;
              boardType: string;
              boardName: string;
              retailRate?: {
                total: Array<{ amount: number; currency: string }>;
              };
              totalPrice: Array<{ amount: number; currency: string }>;
              cancellationPolicies?: Array<{
                deadline: string;
                penaltyPercent: number;
              }>;
            }>;
          }>;
        }>;
      };
    }>(`${BASE_URL}/hotels/rates`, {
      method: "POST",
      body: {
        hotelIds: [hotelId],
        checkin,
        checkout,
        currency,
        guestNationality,
        occupancies: [
          {
            rooms: 1,
            adults,
            children,
          },
        ],
        timeout: 10,
      },
      headers: {
        "X-API-Key": API_KEY,
      },
      next: { revalidate: 60, tags: [`availability-${hotelId}-${checkin}`] },
    });

    if (!json?.data?.rates || json.data.rates.length === 0) {
      return { available: false, rates: [], hotelId };
    }

    // Find rates for this hotel
    const hotelRate = json.data.rates.find((r) => r.hotelId === hotelId);

    if (!hotelRate?.offers || hotelRate.offers.length === 0) {
      return { available: false, rates: [], hotelId };
    }

    // Extract rates from offers
    const rates: RateInfo[] = [];
    for (const offer of hotelRate.offers) {
      if (offer.rates && offer.rates.length > 0) {
        for (const rate of offer.rates) {
          rates.push({
            rateId: rate.rateId,
            name: rate.name,
            maxOccupancy: rate.maxOccupancy,
            adultCount: rate.adultCount,
            childCount: rate.childCount,
            boardType: rate.boardType,
            boardName: rate.boardName,
            price: {
              amount: rate.retailRate?.total?.[0]?.amount || 0,
              currency: rate.retailRate?.total?.[0]?.currency || currency,
            },
            totalPrice: {
              amount: rate.totalPrice?.[0]?.amount || 0,
              currency: rate.totalPrice?.[0]?.currency || currency,
            },
            cancellationPolicies: rate.cancellationPolicies,
          });
        }
      }
    }

    return {
      available: rates.length > 0,
      rates,
      hotelId,
    };
  } catch (error) {
    console.error("GrmovsekHotel: checkAvailability failed", error);
    return null;
  }
}

// Fetch availability calendar for a date range
export interface AvailabilityCalendarParams {
  hotelId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  adults?: number;
  currency?: string;
  guestNationality?: string;
}

export interface AvailabilityCalendar {
  availableDates: string[]; // Dates that are available (YYYY-MM-DD)
  unavailableDates: string[]; // Dates that are unavailable
  minStay: number;
  maxStay: number;
}

export async function fetchAvailabilityCalendar(
  params: AvailabilityCalendarParams
): Promise<AvailabilityCalendar | null> {
  if (!API_KEY) {
    console.warn("GrmovsekHotel: Missing API key");
    return null;
  }

  const {
    hotelId,
    startDate,
    endDate,
    adults = 2,
    currency = "EUR",
    guestNationality = "SI",
  } = params;

  try {
    // Fetch rates for the entire date range
    const json = await apiClient<{
      data: {
        rates: Array<{
          hotelId: string;
          offers: unknown[];
        }>;
      };
    }>(`${BASE_URL}/hotels/rates`, {
      method: "POST",
      body: {
        hotelIds: [hotelId],
        checkin: startDate,
        checkout: endDate,
        currency,
        guestNationality,
        occupancies: [
          {
            rooms: 1,
            adults,
          },
        ],
        timeout: 15,
      },
      headers: {
        "X-API-Key": API_KEY,
      },
      next: { revalidate: 300, tags: [`calendar-${hotelId}-${startDate}`] },
    });

    // Generate all dates in range
    const allDates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current < end) {
      allDates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    // If we have rates, those dates are available
    const availableDates: string[] = [];
    if (json?.data?.rates && json.data.rates.length > 0) {
      const hotelRate = json.data.rates.find((r) => r.hotelId === hotelId);
      if (hotelRate?.offers && hotelRate.offers.length > 0) {
        // The dates between checkin and checkout are available
        for (let i = 0; i < allDates.length - 1; i++) {
          availableDates.push(allDates[i]);
        }
      }
    }

    // Unavailable dates are those not in availableDates
    const unavailableDates = allDates.filter((d) => !availableDates.includes(d));

    return {
      availableDates,
      unavailableDates,
      minStay: 1,
      maxStay: 14,
    };
  } catch (error) {
    console.error("GrmovsekHotel: fetchAvailabilityCalendar failed", error);
    return null;
  }
}
