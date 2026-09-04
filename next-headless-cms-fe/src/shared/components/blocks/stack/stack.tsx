import type { ReactNode } from "react";
import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import type { StackProps } from "./types";

const gapClass = { sm: "gap-2", md: "gap-4", lg: "gap-8" } as const;
const alignClass = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

export function Stack({
  gap = "md",
  align = "stretch",
  children,
  className,
  ...box
}: StackProps & { children?: ReactNode; className?: string }) {
  return (
    <div
      className={cn("flex flex-col", gapClass[gap], alignClass[align], className)}
      style={toBoxStyle(box)}
    >
      {children}
    </div>
  );
}
