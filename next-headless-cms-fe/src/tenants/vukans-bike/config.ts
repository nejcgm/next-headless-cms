import type { TenantConfig } from "@core/types/tenant";

const VUKANS_BIKE_LOGO =
  "https://res.cloudinary.com/dru1crghm/image/upload/q_auto/f_auto/v1775405173/1000004333_bged3h.jpg";

const config: TenantConfig = {
  id: "vukans-bike",
  name: "Vukan's Bike",
  logoUrl: VUKANS_BIKE_LOGO,
  canonicalOrigin: "https://vukansbike.com",
  defaultMetaDescription:
    "Servis in prodaja koles vseh vrst v Apačah in Sloveniji: mestna, cestna, gravel, električna in gorska kolesa. Kolesarska šola, vodene ture, MTB.",
  contact: {
    addressLine: "Apače 66a, 9253 Apače, Slovenija",
    phone: "070 815 379",
    email: "vukansbike@gmail.com",
  },
  domains: ["bikes.localhost", "vukansbikes.com", "www.vukansbikes.com"],
  defaultLocale: "sl",
  locales: ["sl", "de", "en"],
  features: {
    blog: false,
    booking: false,
    reviews: true,
    search: true,
    newsletter: false,
  },
  theme: {
    colors: {
      primary: "#BD0C17",
      secondary: "#71717a",
      accent: "#fbbf24",
      background: "#0f0f11", //"#00293F"
      foreground: "#fafafa",
      muted: "#18181b",
      border: "#27272a",
      textPrimary: "#e5484d",
    },
    fonts: {
      heading: "var(--font-montserrat)",
      body: "var(--font-inter)",
    },
    borderRadius: "0.375rem",
  },
  dataAdapter: "mock",
};

export default config;
