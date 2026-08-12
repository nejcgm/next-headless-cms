import type { NavItem } from "@core/types/navigation";

export interface HeaderProps {
  tenantId: string;
  tenantName: string;
  navigation: NavItem[];
  logoUrl?: string;
  locales: string[];
  defaultLocale: string;
}
