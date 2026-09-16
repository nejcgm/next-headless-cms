import NextLink from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@shared/utils/cn";
import { isExternalHref } from "@shared/utils/url";
import { toBoxStyle } from "@shared/utils/box-style";
import type { LinkBlockProps } from "./types";

function isNewTabHref(href: string): boolean {
  return /^(https?:)?\/\//i.test(href);
}

export function LinkBlock({
  href,
  variant = "primary",
  showArrow = false,
  target,
  fontSize,
  fontWeight,
  textAlign,
  borderRadius,
  accessibleLabel,
  className,
  children,
  ...box
}: LinkBlockProps & { className?: string }) {
  const style: CSSProperties = { ...toBoxStyle(box), textAlign };
  if (fontSize != null) style.fontSize = `${fontSize}px`;
  if (fontWeight != null) style.fontWeight = fontWeight;
  if (borderRadius != null) style.borderRadius = `${borderRadius}px`;

  const styles = cn(
    "inline-flex items-center gap-1 font-medium transition-opacity hover:opacity-80",
    variant === "primary" && "text-[var(--color-primary)]",
    variant === "secondary" &&
      "text-[var(--color-muted-foreground)] font-normal hover:text-[var(--color-primary)]",
    variant === "ghost" && "text-[var(--color-foreground)] hover:opacity-70",
    variant === "link" && "text-[var(--color-primary)] underline underline-offset-2",
    className
  );

  const resolvedTarget = target ?? (isNewTabHref(href) ? "_blank" : "_self");
  const isNewTab = resolvedTarget === "_blank";

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target={isNewTab ? "_blank" : undefined}
        rel={isNewTab ? "noopener noreferrer" : undefined}
        aria-label={accessibleLabel}
        className={styles}
        style={style}
      >
        {children}
        {showArrow && <span aria-hidden>→</span>}
      </a>
    );
  }

  return (
    <NextLink href={href} aria-label={accessibleLabel} className={styles} style={style}>
      {children}
      {showArrow && <span aria-hidden>→</span>}
    </NextLink>
  );
}
