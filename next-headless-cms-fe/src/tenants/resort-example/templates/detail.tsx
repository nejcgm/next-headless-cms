import { getNavigationCached } from "@core/data/fetcher";
import { localizeNavItems } from "@core/i18n/locale-path";
import type { TemplateProps } from "@core/types/page";
import { Header } from "@tenant/blocks/header/header";
import { Footer } from "@tenant/blocks/footer/footer";

export default async function DetailTemplate({ page, tenant, children }: TemplateProps) {
  const nav = await getNavigationCached(tenant.id, page.locale);

  const headerNav = nav?.header
    ? localizeNavItems(nav.header, page.locale, tenant.defaultLocale, tenant.locales)
    : [];
  const footerNav = nav?.footer
    ? localizeNavItems(nav.footer, page.locale, tenant.defaultLocale, tenant.locales)
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      {nav?.header && (
        <Header
          tenantId={tenant.id}
          tenantName={tenant.name}
          navigation={headerNav}
          logoUrl={tenant.logoUrl}
          locales={tenant.locales}
          defaultLocale={tenant.defaultLocale}
        />
      )}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
            <div className="min-w-0">{children}</div>
            <aside className="hidden lg:block">
              {/* Sidebar populated by blocks passed as children of a sidebar zone */}
            </aside>
          </div>
        </div>
      </main>
      {nav?.footer && nav.footerCopy && (
        <Footer
          tenantName={tenant.name}
          navigation={footerNav}
          contact={tenant.contact}
          copy={nav.footerCopy}
        />
      )}
    </div>
  );
}
