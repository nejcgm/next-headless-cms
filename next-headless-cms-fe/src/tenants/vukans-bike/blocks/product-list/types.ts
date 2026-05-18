export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  tags: string[];
}

export interface ProductListProps {
  heading?: string;
  subheading?: string;
  outOfStockLabel: string;
  limit?: number;
  category?: string;
  layout?: "grid" | "list";
  anchorId?: string;
  locale?: string;
  products: Product[];
}
