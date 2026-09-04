export function resolveColor(
  value: string | undefined,
  fallbackToken = "background"
): string {
  if (!value || value === "default") {
    return `var(--color-${fallbackToken})`;
  }
  if (
    value.startsWith("#") ||
    value.startsWith("rgb") ||
    value.startsWith("hsl") ||
    value === "transparent" ||
    value === "currentColor" ||
    value === "inherit"
  ) {
    return value;
  }
  return `var(--color-${value})`;
}

/** @deprecated use resolveColor */
export const resolveBackgroundColor = resolveColor;
