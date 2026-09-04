import Image from "next/image";
import { cn } from "@shared/utils/cn";
import { toBoxStyle } from "@shared/utils/box-style";
import type { ImageBlockProps } from "./types";

export function ImageBlock({
  src,
  alt = "",
  fit = "cover",
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
        className={fit === "contain" ? "object-contain" : "object-cover"}
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
    </div>
  );
}
