import type { Metadata } from "next";
import { headers } from "next/headers";
import tenantConfig from "@tenant/config";
import { Header } from "@tenant/blocks/header/header";
import { getAdapter } from "@core/data/fetcher";
import { localizeHref, parseLocaleFromSegments } from "@core/i18n/locale-path";
import { ThemeProvider } from "@core/theme/provider";
import { Footer } from "@shared/components/layout/footer";
import type { NavItem } from "@core/types/navigation";
import { isExternalHref } from "@shared/utils/url";
import { TenantAnalytics } from "./tenant-analytics";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  if (!tenantConfig.logoUrl) return {};
  const icon = tenantConfig.logoUrl;
  return {
    icons: {
      icon,
      apple: icon,
      shortcut: icon,
    },
  };
}

export default async function TenantLayout({ children, params }: LayoutProps) {
  const { domain } = await params;

  const headerList = await headers();
  const browserPath = headerList.get("x-pathname") ?? "/";
  const { locale: activeLocale } = parseLocaleFromSegments(
    browserPath.split("/").filter(Boolean),
    tenantConfig.locales,
    tenantConfig.defaultLocale
  );

  const adapter = getAdapter(domain);
  const nav = await adapter.getNavigation(domain, activeLocale);

  const localizeNav = (items: NavItem[]): NavItem[] =>
    items.map((item) => ({
      ...item,
      href: localizeHref(item.href, activeLocale, tenantConfig.defaultLocale, tenantConfig.locales, isExternalHref),
    }));

  const headerNav = nav?.header ? localizeNav(nav.header) : [];
  const footerNav = nav?.footer ? localizeNav(nav.footer) : [];

  return (
    <ThemeProvider tokens={tenantConfig.theme}>
      <div className="min-h-screen flex flex-col" suppressHydrationWarning>
        {nav?.header && (
          <Header
            tenantId={tenantConfig.id}
            tenantName={tenantConfig.name}
            navigation={headerNav}
            logoUrl={tenantConfig.logoUrl}
            locales={tenantConfig.locales}
            defaultLocale={tenantConfig.defaultLocale}
          />
        )}
        <main className="flex min-h-0 flex-1 flex-col" suppressHydrationWarning>
          {children}
        </main>
        {nav?.footer && nav.footerCopy && (
          <Footer
            tenantName={tenantConfig.name}
            navigation={footerNav}
            contact={tenantConfig.contact}
            copy={nav.footerCopy}
          />
        )}
      </div>
      <TenantAnalytics tenant={domain} />
    </ThemeProvider>
  );
}
