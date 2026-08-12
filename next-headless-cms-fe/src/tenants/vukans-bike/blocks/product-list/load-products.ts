import type { CollectionParams } from "@core/data/types";
import { getAdapter } from "@core/data/fetcher";
import type { LoadProductsParams } from "./types";

export async function loadProductsForProductListBlock({
  tenant,
  locale,
  props,
}: LoadProductsParams) {
  const params: CollectionParams = { locale };
  if (typeof props.limit === "number" && props.limit > 0) {
    params.limit = props.limit;
  }
  const adapter = await getAdapter();
  const products = await adapter.getCollection({
    tenant,
    collection: "products",
    params,
  });
  return { products, locale };
}
