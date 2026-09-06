import type { TenantConfig } from "@core/types/tenant";  

const config: TenantConfig = {
  id: "vukans-bike",
  name: "Vukan's Bike",
  faviconUrl: "https://res.cloudinary.com/dru1crghm/image/upload/q_auto/f_auto/v1775405173/1000004333_bged3h.jpg",
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
      primary: "#B4121B",
      secondary: "#4B5563",
      accent: "#EFE9DF",
      background: "#FFFFFF",
      foreground: "#1C1917",
      muted: "#F5F5F4",
      border: "#E7E5E4",
      textPrimary: "#8A1015",
      mutedForeground: "#4B5563",
    },
    fonts: {
      heading: "var(--font-montserrat)",
      body: "var(--font-inter)",
    },
    borderRadius: "0rem",
  },
  dataAdapter: "mock",
  templates: {
    default: { usesSiteChrome: true },
    bare: { usesSiteChrome: false },
  },
};

export default config;
