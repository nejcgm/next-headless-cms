import { notFound } from "next/navigation";
import tenantConfig from "@tenant/config";
import { getPageCached, loadPageWithNavigation } from "@core/data/fetcher";
import { BlockRenderer } from "@core/blocks/renderer";
import { normalizeSearchParams } from "@core/blocks/search-params";
import {
  parseLocaleFromSegments,
  segmentsToLogicalPathname,
  visiblePathnameFromSlugSegments,
} from "@core/i18n/locale-path";
import { resolveTemplate } from "@core/routing/resolver";
import { buildMetadata } from "@core/seo/metadata";
import { logger } from "@shared/lib/logger";

import type { PageProps } from "./types";

function resolveLocaleAndPaths(slug: string[] | undefined) {
  const { locale, restSegments } = parseLocaleFromSegments({
    segments: slug,
    locales: tenantConfig.locales,
    defaultLocale: tenantConfig.defaultLocale,
  });
  const logicalPathname = segmentsToLogicalPathname(restSegments);
  const visiblePathname = visiblePathnameFromSlugSegments(slug);
  return { locale, logicalPathname, visiblePathname };
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { locale, logicalPathname, visiblePathname } =
    resolveLocaleAndPaths(slug);

  const page = await getPageCached({
    tenantId: tenantConfig.id,
    slug: logicalPathname,
    locale,
  });

  if (!page) return {};
  return buildMetadata({
    seo: page.seo,
    tenant: tenantConfig,
    ctx: {
      pathname: visiblePathname,
      locale: page.locale,
    },
  });
}

export default async function TenantPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = normalizeSearchParams(await searchParams);
  const { locale, logicalPathname } = resolveLocaleAndPaths(slug);

  const { page, navigation } = await loadPageWithNavigation({
    tenantId: tenantConfig.id,
    slug: logicalPathname,
    locale,
  });

  if (!page) {
    logger.warn(
      `Page not found: ${tenantConfig.id}${logicalPathname} (locale ${locale})`
    );
    notFound();
  }

  const pageWithNav = navigation ? { ...page, navigation } : page;

  const Template = await resolveTemplate(pageWithNav.template);

  return (
    <>
      {page.seo.jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(page.seo.jsonLd) }}
        />
      ) : null}
      <Template page={pageWithNav} tenant={tenantConfig}>
        <BlockRenderer
          blocks={page.blocks}
          tenant={tenantConfig.id}
          locale={pageWithNav.locale}
          slug={logicalPathname}
          searchParams={query}
        />
      </Template>
    </>
  );
}
