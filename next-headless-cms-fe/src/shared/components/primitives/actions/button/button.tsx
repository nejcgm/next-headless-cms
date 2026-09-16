import NextLink from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@shared/utils/cn";
import { isExternalHref } from "@shared/utils/url";
import { toBoxStyle } from "@shared/utils/box-style";
import type { ButtonBlockProps } from "./types";

export function ButtonBlock({
  href,
  variant = "primary",
  disabled = false,
  fontSize,
  fontWeight,
  textAlign,
  borderRadius,
  overflow,
  accessibleLabel,
  className,
  children,
  ...box
}: ButtonBlockProps & { className?: string }) {
  const style: CSSProperties = { ...toBoxStyle(box), textAlign, overflow };
  if (fontSize != null) style.fontSize = `${fontSize}px`;
  if (fontWeight != null) style.fontWeight = fontWeight;
  if (borderRadius != null) style.borderRadius = `${borderRadius}px`;

  const styles = cn(
    "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius)] transition-colors px-8 py-4",
    variant === "primary" && "bg-[var(--color-primary)] text-white hover:opacity-90",
    variant === "secondary" &&
      "bg-[var(--color-secondary)] text-white hover:opacity-90",
    variant === "outline" &&
      "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white",
    variant === "ghost" &&
      "text-[var(--color-primary)] hover:bg-[var(--color-muted)]",
    disabled && "pointer-events-none opacity-50",
    className
  );

  if (disabled) {
    return (
      <span aria-disabled="true" aria-label={accessibleLabel} className={styles} style={style}>
        {children}
      </span>
    );
  }

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={accessibleLabel}
        className={styles}
        style={style}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink href={href} aria-label={accessibleLabel} className={styles} style={style}>
      {children}
    </NextLink>
  );
}
