import type { Room } from "../../integrations/grmovsek-hotel/types";

export interface RoomListProps {
  heading?: string;
  subheading?: string;
  limit?: number;
  layout?: "grid" | "list";
  cta?: { label: string; href: string };
  // Injected by dataContract
  rooms: Room[];
}
