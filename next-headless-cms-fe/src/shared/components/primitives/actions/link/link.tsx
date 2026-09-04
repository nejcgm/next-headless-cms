import Link from "next/link";
import { cn } from "@shared/utils/cn";
import { isExternalHref } from "@shared/utils/url";
import { toBoxStyle } from "@shared/utils/box-style";
import type { LinkBlockProps } from "./types";

function isNewTabHref(href: string): boolean {
  return /^(https?:)?\/\//i.test(href);
}

export function LinkBlock({
  label,
  href,
  variant = "accent",
  showArrow = false,
  className,
  ...box
}: LinkBlockProps & { className?: string }) {
  const style = toBoxStyle(box);
  const text = showArrow ? `${label} →` : label;
  const styles = cn(
    "inline-flex items-center gap-1 font-medium transition-opacity hover:opacity-80",
    variant === "accent" && "text-[var(--color-primary)]",
    variant === "muted" &&
      "text-[var(--color-muted-foreground)] font-normal hover:text-[var(--color-primary)]",
    className
  );

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target={isNewTabHref(href) ? "_blank" : undefined}
        rel={isNewTabHref(href) ? "noopener noreferrer" : undefined}
        className={styles}
        style={style}
      >
        {text}
      </a>
    );
  }

  return (
    <Link href={href} className={styles} style={style}>
      {text}
    </Link>
  );
}
