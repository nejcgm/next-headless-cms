import type { ReactNode } from "react";
import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import type { GridColumns, GridProps } from "./types";

const gapClass = { sm: "gap-2", md: "gap-4", lg: "gap-8" } as const;

const colsClass: Record<1 | 2 | 3 | 4, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

const mdColsClass: Record<1 | 2 | 3 | 4, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

const lgColsClass: Record<1 | 2 | 3 | 4, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

function resolveColumns(columns: GridColumns | undefined): {
  mobile: 1 | 2 | 3 | 4;
  tablet?: 1 | 2 | 3 | 4;
  desktop?: 1 | 2 | 3 | 4;
} {
  if (columns == null) {
    return { mobile: 1, tablet: 2 };
  }
  if (typeof columns === "number") {
    if (columns === 4) return { mobile: 2, tablet: 4 };
    if (columns === 3) return { mobile: 1, tablet: 3 };
    return { mobile: 1, tablet: columns };
  }
  return columns;
}

export function Grid({
  columns = 2,
  gap = "md",
  children,
  className,
  ...box
}: GridProps & { children?: ReactNode; className?: string }) {
  const resolved = resolveColumns(columns);

  return (
    <div
      className={cn(
        "grid",
        colsClass[resolved.mobile],
        resolved.tablet != null && mdColsClass[resolved.tablet],
        resolved.desktop != null && lgColsClass[resolved.desktop],
        gapClass[gap],
        className
      )}
      style={toBoxStyle(box)}
    >
      {children}
    </div>
  );
}
