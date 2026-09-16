import type { ReactNode } from "react";
import { cn } from "@shared/utils/cn";
import { toBoxStyle, toCssSize } from "@shared/utils/box-style";
import type { GridColumnCount, GridProps } from "./types";

const colsClass: Record<GridColumnCount, string> = {
  "1": "grid-cols-1",
  "2": "grid-cols-2",
  "3": "grid-cols-3",
  "4": "grid-cols-4",
};

const mdColsClass: Record<GridColumnCount, string> = {
  "1": "md:grid-cols-1",
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-3",
  "4": "md:grid-cols-4",
};

const lgColsClass: Record<GridColumnCount, string> = {
  "1": "lg:grid-cols-1",
  "2": "lg:grid-cols-2",
  "3": "lg:grid-cols-3",
  "4": "lg:grid-cols-4",
};

export function Grid({
  columnsMobile = "1",
  columnsTablet,
  columnsDesktop,
  gap = "16",
  children,
  className,
  ...box
}: GridProps & { children?: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid",
        colsClass[columnsMobile],
        columnsTablet && mdColsClass[columnsTablet],
        columnsDesktop && lgColsClass[columnsDesktop],
        className
      )}
      style={{ ...toBoxStyle(box), gap: toCssSize(gap) }}
    >
      {children}
    </div>
  );
}
