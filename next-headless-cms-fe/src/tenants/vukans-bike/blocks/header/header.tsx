"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  localizeHref,
  parseLocaleFromSegments,
  prefixPathname,
  segmentsToLogicalPathname,
} from "@core/i18n/locale-path";
import type { NavItem } from "@core/types/navigation";
import { cn } from "@shared/utils/cn";
import { isNavItemActive, normalizeTenantPathname } from "@shared/utils/nav-active";
import { isExternalHref } from "@shared/utils/url";

interface HeaderProps {
  tenantId: string;
  tenantName: string;
  navigation: NavItem[];
  logoUrl?: string;
  locales: string[];
  defaultLocale: string;
}

export function Header({
  tenantId,
  tenantName,
  navigation,
  logoUrl,
  locales,
  defaultLocale,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const currentPath = normalizeTenantPathname(pathname, tenantId);

  const { activeLocale, logicalPathname } = useMemo(() => {
    const segments = currentPath.split("/").filter(Boolean);
    const { locale, restSegments } = parseLocaleFromSegments(segments, locales, defaultLocale);
    return {
      activeLocale: locale,
      logicalPathname: segmentsToLogicalPathname(restSegments),
    };
  }, [currentPath, locales, defaultLocale]);

  const homeHref = prefixPathname("/", activeLocale, defaultLocale);

  return (
    <header className="bg-[var(--color-background)] border-b border-[var(--color-border)] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <a href={homeHref} className="flex min-w-0 items-center">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={tenantName}
                  width={200}
                  height={40}
                  className="h-10 w-auto max-h-10 max-w-[min(200px,38vw)] object-contain object-left sm:max-w-[min(200px,45vw)]"
                  priority
                />
              ) : (
                <span className="font-heading text-xl font-bold text-[var(--color-primary)]">
                  {tenantName}
                </span>
              )}
            </a>

            <div
              className="ml-2 flex shrink-0 items-center gap-0.5 rounded-md border border-[var(--color-border)] px-0.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide sm:ml-3 sm:text-xs"
              aria-label="Language"
            >
              {locales.map((loc) => {
                const href = prefixPathname(logicalPathname, loc, defaultLocale);
                const active = loc === activeLocale;
                return (
                  <a
                    key={loc}
                    href={href}
                    className={cn(
                      "rounded px-1.5 py-0.5 transition-colors sm:px-2",
                      active
                        ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                        : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {loc}
                  </a>
                );
              })}
            </div>
          </div>

          <nav className="hidden md:flex flex-1 items-center justify-end gap-1">
            {navigation.map((item) => {
              const navHref = localizeHref(item.href, activeLocale, defaultLocale, locales, isExternalHref);
              const active = isNavItemActive(currentPath, item.href, locales, defaultLocale);
              const external = isExternalHref(item.href);
              return (
                <a
                  key={`${item.href}-${item.label}`}
                  href={navHref}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    active
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/15"
                      : "text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)]"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <button
            type="button"
            className="md:hidden shrink-0 rounded-md p-2 text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="space-y-1 py-2">
            {navigation.map((item) => {
              const navHref = localizeHref(item.href, activeLocale, defaultLocale, locales, isExternalHref);
              const active = isNavItemActive(currentPath, item.href, locales, defaultLocale);
              const external = isExternalHref(item.href);
              return (
                <a
                  key={`${item.href}-${item.label}-m`}
                  href={navHref}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "block rounded-md px-3 py-2 text-base font-medium transition-colors",
                    active
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/15"
                      : "text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
                  )}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
