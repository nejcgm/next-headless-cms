import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import type { IconName, IconProps } from "./types";

const sizeClass = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
} as const;

const svgSize = {
  sm: 16,
  md: 18,
  lg: 22,
} as const;

function IconSvg({ name, size }: { name: IconName; size: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (name === "map-pin") {
    return (
      <svg {...common}>
        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function IconBlock({
  name,
  label,
  size = "md",
  className,
  ...box
}: IconProps & { className?: string }) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--color-primary)] text-[var(--color-primary)]",
        sizeClass[size],
        className
      )}
      style={toBoxStyle(box)}
    >
      <IconSvg name={name} size={svgSize[size]} />
    </span>
  );
}
