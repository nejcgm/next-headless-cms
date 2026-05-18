import type { Metadata } from "next";
import tenantConfig from "@tenant/config";
import { ThemeProvider } from "@core/theme/provider";
import { TenantAnalytics } from "./tenant-analytics";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  if (!tenantConfig.logoUrl) return {};
  const icon = tenantConfig.logoUrl;
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
