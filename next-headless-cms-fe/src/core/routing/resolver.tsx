import type { TemplateProps } from "@core/types/page";

export type TemplateComponent = (props: TemplateProps) => React.ReactNode;

export async function resolveTemplate(templateName: string): Promise<TemplateComponent> {
  try {
    const mod = await import(`@tenant/templates/${templateName}`);
    return mod.default as TemplateComponent;
  } catch {
    const { default: FallbackTemplate } = await import(
      "@shared/components/layout/fallback-template"
    );
    return FallbackTemplate;
  }
}
