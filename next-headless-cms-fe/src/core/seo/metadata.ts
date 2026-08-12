import type { Metadata } from "next";
import { getSiteOrigin, ogLocaleFromPageLocale } from "@core/seo/site-url";
import type { BuildMetadataArgs } from "./types";

export function buildMetadata({
  seo,
  tenant,
  ctx,
}: BuildMetadataArgs): Metadata {
  const origin = getSiteOrigin(tenant);
  const path = ctx?.pathname ?? "/";
  const pathname = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  const canonical = seo.canonical ?? `${origin}${pathname}`;
  const ogLocale = ogLocaleFromPageLocale(ctx?.locale);

  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      type: "website",
      url: canonical,
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
      siteName: tenant.name,
      ...(ogLocale ? { locale: ogLocale } : {}),
    },
    twitter: {
      card: seo.ogImage ? "summary_large_image" : "summary",
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    alternates: { canonical },
  };
}
