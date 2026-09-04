import type { ReactNode } from "react";
import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import type { FlexProps } from "./types";

const gapClass = { sm: "gap-2", md: "gap-4", lg: "gap-8" } as const;

export function Flex({
  direction = "row",
  gap = "md",
  align = "center",
  justify = "start",
  wrap = false,
  children,
  className,
  ...box
}: FlexProps & { children?: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex",
        direction === "column" ? "flex-col" : "flex-row",
        gapClass[gap],
        align === "start" && "items-start",
        align === "center" && "items-center",
        align === "end" && "items-end",
        align === "stretch" && "items-stretch",
        justify === "start" && "justify-start",
        justify === "center" && "justify-center",
        justify === "end" && "justify-end",
        justify === "between" && "justify-between",
        wrap && "flex-wrap",
        className
      )}
      style={toBoxStyle(box)}
    >
      {children}
    </div>
  );
}
