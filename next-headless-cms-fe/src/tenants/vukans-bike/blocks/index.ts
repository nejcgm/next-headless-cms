import {
  registerTenantBlocks,
  registerTenantLayoutNestAllow,
} from "@core/blocks/registry";
import { loadProductsForProductListBlock } from "./product-list/load-products";
import { ProductList } from "./product-list/product-list";
import { productListSchema } from "./product-list/schema";
import { ServicePricing } from "./service-pricing/service-pricing";
import { servicePricingSchema } from "./service-pricing/schema";
import { ServiceFaq } from "./service-faq/service-faq";
import { serviceFaqSchema } from "./service-faq/schema";
import { PartnersGallery } from "./partners-gallery/partners-gallery";
import { partnersGallerySchema } from "./partners-gallery/schema";
import { Contact } from "./contact/contact";
import { contactSchema } from "./contact/schema";
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
  "contact",
  "gallery",
  "partners-gallery",
  "service-pricing",
  "service-faq",
]);

registerTenantBlocks("vukans-bike", {
  contact: {
    component: Contact,
    schema: contactSchema,
    policy: keepLeafPolicy,
  },

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

  "partners-gallery": {
    component: PartnersGallery,
    schema: partnersGallerySchema,
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

  "service-pricing": {
    component: ServicePricing,
    schema: servicePricingSchema,
    policy: keepLeafPolicy,
  },

  "service-faq": {
    component: ServiceFaq,
    schema: serviceFaqSchema,
    policy: keepLeafPolicy,
  },
});
