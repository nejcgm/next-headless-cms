import type { CSSProperties, ReactNode } from "react";
import { cn } from "@shared/utils/cn";
import { toBoxStyle, toCssSize } from "@shared/utils/box-style";
import type { SectionProps } from "./types";

const DEFAULT_PADDING_BLOCK = "48px";

const HERO_MIN_HEIGHT = {
  standard: "clamp(480px, 72vh, 720px)",
  tall: "clamp(520px, 82vh, 820px)",
} as const;

const BG_POSITION_CLASS = {
  center: "bg-center",
  top: "bg-top",
  bottom: "bg-bottom",
  left: "bg-left",
  right: "bg-right",
} as const;

const DIVIDER_BORDER = "1px solid var(--color-border)";

function dividerStyle(divider: SectionProps["divider"]): CSSProperties {
  const style: CSSProperties = {};
  if (divider === "top" || divider === "both") style.borderTop = DIVIDER_BORDER;
  if (divider === "bottom" || divider === "both") style.borderBottom = DIVIDER_BORDER;
  return style;
}

export function Section({
  padding,
  backgroundImage,
  backgroundFit = "cover",
  backgroundPosition = "center",
  overlay,
  anchorId,
  surface,
  minHeight,
  width = "contained",
  divider,
  overflow,
  children,
  className,
  ...box
}: SectionProps & { children?: ReactNode; className?: string }) {
  const paddingBlock = toCssSize(padding) ?? DEFAULT_PADDING_BLOCK;
  const contentWidthClass = width === "full" ? "w-full" : "max-w-6xl mx-auto w-full";

  const boxStyle: CSSProperties = {
    ...toBoxStyle(box),
    ...dividerStyle(divider),
    ...(overflow ? { overflow } : {}),
  };
  if (minHeight) boxStyle.minHeight = HERO_MIN_HEIGHT[minHeight];

  const fillStyle: CSSProperties = {
    ...toBoxStyle({ ...box, backgroundColor: surface ?? "background" }),
    ...dividerStyle(divider),
    ...(overflow ? { overflow } : {}),
    paddingBlock,
  };

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
            "absolute inset-0 bg-black bg-no-repeat",
            backgroundFit === "contain" ? "bg-contain" : "bg-cover",
            BG_POSITION_CLASS[backgroundPosition]
          )}
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        {overlay != null && overlay > 0 && (
          <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
        )}
        <div
          className={cn(
            "relative z-10 max-w-4xl mx-auto px-4 text-center text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_p]:text-white/90",
            width === "full" ? "w-full" : undefined
          )}
          style={{ paddingBlock }}
        >
          {children}
        </div>
      </section>
    );
  }

  return (
    <section
      id={anchorId}
      className={cn("px-4", className)}
      style={fillStyle}
    >
      <div className={contentWidthClass}>{children}</div>
    </section>
  );
}
