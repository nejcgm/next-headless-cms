import { registerTenantBlocks } from "@core/blocks/registry";
import { Hero } from "./hero/hero";
import { heroSchema } from "./hero/schema";
import { loadProductsForProductListBlock } from "./product-list/load-products";
import { ProductList } from "./product-list/product-list";
import { productListSchema } from "./product-list/schema";
import { ServicePricing } from "./service-pricing/service-pricing";
import { servicePricingSchema } from "./service-pricing/schema";
import { ServiceProcess } from "./service-process/service-process";
import { serviceProcessSchema } from "./service-process/schema";
import { ServiceFaq } from "./service-faq/service-faq";
import { serviceFaqSchema } from "./service-faq/schema";
import { ServiceContact } from "./service-contact/service-contact";
import { serviceContactSchema } from "./service-contact/schema";
import { PartnersGallery } from "./partners-gallery/partners-gallery";
import { partnersGallerySchema } from "./partners-gallery/schema";
import { Contact } from "./contact/contact";
import { contactSchema } from "./contact/schema";
import { AboutStory } from "./about-story/about-story";
import { aboutStorySchema } from "./about-story/schema";
import { AboutValues } from "./about-values/about-values";
import { aboutValuesSchema } from "./about-values/schema";
import { AboutPerson } from "./about-person/about-person";
import { aboutPersonSchema } from "./about-person/schema";
import { BikeDetail } from "./bike-detail/bike-detail";
import { bikeDetailSchema } from "./bike-detail/schema";
import { loadBikeForBikeDetailBlock } from "./bike-detail/load-bike";
import { BikeSchoolIntro } from "./bike-school-intro/bike-school-intro";
import { bikeSchoolIntroSchema } from "./bike-school-intro/schema";
import { BikeSchoolProgram } from "./bike-school-program/bike-school-program";
import { bikeSchoolProgramSchema } from "./bike-school-program/schema";
import { Gallery } from "./gallery/gallery";
import { gallerySchema } from "./gallery/schema";
import { GuidedTourExperience } from "./guided-tour-experience/guided-tour-experience";
import { guidedTourExperienceSchema } from "./guided-tour-experience/schema";

registerTenantBlocks("vukans-bike", {
  hero: {
    component: Hero,
    schema: heroSchema,
  },

  contact: {
    component: Contact,
    schema: contactSchema,
  },

  "about-story": {
    component: AboutStory,
    schema: aboutStorySchema,
  },

  "about-values": {
    component: AboutValues,
    schema: aboutValuesSchema,
  },

  "about-person": {
    component: AboutPerson,
    schema: aboutPersonSchema,
  },

  "bike-detail": {
    component: BikeDetail,
    schema: bikeDetailSchema,
    dataContract: (_props, ctx) =>
      loadBikeForBikeDetailBlock({
        tenant: ctx.tenant,
        locale: ctx.locale,
        pageSlug: ctx.slug,
      }),
  },

  "bike-school-intro": {
    component: BikeSchoolIntro,
    schema: bikeSchoolIntroSchema,
  },

  "bike-school-program": {
    component: BikeSchoolProgram,
    schema: bikeSchoolProgramSchema,
  },

  gallery: {
    component: Gallery,
    schema: gallerySchema,
  },

  "guided-tour-experience": {
    component: GuidedTourExperience,
    schema: guidedTourExperienceSchema,
  },

  "partners-gallery": {
    component: PartnersGallery,
    schema: partnersGallerySchema,
  },

  "product-list": {
    component: ProductList,
    schema: productListSchema,
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
  },

  "service-process": {
    component: ServiceProcess,
    schema: serviceProcessSchema,
  },

  "service-faq": {
    component: ServiceFaq,
    schema: serviceFaqSchema,
  },

  "service-contact": {
    component: ServiceContact,
    schema: serviceContactSchema,
  },
});
