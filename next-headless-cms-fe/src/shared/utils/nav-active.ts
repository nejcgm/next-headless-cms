import { stripLocaleFromPathname } from "@core/i18n/locale-path";

/**
 * Strip `/{tenantId}` prefix when present (Next middleware rewrite exposes it in pathname).
 */
export function normalizeTenantPathname(pathname: string, tenantId: string): string {
  const prefix = `/${tenantId}`;
  if (pathname === prefix) return "/";
  if (pathname.startsWith(`${prefix}/`)) {
    const rest = pathname.slice(prefix.length);
    return rest || "/";
  }
  return pathname || "/";
}

/**
 * Active when pathname equals href, or pathname is under href (e.g. /bikes/x under /bikes).
 * When `locales` and `defaultLocale` are passed, locale prefix is stripped from `pathname` before compare.
 * Hash-only hrefs are never active.
 */
export function isNavItemActive(
  pathname: string,
  href: string,
  locales?: readonly string[],
  defaultLocale?: string
): boolean {
  if (!href || href.startsWith("#")) return false;
  const pathForCompare =
    locales && defaultLocale !== undefined
      ? stripLocaleFromPathname(pathname, locales, defaultLocale)
      : pathname;
  const hrefIsAbsolute = /^https?:\/\//i.test(href);
  const hrefLogical =
    !hrefIsAbsolute && locales && defaultLocale !== undefined
      ? stripLocaleFromPathname(href, locales, defaultLocale)
      : href;
  const h = hrefLogical === "/" ? "/" : hrefLogical.replace(/\/$/, "") || "/";
  const p = pathForCompare.replace(/\/$/, "") || "/";
  if (p === h) return true;
  if (h !== "/" && p.startsWith(`${h}/`)) return true;
  return false;
}
