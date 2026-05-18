/**
 * URL locale prefixes: default locale has no prefix; others use `/{locale}/...`.
 */

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

/** Logical pathname from segments after locale strip (leading slash, `/` for home). */
export function segmentsToLogicalPathname(restSegments: string[]): string {
  if (restSegments.length === 0) return "/";
  return `/${restSegments.join("/")}`;
}

/** Browser-visible path: `/` or `/de` or `/de/about` from `[[...slug]]` param. */
export function visiblePathnameFromSlugSegments(slug: string[] | undefined): string {
  const segs = slug?.filter(Boolean) ?? [];
  if (segs.length === 0) return "/";
  return `/${segs.join("/")}`;
}

/**
 * Prefix internal path for active locale.
 * @param logicalPathname e.g. `/about`, `/`
 */
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

/**
 * Strip optional leading `/{locale}` when locale is non-default.
 * @param pathname browser path e.g. `/de/about` or `/about`
 */
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

/**
 * Apply locale prefix to an internal nav href. Leaves external URLs and hash-only links unchanged.
 */
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
