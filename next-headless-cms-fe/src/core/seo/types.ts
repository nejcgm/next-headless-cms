import type { PageSeo } from "@core/types/page";
import type { TenantConfig } from "@core/types/tenant";

export interface BuildMetadataContext {
  pathname: string;
  locale?: string;
}

export interface BuildMetadataArgs {
  seo: PageSeo;
  tenant: TenantConfig;
  ctx?: BuildMetadataContext;
}
