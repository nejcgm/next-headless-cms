import type { CSSProperties } from "react";
import { z } from "zod";
import { resolveColor } from "./color";

export const boxStyleSchema = z.object({
  width: z.string().optional(),
  height: z.string().optional(),
  minHeight: z.string().optional(),
  maxWidth: z.string().optional(),
  padding: z.string().optional(),
  margin: z.string().optional(),
  backgroundColor: z.string().optional(),
  color: z.string().optional(),
  border: z.string().optional(),
  borderRadius: z.string().optional(),
  overflow: z.enum(["visible", "hidden", "auto"]).optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
});

export type BoxStyle = z.infer<typeof boxStyleSchema>;

export function toBoxStyle(props: BoxStyle): CSSProperties {
  const style: CSSProperties = {};
  if (props.width) style.width = props.width;
  if (props.height) style.height = props.height;
  if (props.minHeight) style.minHeight = props.minHeight;
  if (props.maxWidth) style.maxWidth = props.maxWidth;
  if (props.padding) style.padding = props.padding;
  if (props.margin) style.margin = props.margin;
  if (props.backgroundColor) {
    style.backgroundColor = resolveColor(props.backgroundColor);
  }
  if (props.color) style.color = resolveColor(props.color);
  if (props.border) style.border = props.border;
  if (props.borderRadius) style.borderRadius = props.borderRadius;
  if (props.overflow) style.overflow = props.overflow;
  if (props.fontSize) style.fontSize = props.fontSize;
  if (props.fontWeight) style.fontWeight = props.fontWeight;
  if (props.textAlign) style.textAlign = props.textAlign;
  return style;
}
