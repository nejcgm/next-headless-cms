import { registerTenantBlocks } from "@core/blocks/registry";
import { Hero } from "./hero/hero";
import { loadProductsForProductListBlock } from "./product-list/load-products";
import { ProductList } from "./product-list/product-list";
import { ServicePricing } from "./service-pricing/service-pricing";
import { ServiceProcess } from "./service-process/service-process";
import { ServiceFaq } from "./service-faq/service-faq";
import { ServiceContact } from "./service-contact/service-contact";
import { PartnersGallery } from "./partners-gallery/partners-gallery";
import { Contact } from "./contact/contact";
import { AboutStory } from "./about-story/about-story";
import { AboutValues } from "./about-values/about-values";
import { AboutPerson } from "./about-person/about-person";
import { BikeDetail } from "./bike-detail/bike-detail";
import { BikeSchoolIntro } from "./bike-school-intro/bike-school-intro";
import { BikeSchoolProgram } from "./bike-school-program/bike-school-program";
import { Gallery } from "./gallery/gallery";
import { GuidedTourExperience } from "./guided-tour-experience/guided-tour-experience";

registerTenantBlocks("vukans-bike", {
  hero: {
    component: Hero,
  },

  contact: {
    component: Contact,
  },

  "about-story": {
    component: AboutStory,
  },

  "about-values": {
    component: AboutValues,
  },

  "about-person": {
    component: AboutPerson,
  },

  "bike-detail": {
    component: BikeDetail,
  },

  "bike-school-intro": {
    component: BikeSchoolIntro,
  },

  "bike-school-program": {
    component: BikeSchoolProgram,
  },

  gallery: {
    component: Gallery,
  },

  "guided-tour-experience": {
    component: GuidedTourExperience,
  },

  "partners-gallery": {
    component: PartnersGallery,
  },

  "product-list": {
    component: ProductList,
    dataContract: (props, ctx) => loadProductsForProductListBlock(ctx.tenant, ctx.locale, props),
  },

  "service-pricing": {
    component: ServicePricing,
  },

  "service-process": {
    component: ServiceProcess,
  },

  "service-faq": {
    component: ServiceFaq,
  },

  "service-contact": {
    component: ServiceContact,
  },
});
