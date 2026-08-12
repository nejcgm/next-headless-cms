import { getAdapter } from "@core/data/fetcher";
import type { BikeData } from "./types";

export async function loadBikeForBikeDetailBlock(
  tenant: string,
  locale: string,
  pageSlug: string | undefined
): Promise<{ bike?: BikeData }> {
  const bikeSlug = pageSlug?.split("/").filter(Boolean).at(-1);
  if (!bikeSlug) return {};

  const adapter = await getAdapter();
  const entry = await adapter.getEntry<BikeData>(tenant, "products", bikeSlug, { locale });
  return entry ? { bike: entry } : {};
}
