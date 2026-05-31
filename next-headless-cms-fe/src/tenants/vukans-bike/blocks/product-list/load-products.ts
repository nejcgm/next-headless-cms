import type { CollectionParams } from "@core/data/contracts";
import { getAdapter } from "@core/data/fetcher";

export async function loadProductsForProductListBlock(
  tenant: string,
  locale: string,
  props: { limit?: number }
) {
  const params: CollectionParams = { locale };
  if (typeof props.limit === "number" && props.limit > 0) {
    params.limit = props.limit;
  }
  const products = await getAdapter().getCollection(tenant, "products", params);
  return { products, locale };
}
