import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import type { TextFontSize, TextProps } from "./types";

const FONT_SIZE_STEPS: Record<Exclude<TextFontSize, "custom">, string> = {
  cardTitle: "1.25rem",
  sectionTitle: "clamp(1.75rem, 3.2vw, 2.5rem)",
  priceCompact: "clamp(1.25rem, 2.2vw, 1.75rem)",
  pageTitle: "clamp(2.25rem, 5vw, 3.25rem)",
  price: "clamp(1.5rem, 2.5vw, 2rem)",
  display: "clamp(2.5rem, 6vw, 4rem)",
  statement: "clamp(1.5rem, 2.8vw, 2rem)",
};

export function Text({
  content,
  variant = "body",
  bold = false,
  fontSize,
  customFontSize,
  className,
  ...box
}: TextProps & { className?: string }) {
  const style = toBoxStyle(box);
  const weight = bold ? "font-bold" : undefined;

  const resolvedSize =
    fontSize === "custom"
      ? customFontSize
      : fontSize
      ? FONT_SIZE_STEPS[fontSize]
      : undefined;
  if (resolvedSize) {
    style.fontSize = resolvedSize;
    style.lineHeight = 1.625;
  }

  if (variant === "lead") {
    return (
      <p
        className={cn(
          "text-xl md:text-2xl text-[var(--color-muted-foreground)]",
          weight,
          className
        )}
        style={style}
      >
        {content}
      </p>
    );
  }
  if (variant === "caption") {
    return (
      <p
        className={cn(
          "text-sm text-[var(--color-muted-foreground)]",
          weight,
          className
        )}
        style={style}
      >
        {content}
      </p>
    );
  }
  if (variant === "label") {
    return (
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]",
          weight,
          className
        )}
        style={style}
      >
        {content}
      </p>
    );
  }

  return (
    <p
      className={cn(
        "text-lg text-[var(--color-muted-foreground)] leading-relaxed",
        weight,
        className
      )}
      style={style}
    >
      {content}
    </p>
  );
}
