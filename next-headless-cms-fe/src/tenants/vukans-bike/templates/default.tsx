import { localizeNavItems } from "@core/i18n/locale-path";
import type { TemplateProps } from "@core/types/page";
import { Header } from "@tenant/blocks/header/header";
import { Footer } from "@tenant/blocks/footer/footer";

export default async function DefaultTemplate({ page, tenant, children }: TemplateProps) {
  const nav = page.navigation;

  const headerNav = nav?.header
    ? localizeNavItems({ items: nav.header, locale: page.locale, defaultLocale: tenant.defaultLocale, locales: tenant.locales })
    : [];
  const footerNav = nav?.footer
    ? localizeNavItems({ items: nav.footer, locale: page.locale, defaultLocale: tenant.defaultLocale, locales: tenant.locales })
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
      <main className="flex min-h-0 flex-1 flex-col">
        {children}
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
