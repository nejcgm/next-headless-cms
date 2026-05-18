// Grmovsek Hotel API types — sourced from LiteAPI v3.0 /data/hotel endpoint

export interface GrmovsekHotelPhoto {
  url: string;
  urlHd: string;
  hd_url: string;
  caption?: string;
  mainPhoto?: boolean;
  imageDescription?: string;
  failoverPhoto?: string;
}

export interface GrmovsekHotelBedType {
  id: number;
  bedType: string;
  bedSize: string;
  quantity: number;
}

export interface GrmovsekHotelAmenity {
  amenitiesId: number;
  name: string;
  sort: number;
}

export interface GrmovsekHotelFacility {
  facilityId: number;
  name: string;
}

export interface GrmovsekHotelView {
  id: number;
  view: string;
}

export interface GrmovsekHotelRoomRaw {
  id: number;
  roomName: string;
  description: string;
  roomSizeSquare: number;
  roomSizeUnit: string;
  hotelId: string;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  bedTypes: GrmovsekHotelBedType[];
  roomAmenities: GrmovsekHotelAmenity[];
  photos: GrmovsekHotelPhoto[];
  views: GrmovsekHotelView[];
  bedRelation: string;
}

export interface GrmovsekHotelCheckinCheckout {
  checkin_start: string;
  checkin_end: string;
  checkout: string;
  instructions: string | null;
  special_instructions: string;
}

export interface GrmovsekHotelDetail {
  id: string;
  name: string;
  hotelDescription: string;
  hotelImportantInformation: string;
  checkinCheckoutTimes: GrmovsekHotelCheckinCheckout;
  hotelImages: GrmovsekHotelPhoto[];
  main_photo: string;
  thumbnail: string;
  country: string;
  city: string;
  starRating: string | null;
  address: string;
  zip: string;
  chainId: number;
  chain: string;
  facilities: GrmovsekHotelFacility[];
  rooms: GrmovsekHotelRoomRaw[];
  phone: string;
  email: string;
  hotelType: string;
  rating: number;
  reviewCount: number;
  petsAllowed: boolean;
  childAllowed: boolean;
}

// Normalised shapes exposed to components
export interface Hotel {
  id: string;
  name: string;
  description: string;
  importantInfo: string;
  city: string;
  country: string;
  address: string;
  zip: string;
  rating: number;
  reviewCount: number;
  stars: string | null;
  mainPhoto: string;
  images: string[];
  facilities: string[];
  checkin: string;
  checkout: string;
  petsAllowed: boolean;
  childAllowed: boolean;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  sizeM2: number;
  maxOccupancy: number;
  maxAdults: number;
  maxChildren: number;
  mainPhoto: string;
  photos: string[];
  amenities: string[];
  bedTypes: string[];
  views: string[];
}
