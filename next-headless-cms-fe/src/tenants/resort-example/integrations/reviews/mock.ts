import type { Review } from "./types";

export const mockReviews: Review[] = [
  {
    id: "rev-1",
    author: "Sarah M.",
    rating: 5,
    content: "Absolutely magical stay! The Alpine Suite exceeded all expectations. Waking up to those mountain views was unforgettable. The staff was incredibly attentive and the breakfast was delicious.",
    date: "March 2026",
    verified: true,
  },
  {
    id: "rev-2",
    author: "Thomas K.",
    rating: 5,
    content: "Perfect family getaway. The chalet had everything we needed and the kids loved exploring the nearby trails. Already planning our next visit!",
    date: "February 2026",
    verified: true,
  },
  {
    id: "rev-3",
    author: "Elena R.",
    rating: 4,
    content: "Beautiful location and great spa facilities. Room was comfortable and clean. Would have loved a later checkout option but otherwise wonderful experience.",
    date: "January 2026",
    verified: true,
  },
];

export async function getMockReviews(): Promise<Review[]> {
  return mockReviews;
}
