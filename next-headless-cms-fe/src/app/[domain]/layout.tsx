import type { Metadata } from "next";
import tenantConfig from "@tenant/config";
import { ThemeProvider } from "@core/theme/provider";
import { TenantAnalytics } from "./tenant-analytics";
import type { LayoutProps } from "./types";

export async function generateMetadata(): Promise<Metadata> {
  const icon = tenantConfig.faviconUrl ?? tenantConfig.logoUrl;
  if (!icon) return {};
  return {
    icons: { icon, apple: icon, shortcut: icon },
  };
}

export default async function TenantLayout({ children, params }: LayoutProps) {
  const { domain } = await params;

  return (
    <ThemeProvider tokens={tenantConfig.theme}>
      {children}
      <TenantAnalytics tenant={domain} />
    </ThemeProvider>
  );
}
