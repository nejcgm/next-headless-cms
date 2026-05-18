export interface Review {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
  avatar?: string;
  verified?: boolean;
}
