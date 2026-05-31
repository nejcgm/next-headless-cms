import { notFound } from "next/navigation";
import tenantConfig from "@tenant/config";
import { getPageCached, loadPageWithNavigation } from "@core/data/fetcher";
import { BlockRenderer } from "@core/blocks/renderer";
import {
  parseLocaleFromSegments,
  segmentsToLogicalPathname,
  visiblePathnameFromSlugSegments,
} from "@core/i18n/locale-path";
import { resolveTemplate } from "@core/routing/resolver";
import { buildMetadata } from "@core/seo/metadata";
import { logger } from "@shared/lib/logger";

interface PageProps {
  params: Promise<{ domain: string; slug?: string[] }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

function resolveLocaleAndPaths(slug: string[] | undefined) {
  const { locale, restSegments } = parseLocaleFromSegments(
    slug,
    tenantConfig.locales,
    tenantConfig.defaultLocale
  );
  const logicalPathname = segmentsToLogicalPathname(restSegments);
  const visiblePathname = visiblePathnameFromSlugSegments(slug);
  return { locale, logicalPathname, visiblePathname };
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { locale, logicalPathname, visiblePathname } = resolveLocaleAndPaths(slug);

  const page = await getPageCached(tenantConfig.id, logicalPathname, locale);

  if (!page) return {};
  return buildMetadata(page.seo, tenantConfig, { pathname: visiblePathname, locale: page.locale });
}

export default async function TenantPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const { locale, logicalPathname } = resolveLocaleAndPaths(slug);

  const { page, navigation } = await loadPageWithNavigation(
    tenantConfig.id,
    logicalPathname,
    locale
  );

  if (!page) {
    logger.warn(`Page not found: ${tenantConfig.id}${logicalPathname} (locale ${locale})`);
    notFound();
  }

  const pageWithNav = navigation ? { ...page, navigation } : page;

  const Template = await resolveTemplate(pageWithNav.template);

  const blocksWithQuery = page.blocks.map((block) => ({
    ...block,
    props: {
      ...block.props,
      ...query,
    },
  }));

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
          blocks={blocksWithQuery}
          tenant={tenantConfig.id}
          locale={pageWithNav.locale}
          slug={logicalPathname}
        />
      </Template>
    </>
  );
}
