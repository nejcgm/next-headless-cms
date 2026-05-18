export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  isExternal?: boolean;
}

/** Footer chrome copy (mock `navigation.json` or CMS). */
export interface FooterCopy {
  tagline: string;
  linksHeading: string;
  contactHeading: string;
  contactPlaceholder: string;
  /** Text after “© {year} {tenantName}. ” */
  copyrightReserved: string;
}

export interface NavigationData {
  header: NavItem[];
  footer: NavItem[];
  footerCopy?: FooterCopy;
}

export interface Breadcrumb {
  label: string;
  href: string;
}
