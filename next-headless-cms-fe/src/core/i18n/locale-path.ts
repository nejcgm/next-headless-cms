import type { NavItem } from "@core/types/navigation";
import { isExternalHref } from "@shared/utils/url";

export function parseLocaleFromSegments(
  segments: string[] | undefined,
  locales: readonly string[],
  defaultLocale: string
): { locale: string; restSegments: string[] } {
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

export function prefixPathname(logicalPathname: string, locale: string, defaultLocale: string): string {
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

export function stripLocaleFromPathname(
  pathname: string,
  locales: readonly string[],
  defaultLocale: string
): string {
  const trimmed = pathname.replace(/\/$/, "") || "/";
  const parts = trimmed.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  const first = parts[0]!;
  if (locales.includes(first) && first !== defaultLocale) {
    return segmentsToLogicalPathname(parts.slice(1));
  }
  return trimmed === "/" ? "/" : `/${parts.join("/")}`;
}

export function localizeNavItems(
  items: NavItem[],
  locale: string,
  defaultLocale: string,
  locales: readonly string[],
): NavItem[] {
  return items.map((item) => ({
    ...item,
    href: localizeHref(item.href, locale, defaultLocale, locales, isExternalHref),
    children: item.children
      ? localizeNavItems(item.children, locale, defaultLocale, locales)
      : undefined,
  }));
}

export function localizeHref(
  href: string,
  activeLocale: string,
  defaultLocale: string,
  locales: readonly string[],
  isExternal: (h: string) => boolean
): string {
  if (!href || isExternal(href)) return href;
  const hashIdx = href.indexOf("#");
  const pathPart = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  const hashPart = hashIdx >= 0 ? href.slice(hashIdx) : "";
  if (pathPart === "" || pathPart === "#") return href;

  const logical = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  const stripped = stripLocaleFromPathname(logical, locales, defaultLocale);
  return `${prefixPathname(stripped, activeLocale, defaultLocale)}${hashPart}`;
}
