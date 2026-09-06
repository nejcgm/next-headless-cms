import Link from "next/link";
import { cn } from "@shared/utils/cn";
import { isExternalHref } from "@shared/utils/url";
import { toBoxStyle } from "@shared/utils/box-style";
import type { ButtonBlockProps } from "./types";

export function ButtonBlock({
  label,
  href,
  variant = "primary",
  className,
  ...box
}: ButtonBlockProps & { className?: string }) {
  const style = toBoxStyle(box);
  const styles = cn(
    "inline-flex items-center justify-center font-semibold rounded-[var(--radius)] transition-colors px-8 py-4",
    variant === "primary" &&
      "bg-[var(--color-primary)] text-white hover:opacity-90",
    variant === "secondary" &&
      "bg-[var(--color-secondary)] text-white hover:opacity-90",
    variant === "outline" &&
      "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white",
    className
  );

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles}
        style={style}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={styles} style={style}>
      {label}
    </Link>
  );
}
