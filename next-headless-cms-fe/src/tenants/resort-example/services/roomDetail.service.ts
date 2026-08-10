import type { Room, Hotel } from "../integrations/grmovsek-hotel/types";
import type { AvailabilityResult } from "../integrations/grmovsek-hotel/client";
import type { NormalizedSearchParams } from "@core/blocks/search-params";

export interface RoomDetailData extends Record<string, unknown> {
  room: Room | null;
  hotel: Hotel | null;
  availability: AvailabilityResult | null;
  initialCheckin?: string;
  initialCheckout?: string;
  unavailableDates: string[];
}

function extractRoomId(slug?: string): string | null {
  if (!slug) return null;
  const match = slug.match(/rooms\/(\d+)/);
  return match?.[1] ?? null;
}

async function fetchHotel() {
  const { getHotel } = await import("../integrations/grmovsek-hotel/client");
  return getHotel();
}

export async function fetchRoomDetailData(
  slug: string | undefined,
  searchParams: NormalizedSearchParams = {}
): Promise<RoomDetailData> {
  const roomId = extractRoomId(slug);
  if (!roomId) {
    return { room: null, hotel: null, availability: null, unavailableDates: [] };
  }

  const hotel = await fetchHotel();
  if (!hotel) {
    return { room: null, hotel: null, availability: null, unavailableDates: [] };
  }

  const room = hotel.rooms.find((r) => r.id === roomId);
  if (!room) {
    return { room: null, hotel: null, availability: null, unavailableDates: [] };
  }

  const { checkAvailability, fetchAvailabilityCalendar, HOTEL_ID } = await import(
    "../integrations/grmovsek-hotel/client"
  );

  // Dates come from URL searchParams, not CMS block props
  let availability = null;
  const checkin = searchParams.checkin;
  const checkout = searchParams.checkout;

  if (checkin && checkout) {
    availability = await checkAvailability({
      hotelId: HOTEL_ID,
      roomId,
      checkin,
      checkout,
      adults: room.maxAdults,
    });
  }

  const today = new Date();
  const startDate = today.toISOString().split("T")[0];
  const endDate = new Date(today.setDate(today.getDate() + 60)).toISOString().split("T")[0];

  const calendar = await fetchAvailabilityCalendar({
    hotelId: HOTEL_ID,
    startDate,
    endDate,
    adults: room.maxAdults,
  });

  return {
    room,
    hotel,
    availability,
    initialCheckin: checkin,
    initialCheckout: checkout,
    unavailableDates: calendar?.unavailableDates ?? [],
  };
}
