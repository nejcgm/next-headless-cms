import type { Room, Hotel } from "../integrations/grmovsek-hotel/types";
import type { AvailabilityResult } from "../integrations/grmovsek-hotel/client";

export interface RoomDetailData extends Record<string, unknown> {
  room: Room | null;
  hotel: Hotel | null;
  availability: AvailabilityResult | null;
  initialCheckin?: string;
  initialCheckout?: string;
  unavailableDates: string[];
}

// Extract room ID from slug like "/rooms/123" or "rooms/123"
function extractRoomId(slug?: string): string | null {
  if (!slug) return null;
  const match = slug.match(/rooms\/(\d+)/);
  return match?.[1] ?? null;
}

// Fetch hotel data with caching
async function fetchHotel() {
  const { getHotel } = await import("../integrations/grmovsek-hotel/client");
  return getHotel();
}

export async function fetchRoomDetailData(
  slug: string | undefined,
  props: Record<string, unknown>
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

  // Check availability if dates provided in props (from searchParams)
  let availability = null;
  const checkin = props.checkin as string | undefined;
  const checkout = props.checkout as string | undefined;

  if (checkin && checkout) {
    availability = await checkAvailability({
      hotelId: HOTEL_ID,
      roomId,
      checkin,
      checkout,
      adults: room.maxAdults,
    });
  }

  // Fetch availability calendar for the next 60 days
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
