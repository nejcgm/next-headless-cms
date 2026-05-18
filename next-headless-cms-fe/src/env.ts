import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional()
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  STRAPI_URL: optionalUrl,
  STRAPI_API_TOKEN: z.string().optional(),
  REVALIDATE_SECRET: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().min(16).default("change-me-in-production-16-chars")
  ),
  RESORT_BOOKING_API_URL: optionalUrl,
  RESORT_BOOKING_API_KEY: z.string().optional(),
  LITEAPI_URL: optionalUrl,
  LITEAPI_KEY: z.string().optional(),
  LITEAPI_HOTEL_ID: z.string().optional(),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  STRAPI_URL: process.env.STRAPI_URL,
  STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN,
  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
  RESORT_BOOKING_API_URL: process.env.RESORT_BOOKING_API_URL,
  RESORT_BOOKING_API_KEY: process.env.RESORT_BOOKING_API_KEY,
  LITEAPI_URL: process.env.LITEAPI_URL,
  LITEAPI_KEY: process.env.LITEAPI_KEY,
  LITEAPI_HOTEL_ID: process.env.LITEAPI_HOTEL_ID,
});
