import type { Metadata } from "next";
import "./globals.css";

// Initialize core systems (registers blocks, etc.)
import "@core/init";
import tenantConfig from "@tenant/config";
import { getSiteOrigin } from "@core/seo/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin(tenantConfig)),
  title: {
    default: tenantConfig.name,
    template: `%s | ${tenantConfig.name}`,
  },
  description:
    tenantConfig.defaultMetaDescription ??
    `${tenantConfig.name} — multi-tenant CMS site`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={tenantConfig.defaultLocale} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
