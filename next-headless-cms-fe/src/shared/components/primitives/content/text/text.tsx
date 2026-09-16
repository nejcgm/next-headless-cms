import { createElement } from "react";
import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import type { TextProps } from "./types";

export function Text({
  content,
  as = "p",
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
        "text-lg text-[var(--color-muted-foreground)] leading-relaxed",
        bold && "font-bold",
        uppercase && "uppercase",
        className
      ),
      style,
    },
    content
  );
}
