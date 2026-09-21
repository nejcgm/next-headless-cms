import { createElement } from "react";
import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import type { TextProps } from "./types";

export function Text({
  content,
  as = "p",
  fontFamily,
  fontSize,
  lineHeight,
  bold = false,
  uppercase = false,
  letterSpacing,
  className,
  ...box
}: TextProps & { className?: string }) {
  const style = toBoxStyle(box);
  if (fontSize != null) style.fontSize = `${fontSize}px`;
  if (lineHeight != null) style.lineHeight = lineHeight;
  if (letterSpacing != null) style.letterSpacing = `${letterSpacing}px`;

  return createElement(
    as,
    {
      className: cn(
        "text-lg text-[var(--color-muted-foreground)]",
        bold ? "leading-tight" : "leading-relaxed",
        fontFamily === "heading" && "font-heading",
        fontFamily === "display" && "font-display",
        bold && "font-bold",
        uppercase && "uppercase",
        className
      ),
      style,
    },
    content
  );
}
