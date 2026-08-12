import type { NavItem } from "@core/types/navigation";
import { isExternalHref } from "@shared/utils/url";
import type {
  LocalizeHrefArgs,
  LocalizeNavItemsArgs,
  ParseLocaleFromSegmentsArgs,
  PrefixPathnameArgs,
  StripLocaleFromPathnameArgs,
} from "./types";

export function parseLocaleFromSegments({
  segments,
  locales,
  defaultLocale,
}: ParseLocaleFromSegmentsArgs): { locale: string; restSegments: string[] } {
  const segs = segments?.filter(Boolean) ?? [];
  if (segs.length === 0) {
    return { locale: defaultLocale, restSegments: [] };
  }
  const first = segs[0]!;
  if (locales.includes(first) && first !== defaultLocale) {
    return { locale: first, restSegments: segs.slice(1) };
  }
  return { locale: defaultLocale, restSegments: segs };
}

export function segmentsToLogicalPathname(restSegments: string[]): string {
  if (restSegments.length === 0) return "/";
  return `/${restSegments.join("/")}`;
}

export function visiblePathnameFromSlugSegments(slug: string[] | undefined): string {
  const segs = slug?.filter(Boolean) ?? [];
  if (segs.length === 0) return "/";
  return `/${segs.join("/")}`;
}

export function prefixPathname({
  logicalPathname,
  locale,
  defaultLocale,
}: PrefixPathnameArgs): string {
  const norm =
    logicalPathname === "" || logicalPathname === "/"
      ? "/"
      : logicalPathname.startsWith("/")
        ? logicalPathname
        : `/${logicalPathname}`;
  if (locale === defaultLocale) {
    return norm;
  }
  if (norm === "/") return `/${locale}`;
  return `/${locale}${norm}`;
}

export function stripLocaleFromPathname({
  pathname,
  locales,
  defaultLocale,
}: StripLocaleFromPathnameArgs): string {
  const trimmed = pathname.replace(/\/$/, "") || "/";
  const parts = trimmed.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  const first = parts[0]!;
  if (locales.includes(first) && first !== defaultLocale) {
    return segmentsToLogicalPathname(parts.slice(1));
  }
  return trimmed === "/" ? "/" : `/${parts.join("/")}`;
}

export function localizeNavItems({
  items,
  locale,
  defaultLocale,
  locales,
}: LocalizeNavItemsArgs): NavItem[] {
  return items.map((item) => ({
    ...item,
    href: localizeHref({
      href: item.href,
      activeLocale: locale,
      defaultLocale,
      locales,
      isExternal: isExternalHref,
    }),
    children: item.children
      ? localizeNavItems({
          items: item.children,
          locale,
          defaultLocale,
          locales,
        })
      : undefined,
  }));
}

export function localizeHref({
  href,
  activeLocale,
  defaultLocale,
  locales,
  isExternal,
}: LocalizeHrefArgs): string {
  if (!href || isExternal(href)) return href;
  const hashIdx = href.indexOf("#");
  const pathPart = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  const hashPart = hashIdx >= 0 ? href.slice(hashIdx) : "";
  if (pathPart === "" || pathPart === "#") return href;

  const logical = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  const stripped = stripLocaleFromPathname({
    pathname: logical,
    locales,
    defaultLocale,
  });
  return `${prefixPathname({
    logicalPathname: stripped,
    locale: activeLocale,
    defaultLocale,
  })}${hashPart}`;
}
