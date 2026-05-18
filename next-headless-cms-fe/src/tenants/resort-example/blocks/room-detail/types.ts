import type { Room, Hotel } from "../../integrations/grmovsek-hotel/types";
import type { AvailabilityResult } from "../../integrations/grmovsek-hotel/client";

export interface RoomDetailProps {
  room: Room;
  hotel: Hotel;
  availability?: AvailabilityResult | null;
  initialCheckin?: string;
  initialCheckout?: string;
  unavailableDates?: string[];
}
