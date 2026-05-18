import { registerTenantBlocks } from "@core/blocks/registry";
import { Hero } from "./hero/hero";
import { RoomList } from "./room-list/room-list";
import { roomListSchema } from "./room-list/schema";
import { BookingWidget } from "./booking-widget/booking-widget";
import { Testimonials } from "./testimonials/testimonials";
import { HotelInfo } from "./hotel-info/hotel-info";
import { RoomDetail } from "./room-detail/room-detail";
import { AboutStory } from "./about-story/about-story";
import { LocationContact } from "./location-contact/location-contact";
import { AmenitiesGrid } from "./amenities-grid/amenities-grid";
import { TeamGallery } from "./team-gallery/team-gallery";
import { fetchRoomDetailData } from "../services/roomDetail.service";

async function fetchHotel() {
  const { getHotel } = await import("../integrations/grmovsek-hotel/client");
  return getHotel();
}

registerTenantBlocks("resort-example", {
  hero: {
    component: Hero,
  },

  "room-list": {
    component: RoomList,
    schema: roomListSchema,
    dataContract: async () => {
      const hotel = await fetchHotel();
      return { rooms: hotel?.rooms ?? [] };
    },
  },

  "room-detail": {
    component: RoomDetail,
    dataContract: (props, ctx) => fetchRoomDetailData(ctx.slug, props),
  },

  "hotel-info": {
    component: HotelInfo,
    dataContract: async () => {
      const hotel = await fetchHotel();
      return { hotel };
    },
  },

  "about-story": {
    component: AboutStory,
  },

  "location-contact": {
    component: LocationContact,
  },

  "amenities-grid": {
    component: AmenitiesGrid,
  },

  "team-gallery": {
    component: TeamGallery,
  },

  "booking-widget": {
    component: BookingWidget,
  },

  testimonials: {
    component: Testimonials,
    dataContract: async (props, ctx) => {
      const { getAdapter } = await import("../../../core/data/fetcher");
      const reviews = await getAdapter(ctx.tenant).getCollection(ctx.tenant, "reviews", {
        limit: (props.limit as number) ?? 3,
        locale: ctx.locale,
      });
      return { reviews };
    },
  },
});
