import type { TenantConfig } from "@core/types/tenant";

const config: TenantConfig = {
  id: "resort-example",
  name: "Kope",
  domains: ["kope.localhost", "kope.com", "www.kope.com"],
  defaultLocale: "en",
  locales: ["en", "de", "sl"],
  features: {
    blog: true,
    booking: true,
    reviews: true,
    search: false,
    newsletter: true,
  },
  theme: {
    colors: {
      primary: "#3F8181",
      secondary: "#6B4C41",
      accent: "#D4A574",
      background: "#F9F6F3",
      foreground: "#1A1A1A",
      muted: "#F3F0EB",
      border: "#E5E0D8",
      textPrimary: "#6B4C41",
    },
    fonts: {
      heading: "var(--font-playfair)",
      body: "var(--font-inter)",
    },
    borderRadius: "0.5rem",
  },
  dataAdapter: "mock",
};

export default config;
