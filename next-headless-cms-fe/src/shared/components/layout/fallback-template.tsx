import type { TemplateProps } from "@core/types/page";

/** Fallback when a template file is missing, or for `"template": "bare"` (no header/footer). */
export default function FallbackTemplate({ children }: TemplateProps) {
  return <div className="flex flex-col min-h-screen">{children}</div>;
}
