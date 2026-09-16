import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import type { IframeProps } from "./types";

const ASPECT_CLASS = {
  auto: "aspect-auto",
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "21:9": "aspect-[21/9]",
} as const;

export function IframeBlock({
  src,
  title,
  allowFullscreen = true,
  aspect = "4:3",
  className,
  ...box
}: IframeProps & { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-muted)]",
        ASPECT_CLASS[aspect],
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
