import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import { ICON_MAP } from "./icon-map";
import type { IconProps } from "./types";

export function IconBlock({
  name,
  label,
  size = 24,
  className,
  ...box
}: IconProps & { className?: string }) {
  const LucideIcon = ICON_MAP[name];
  const style = toBoxStyle(box);
  style.width = size;
  style.height = size;

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-flex shrink-0 items-center justify-center text-[var(--color-primary)]",
        className
      )}
      style={style}
    >
      <LucideIcon size={size} strokeWidth={1.75} aria-hidden />
    </span>
  );
}
