import type { BlockInstance, PageData, PageSeo } from "@core/types/page";
import type { FooterCopy, NavigationData, NavItem } from "@core/types/navigation";
import { normalizeLogicalSlug } from "./strapi-query";

export function unwrapStrapiDocument(raw: unknown): Record<string, unknown> | null {
  if (raw == null || typeof raw !== "object") return null;
  const root = raw as Record<string, unknown>;
  if (root.attributes !== undefined && typeof root.attributes === "object") {
    return root.attributes as Record<string, unknown>;
  }
  return root;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function stripComponentMeta(obj: Record<string, unknown>): Record<string, unknown> {
  const isDynamicZoneItem = typeof obj.__component === "string";
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (key === "__component") continue;
    if (key === "id" && isDynamicZoneItem) continue;
    if (Array.isArray(val)) {
      result[key] = val.map((item) =>
        isPlainObject(item) ? stripComponentMeta(item) : item
      );
    } else if (isPlainObject(val)) {
      result[key] = stripComponentMeta(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

function toDynamicZoneBlock(raw: unknown): BlockInstance | null {
  if (!isPlainObject(raw)) return null;
  const { __component, id, ...rest } = raw as Record<string, unknown>;
  if (typeof __component !== "string") return null;

  const type = __component.includes(".") ? __component.split(".").pop()! : __component;

  return {
    id: typeof id === "number" || typeof id === "string" ? String(id) : String(Math.random()),
    type,
    props: stripComponentMeta(rest),
  };
}

function pickSeo(raw: unknown): PageSeo {
  const seo = unwrapStrapiDocument(raw) ?? (isPlainObject(raw) ? raw : null);
  if (!seo) {
    return { title: "", description: "", noIndex: false };
  }
  return {
    title: typeof seo.title === "string" ? seo.title : "",
    description: typeof seo.description === "string" ? seo.description : "",
    ogImage: typeof seo.ogImage === "string" ? seo.ogImage : undefined,
    canonical: typeof seo.canonical === "string" ? seo.canonical : undefined,
    noIndex: Boolean(seo.noIndex),
    jsonLd: isPlainObject(seo.jsonLd) ? seo.jsonLd : undefined,
  };
}

export function toPageData(raw: unknown, requestLocale: string): PageData | null {
  const doc = unwrapStrapiDocument(raw);
  if (!doc) return null;

  const slugRaw = doc.slug;
  if (typeof slugRaw !== "string" || !slugRaw.trim()) return null;
  const slug = normalizeLogicalSlug(slugRaw.trim());

  const blocks: BlockInstance[] = Array.isArray(doc.blocks)
    ? doc.blocks.flatMap((item) => {
        const block = toDynamicZoneBlock(item);
        return block ? [block] : [];
      })
    : [];

  const template = typeof doc.template === "string" ? doc.template : "default";
  const locale =
    typeof doc.lang === "string"
      ? doc.lang
      : typeof doc.locale === "string"
        ? doc.locale
        : requestLocale;
  const slugPattern =
    typeof doc.slugPattern === "string" && doc.slugPattern.trim()
      ? doc.slugPattern.trim()
      : undefined;

  return {
    slug,
    locale,
    template,
    blocks,
    seo: pickSeo(doc.seo),
    ...(slugPattern ? { slugPattern } : {}),
  };
}

function toNavItem(raw: unknown): NavItem | null {
  if (!isPlainObject(raw)) return null;
  const { label, href, isExternal, children } = raw as Record<string, unknown>;
  if (typeof label !== "string" || typeof href !== "string") return null;

  const item: NavItem = {
    label,
    href,
    ...(isExternal === true ? { isExternal: true } : {}),
  };

  if (Array.isArray(children) && children.length > 0) {
    const mapped = children.flatMap((c) => {
      const child = toNavItem(c);
      return child ? [child] : [];
    });
    if (mapped.length > 0) item.children = mapped;
  }

  return item;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toFooterCopy(raw: unknown): FooterCopy | undefined {
  if (!isPlainObject(raw)) return undefined;
  if (typeof raw.tagline !== "string" || typeof raw.linksHeading !== "string") {
    return undefined;
  }
  return {
    tagline: raw.tagline,
    linksHeading: raw.linksHeading,
    contactHeading: str(raw.contactHeading),
    contactPlaceholder: str(raw.contactPlaceholder),
    copyrightReserved: str(raw.copyrightReserved),
  };
}

export function toNavigationData(raw: unknown): NavigationData | null {
  const doc = unwrapStrapiDocument(raw);
  if (!doc) return null;

  const header: NavItem[] = Array.isArray(doc.header)
    ? doc.header.flatMap((item) => {
        const nav = toNavItem(item);
        return nav ? [nav] : [];
      })
    : [];

  const footer: NavItem[] = Array.isArray(doc.footer)
    ? doc.footer.flatMap((item) => {
        const nav = toNavItem(item);
        return nav ? [nav] : [];
      })
    : [];

  if (header.length === 0 && footer.length === 0) return null;

  const footerCopy = toFooterCopy(doc.footerCopy);

  return {
    header,
    footer,
    ...(footerCopy ? { footerCopy } : {}),
  };
}

export function patternToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/:[\w-]+/g, "([^/]+)");
  return new RegExp(`^${escaped}$`);
}

export interface PatternCandidate {
  slug: string;
  slugPattern?: string;
}

export function findPatternMatch(
  candidates: PatternCandidate[],
  slug: string
): string | null {
  const logical = normalizeLogicalSlug(slug);
  for (const candidate of candidates) {
    const pattern = candidate.slugPattern ?? candidate.slug;
    if (!pattern || !pattern.includes(":")) continue;
    if (patternToRegex(pattern).test(logical)) return pattern;
  }
  return null;
}

export function toPatternCandidate(raw: unknown): PatternCandidate | null {
  const doc = unwrapStrapiDocument(raw);
  if (!doc || typeof doc.slug !== "string") return null;
  return {
    slug: doc.slug,
    slugPattern:
      typeof doc.slugPattern === "string" && doc.slugPattern.trim()
        ? doc.slugPattern.trim()
        : undefined,
  };
}
