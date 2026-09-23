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
  backgroundImage,
  overlay,
  anchorId,
  overflow,
  children,
  className,
  ...box
}: FlexProps & { children?: ReactNode; className?: string }) {
  const hasFill = Boolean(backgroundImage);
  const layoutClass = cn(
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
    wrap && "flex-wrap"
  );
  const clipOverflow = overflow ?? (backgroundImage ? "hidden" : undefined);
  const gapStyle = toCssSize(gap);
  const outerStyle = toBoxStyle({
    ...box,
    padding: hasFill ? undefined : box.padding,
    overflow: clipOverflow,
  });

  if (hasFill) {
    return (
      <div id={anchorId} className={cn("relative", className)} style={outerStyle}>
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          {overlay != null && overlay > 0 ? (
            <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
          ) : null}
        </div>
        <div
          className={cn(layoutClass, "relative z-10 h-full w-full")}
          style={{ gap: gapStyle, ...(box.padding ? { padding: box.padding } : {}) }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      id={anchorId}
      className={cn(layoutClass, className)}
      style={{ ...outerStyle, gap: gapStyle }}
    >
      {children}
    </div>
  );
}
