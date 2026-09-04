import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import type { HeadingProps } from "./types";

const variantClass = {
  display:
    "font-heading text-4xl md:text-6xl font-bold text-[var(--color-foreground)] leading-tight",
  title:
    "font-heading text-3xl md:text-4xl font-bold text-[var(--color-foreground)]",
  section:
    "font-heading text-2xl md:text-3xl font-bold text-[var(--color-foreground)]",
} as const;

function resolveVariant(
  level: 1 | 2 | 3 | 4 | 5 | 6,
  variant: HeadingProps["variant"]
): keyof typeof variantClass {
  if (variant) return variant;
  if (level === 1) return "display";
  if (level === 2) return "title";
  return "section";
}

export function Heading({
  content,
  level = 2,
  variant,
  className,
  ...box
}: HeadingProps & { className?: string }) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const visual = resolveVariant(level, variant);

  return (
    <Tag
      className={cn(variantClass[visual], className)}
      style={toBoxStyle(box)}
    >
      {content}
    </Tag>
  );
}
