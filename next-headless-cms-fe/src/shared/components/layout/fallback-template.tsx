import type { TemplateProps } from "@core/types/page";

export default function FallbackTemplate({ children }: TemplateProps) {
  return <div className="flex flex-col min-h-screen">{children}</div>;
}
