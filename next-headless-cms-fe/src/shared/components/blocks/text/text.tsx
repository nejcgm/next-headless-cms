import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import type { TextProps } from "./types";

export function Text({
  content,
  variant = "body",
  className,
  ...box
}: TextProps & { className?: string }) {
  const style = toBoxStyle(box);

  if (variant === "lead") {
    return (
      <p
        className={cn("text-xl md:text-2xl text-[var(--color-muted-foreground)]", className)}
        style={style}
      >
        {content}
      </p>
    );
  }
  if (variant === "caption") {
    return (
      <p
        className={cn("text-sm text-[var(--color-muted-foreground)]", className)}
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
      className={cn("text-lg text-[var(--color-muted-foreground)] leading-relaxed", className)}
      style={style}
    >
      {content}
    </p>
  );
}
