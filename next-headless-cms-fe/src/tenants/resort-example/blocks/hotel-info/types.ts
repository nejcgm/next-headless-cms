import type { Hotel } from "../../integrations/grmovsek-hotel/types";

export interface HotelInfoProps {
  hotel?: Hotel | null;
}

export interface HotelFacility {
  name: string;
  icon?: string;
}
