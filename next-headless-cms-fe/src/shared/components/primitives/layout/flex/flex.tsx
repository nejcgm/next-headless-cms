import type { ReactNode } from "react";
import { cn } from "@shared/utils/cn";
import { toBoxStyle, toCssSize } from "@shared/utils/box-style";
import type { FlexProps } from "./types";

export function Flex({
  direction = "row",
  gap = "16",
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
        align === "start" && "items-start",
        align === "center" && "items-center",
        align === "end" && "items-end",
        align === "stretch" && "items-stretch",
        align === "baseline" && "items-baseline",
        justify === "start" && "justify-start",
        justify === "center" && "justify-center",
        justify === "end" && "justify-end",
        justify === "between" && "justify-between",
        justify === "around" && "justify-around",
        justify === "evenly" && "justify-evenly",
        wrap && "flex-wrap",
        className
      )}
      style={{ ...toBoxStyle(box), gap: toCssSize(gap) }}
    >
      {children}
    </div>
  );
}
