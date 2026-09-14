import type { CSSProperties } from "react";
import { z } from "zod";
import { resolveColor } from "./color";

const colorTokenSchema = z.enum([
  "primary",
  "secondary",
  "accent",
  "background",
  "foreground",
  "muted",
  "border",
  "text-primary",
]);

const borderStyleSchema = z.enum(["none", "hairline", "invertedOutline"]);

const BORDER_CSS: Record<z.infer<typeof borderStyleSchema>, string> = {
  none: "none",
  hairline: "1px solid var(--color-border)",
  invertedOutline: "2px solid var(--color-background)",
};

// Every field is `.nullish()` (accepts `undefined` *or* `null`), not just `.optional()`:
// Strapi's REST API always returns every schema attribute on a root dynamic-zone block,
// using `null` for anything unset (mock JSON, by contrast, simply omits the key).
export const boxStyleSchema = z.object({
  width: z.string().nullish(),
  height: z.string().nullish(),
  maxWidth: z.string().nullish(),
  padding: z.string().nullish(),
  margin: z.string().nullish(),
  backgroundColor: colorTokenSchema.nullish(),
  color: colorTokenSchema.nullish(),
  border: borderStyleSchema.nullish(),
  dividerTop: z.boolean().nullish(),
  fullWidth: z.boolean().nullish(),
  borderRadius: z.string().nullish(),
  overflow: z.enum(["visible", "hidden", "auto"]).nullish(),
  fontSize: z.string().nullish(),
  fontWeight: z.string().nullish(),
  textAlign: z.enum(["left", "center", "right"]).nullish(),
});

export type BoxStyle = z.infer<typeof boxStyleSchema>;

export function toBoxStyle(props: BoxStyle): CSSProperties {
  const style: CSSProperties = {};
  if (props.width) style.width = props.width;
  if (props.height) style.height = props.height;
  if (props.maxWidth) style.maxWidth = props.maxWidth;
  if (props.padding) style.padding = props.padding;
  if (props.margin) style.margin = props.margin;
  if (props.backgroundColor) {
    style.backgroundColor = resolveColor(props.backgroundColor);
  }
  if (props.color) style.color = resolveColor(props.color);
  if (props.border) style.border = BORDER_CSS[props.border];
  if (props.dividerTop) style.borderTop = "1px solid var(--color-border)";
  if (props.fullWidth) style.width = "100%";
  if (props.borderRadius) style.borderRadius = props.borderRadius;
  if (props.overflow) style.overflow = props.overflow;
  if (props.fontSize) style.fontSize = props.fontSize;
  if (props.fontWeight) style.fontWeight = props.fontWeight;
  if (props.textAlign) style.textAlign = props.textAlign;
  return style;
}
