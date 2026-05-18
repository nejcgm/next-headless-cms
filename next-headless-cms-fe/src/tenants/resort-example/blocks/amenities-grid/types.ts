export interface AmenityItem {
  icon?: string;
  title: string;
  description?: string;
}

export interface AmenitiesGridProps {
  title?: string;
  subtitle?: string;
  amenities: AmenityItem[];
  columns?: 2 | 3 | 4;
  showDescription?: boolean;
}
