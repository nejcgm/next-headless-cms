import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import type { IframeProps } from "./types";

const aspectClass = {
  video: "aspect-video",
  map: "aspect-[4/3]",
  square: "aspect-square",
} as const;

export function IframeBlock({
  src,
  title,
  allowFullscreen = true,
  aspect = "map",
  className,
  ...box
}: IframeProps & { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-muted)]",
        aspectClass[aspect],
        className
      )}
      style={toBoxStyle(box)}
    >
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full border-0"
        allowFullScreen={allowFullscreen}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
