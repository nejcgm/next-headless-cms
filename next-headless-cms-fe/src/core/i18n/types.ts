import type { NavItem } from "@core/types/navigation";

export interface ParseLocaleFromSegmentsArgs {
  segments: string[] | undefined;
  locales: readonly string[];
  defaultLocale: string;
}

export interface PrefixPathnameArgs {
  logicalPathname: string;
  locale: string;
  defaultLocale: string;
}

export interface StripLocaleFromPathnameArgs {
  pathname: string;
  locales: readonly string[];
  defaultLocale: string;
}

export interface LocalizeNavItemsArgs {
  items: NavItem[];
  locale: string;
  defaultLocale: string;
  locales: readonly string[];
}

export interface LocalizeHrefArgs {
  href: string;
  activeLocale: string;
  defaultLocale: string;
  locales: readonly string[];
  isExternal: (h: string) => boolean;
}
