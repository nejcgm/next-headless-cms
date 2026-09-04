import type { CSSProperties, ReactNode } from "react";
import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import type { SectionProps } from "./types";

const justifyMap = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
} as const;

const alignMap = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
} as const;

export function Section({
  padding = "md",
  backgroundImage,
  backgroundFit = "cover",
  overlay,
  anchorId,
  surface,
  backgroundColor,
  justify,
  align,
  children,
  className,
  ...box
}: SectionProps & { children?: ReactNode; className?: string }) {
  const paddingClass =
    padding === "sm" ? "py-8" : padding === "lg" ? "py-20" : "py-12";

  const boxStyle = toBoxStyle(box);
  const fillStyle: CSSProperties = {
    ...toBoxStyle({
      ...box,
      backgroundColor: backgroundColor ?? surface ?? "default",
    }),
  };

  if (justify || align) {
    fillStyle.display = "flex";
    fillStyle.flexDirection = "column";
    if (justify) fillStyle.justifyContent = justifyMap[justify];
    if (align) fillStyle.alignItems = alignMap[align];
  }

  if (backgroundImage) {
    return (
      <section
        id={anchorId}
        className={cn(
          "relative flex items-center justify-center overflow-hidden min-h-[70vh]",
          className
        )}
        style={boxStyle}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black bg-center bg-no-repeat",
            backgroundFit === "contain" ? "bg-contain" : "bg-cover"
          )}
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        {overlay != null && overlay > 0 && (
          <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
        )}
        <div
          className={cn(
            "relative z-10 w-full max-w-4xl mx-auto px-4 text-center text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_p]:text-white/90",
            paddingClass
          )}
        >
          {children}
        </div>
      </section>
    );
  }

  return (
    <section
      id={anchorId}
      className={cn("px-4", paddingClass, className)}
      style={fillStyle}
    >
      <div className="max-w-6xl mx-auto w-full">{children}</div>
    </section>
  );
}
