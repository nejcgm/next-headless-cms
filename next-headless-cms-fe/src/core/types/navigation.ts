export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  isExternal?: boolean;
}

export interface FooterCopy {
  tagline: string;
  linksHeading: string;
  contactHeading: string;
  contactPlaceholder: string;
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
