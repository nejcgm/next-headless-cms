import type { FooterCopy, NavItem } from "@core/types/navigation";
import type { TenantContact } from "@core/types/tenant";

export interface FooterProps {
  tenantName: string;
  navigation: NavItem[];
  contact?: TenantContact | null;
  copy: FooterCopy;
}
