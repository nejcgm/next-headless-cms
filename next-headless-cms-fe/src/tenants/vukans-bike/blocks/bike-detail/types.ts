import type { BikeDetailLabels } from "./labels";

export interface BikeDetailProps {
  labels: BikeDetailLabels;
  bike?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    compareAtPrice?: number;
    image: string;
    images?: string[];
    category: string;
    inStock: boolean;
    tags?: string[];
    specs?: Record<string, string>;
  };
}
