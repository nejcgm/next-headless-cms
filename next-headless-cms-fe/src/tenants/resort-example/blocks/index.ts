import { registerTenantBlocks } from "@core/blocks/registry";
import { Hero } from "./hero/hero";
import { heroSchema } from "./hero/schema";
import { RoomList } from "./room-list/room-list";
import { roomListSchema } from "./room-list/schema";
import { BookingWidget } from "./booking-widget/booking-widget";
import { bookingWidgetSchema } from "./booking-widget/schema";
import { Testimonials } from "./testimonials/testimonials";
import { testimonialsSchema } from "./testimonials/schema";
import { HotelInfo } from "./hotel-info/hotel-info";
import { hotelInfoSchema } from "./hotel-info/schema";
import { RoomDetail } from "./room-detail/room-detail";
import { roomDetailSchema } from "./room-detail/schema";
import { AboutStory } from "./about-story/about-story";
import { aboutStorySchema } from "./about-story/schema";
import { LocationContact } from "./location-contact/location-contact";
import { locationContactSchema } from "./location-contact/schema";
import { AmenitiesGrid } from "./amenities-grid/amenities-grid";
import { amenitiesGridSchema } from "./amenities-grid/schema";
import { TeamGallery } from "./team-gallery/team-gallery";
import { teamGallerySchema } from "./team-gallery/schema";
import { fetchRoomDetailData } from "../services/roomDetail.service";

async function fetchHotel() {
  const { getHotel } = await import("../integrations/grmovsek-hotel/client");
  return getHotel();
}

registerTenantBlocks("resort-example", {
  hero: {
    component: Hero,
    schema: heroSchema,
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
    schema: roomDetailSchema,
    dataContract: (_props, ctx) =>
      fetchRoomDetailData(ctx.slug, ctx.searchParams),
  },

  "hotel-info": {
    component: HotelInfo,
    schema: hotelInfoSchema,
    dataContract: async () => {
      const hotel = await fetchHotel();
      return { hotel };
    },
  },

  "about-story": {
    component: AboutStory,
    schema: aboutStorySchema,
  },

  "location-contact": {
    component: LocationContact,
    schema: locationContactSchema,
  },

  "amenities-grid": {
    component: AmenitiesGrid,
    schema: amenitiesGridSchema,
  },

  "team-gallery": {
    component: TeamGallery,
    schema: teamGallerySchema,
  },

  "booking-widget": {
    component: BookingWidget,
    schema: bookingWidgetSchema,
  },

  testimonials: {
    component: Testimonials,
    schema: testimonialsSchema,
    dataContract: async (props, ctx) => {
      const { getAdapter } = await import("../../../core/data/fetcher");
      const adapter = await getAdapter();
      const reviews = await adapter.getCollection(ctx.tenant, "reviews", {
        limit: (props.limit as number) ?? 3,
        locale: ctx.locale,
      });
      return { reviews };
    },
  },
});
