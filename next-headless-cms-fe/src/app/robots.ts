import type { MetadataRoute } from "next";
import tenantConfig from "@tenant/config";
import { getSiteOrigin } from "@core/seo/site-url";
import { isIndexingDisabled } from "@core/seo/crawl-policy";

export default function robots(): MetadataRoute.Robots {
  if (isIndexingDisabled()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const base = getSiteOrigin(tenantConfig);
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
