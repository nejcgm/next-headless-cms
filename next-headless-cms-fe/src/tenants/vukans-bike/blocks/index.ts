import {
  registerTenantBlocks,
  registerTenantLayoutNestAllow,
} from "@core/blocks/registry";
import { loadProductsForProductListBlock } from "./product-list/load-products";
import { ProductList } from "./product-list/product-list";
import { productListSchema } from "./product-list/schema";
import { BikeDetail } from "./bike-detail/bike-detail";
import { bikeDetailSchema } from "./bike-detail/schema";
import { loadBikeForBikeDetailBlock } from "./bike-detail/load-bike";
import { Gallery } from "./gallery/gallery";
import { gallerySchema } from "./gallery/schema";

const keepLeafPolicy = {
  level: 3 as const,
  maxDepth: 1,
  slots: {},
};

registerTenantLayoutNestAllow("vukans-bike", [
  "product-list",
  "bike-detail",
  "gallery",
]);

registerTenantBlocks("vukans-bike", {
  "bike-detail": {
    component: BikeDetail,
    schema: bikeDetailSchema,
    policy: keepLeafPolicy,
    dataContract: (_props, ctx) =>
      loadBikeForBikeDetailBlock({
        tenant: ctx.tenant,
        locale: ctx.locale,
        pageSlug: ctx.slug,
      }),
  },

  gallery: {
    component: Gallery,
    schema: gallerySchema,
    policy: keepLeafPolicy,
  },

  "product-list": {
    component: ProductList,
    schema: productListSchema,
    policy: keepLeafPolicy,
    dataContract: (props, ctx) =>
      loadProductsForProductListBlock({
        tenant: ctx.tenant,
        locale: ctx.locale,
        props,
      }),
  },
});
