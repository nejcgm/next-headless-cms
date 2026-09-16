import Image from "next/image";
import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import type { ImageBlockProps } from "./types";

const FIT_CLASS = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
  none: "object-none",
} as const;

const POSITION_CLASS = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
} as const;

export function ImageBlock({
  src,
  alt = "",
  fit = "cover",
  position = "center",
  className,
  ...box
}: ImageBlockProps & { className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] w-full",
        className
      )}
      style={toBoxStyle(box)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(FIT_CLASS[fit], POSITION_CLASS[position])}
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
    </div>
  );
}
