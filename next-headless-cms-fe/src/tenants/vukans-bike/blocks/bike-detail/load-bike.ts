import { getAdapter } from "@core/data/fetcher";
import type { BikeData, LoadBikeParams } from "./types";

export async function loadBikeForBikeDetailBlock({
  tenant,
  locale,
  pageSlug,
}: LoadBikeParams): Promise<{ bike?: BikeData }> {
  const bikeSlug = pageSlug?.split("/").filter(Boolean).at(-1);
  if (!bikeSlug) return {};

  const adapter = await getAdapter();
  const entry = await adapter.getEntry<BikeData>({
    tenant,
    collection: "products",
    id: bikeSlug,
    params: { locale },
  });
  return entry ? { bike: entry } : {};
}
