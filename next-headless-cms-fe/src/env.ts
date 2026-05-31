import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional()
);

export const DEFAULT_REVALIDATE_SECRET = "change-me-in-production-16-chars";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  STRAPI_URL: optionalUrl,
  STRAPI_API_TOKEN: z.string().optional(),
  REVALIDATE_SECRET: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().min(16).default(DEFAULT_REVALIDATE_SECRET)
  ),
  PREVIEW_SECRET: z.string().optional(),
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
  PREVIEW_SECRET: process.env.PREVIEW_SECRET,
  RESORT_BOOKING_API_URL: process.env.RESORT_BOOKING_API_URL,
  RESORT_BOOKING_API_KEY: process.env.RESORT_BOOKING_API_KEY,
  LITEAPI_URL: process.env.LITEAPI_URL,
  LITEAPI_KEY: process.env.LITEAPI_KEY,
  LITEAPI_HOTEL_ID: process.env.LITEAPI_HOTEL_ID,
});

export function isRevalidateSecretMisconfigured(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    env.REVALIDATE_SECRET === DEFAULT_REVALIDATE_SECRET
  );
}
