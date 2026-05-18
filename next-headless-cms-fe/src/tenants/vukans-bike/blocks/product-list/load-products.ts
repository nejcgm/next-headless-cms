import type { CollectionParams } from "@core/data/contracts";
import { getAdapter } from "@core/data/fetcher";

/** Loads products for the product-list block; omit or non-positive `limit` returns the full collection (mock) / unpaginated request. */
export async function loadProductsForProductListBlock(
  tenant: string,
  locale: string,
  props: { limit?: number }
) {
  const params: CollectionParams = { locale };
  if (typeof props.limit === "number" && props.limit > 0) {
    params.limit = props.limit;
  }
  const products = await getAdapter(tenant).getCollection(tenant, "products", params);
  return { products, locale };
}
