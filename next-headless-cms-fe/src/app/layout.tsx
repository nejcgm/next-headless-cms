import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import "@core/init";
import tenantConfig from "@tenant/config";
import { getSiteOrigin } from "@core/seo/site-url";
import { cn } from "@shared/utils/cn";
import type { RootLayoutProps } from "./types";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang={tenantConfig.defaultLocale}
      className={cn(montserrat.variable, inter.variable)}
      suppressHydrationWarning
    >
      <body className="antialiased font-body" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
