import type { TenantConfig } from "@core/types/tenant";

function productionDomains(domains: string[]): string[] {
  return domains.filter((d) => !d.includes("localhost") && !d.includes("127.0.0.1"));
}

function pickCanonicalHost(domains: string[]): string | undefined {
  const prod = productionDomains(domains);
  if (prod.length === 0) return undefined;
  const www = prod.find((d) => d.startsWith("www."));
  return www ?? prod[0];
}

/**
 * Absolute origin (no trailing slash) for canonical URLs, sitemap, and robots.
 * Order: tenant `canonicalOrigin`, then `NEXT_PUBLIC_SITE_URL`, then production domains.
 */
export function getSiteOrigin(tenant: TenantConfig): string {
  if (tenant.canonicalOrigin) return tenant.canonicalOrigin.replace(/\/$/, "");

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const host = pickCanonicalHost(tenant.domains);
  if (host) return `https://${host}`;

  return "http://localhost:3000";
}

export function ogLocaleFromPageLocale(locale: string | undefined): string | undefined {
  if (!locale) return undefined;
  const map: Record<string, string> = {
    sl: "sl_SI",
    en: "en_US",
    de: "de_DE",
  };
  return map[locale] ?? locale;
}
