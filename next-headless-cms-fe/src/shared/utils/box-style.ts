import type { CSSProperties } from "react";
import { z } from "zod";
import { logger } from "@shared/lib/logger";
import { resolveColor } from "./color";

export const COLOR_TOKENS = [
  "primary",
  "secondary",
  "accent",
  "background",
  "foreground",
  "muted",
  "border",
  "text-primary",
] as const;

const colorTokenSchema = z.enum(COLOR_TOKENS);

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const colorValueSchema = z.union([
  colorTokenSchema,
  z.string().regex(HEX_COLOR_PATTERN, "must be a theme color name or a hex code like #RRGGBB"),
]);

export const BORDER_STYLES = ["solid", "dashed", "dotted"] as const;

export const boxStyleSchema = z.object({
  width: z.string().nullish(),
  height: z.string().nullish(),
  minWidth: z.string().nullish(),
  minHeight: z.string().nullish(),
  maxWidth: z.string().nullish(),
  maxHeight: z.string().nullish(),
  padding: z.string().nullish(),
  margin: z.string().nullish(),
  backgroundColor: colorValueSchema.nullish(),
  color: colorValueSchema.nullish(),
  borderWidth: z.number().nullish(),
  borderStyle: z.enum(BORDER_STYLES).nullish(),
  borderColor: colorValueSchema.nullish(),
  borderRadius: z.string().nullish(),
  overflow: z.enum(["visible", "hidden", "auto"]).nullish(),
  fontSize: z.string().nullish(),
  fontWeight: z.string().nullish(),
  textAlign: z.enum(["left", "center", "right"]).nullish(),
});

export type BoxStyle = z.infer<typeof boxStyleSchema>;

const SIZE_PATTERN = /^\d+(\.\d+)?%?$/;

export function toCssSize(value: string | null | undefined): string | undefined {
  if (value == null || value === "") return undefined;
  const trimmed = value.trim();
  if (!SIZE_PATTERN.test(trimmed)) {
    if (process.env.NODE_ENV === "development") {
      logger.warn(`toCssSize: unsupported sizing value ignored`, { value });
    }
    return undefined;
  }
  return trimmed.endsWith("%") ? trimmed : `${trimmed}px`;
}

export function toBoxStyle(props: BoxStyle): CSSProperties {
  const style: CSSProperties = {};
  const width = toCssSize(props.width);
  if (width) style.width = width;
  const height = toCssSize(props.height);
  if (height) style.height = height;
  const minWidth = toCssSize(props.minWidth);
  if (minWidth) style.minWidth = minWidth;
  const minHeight = toCssSize(props.minHeight);
  if (minHeight) style.minHeight = minHeight;
  const maxWidth = toCssSize(props.maxWidth);
  if (maxWidth) style.maxWidth = maxWidth;
  const maxHeight = toCssSize(props.maxHeight);
  if (maxHeight) style.maxHeight = maxHeight;
  if (props.padding) style.padding = props.padding;
  if (props.margin) style.margin = props.margin;
  if (props.backgroundColor) {
    style.backgroundColor = resolveColor(props.backgroundColor);
  }
  if (props.color) style.color = resolveColor(props.color);
  if (props.borderWidth) {
    style.border = `${props.borderWidth}px ${props.borderStyle ?? "solid"} ${resolveColor(props.borderColor, "border")}`;
  }
  if (props.borderRadius) style.borderRadius = props.borderRadius;
  if (props.overflow) style.overflow = props.overflow;
  if (props.fontSize) style.fontSize = props.fontSize;
  if (props.fontWeight) style.fontWeight = props.fontWeight;
  if (props.textAlign) style.textAlign = props.textAlign;
  return style;
}
