import type { ComponentType } from "react";

export async function resolveTemplate(
  templateName: string
): Promise<ComponentType<any>> {
  try {
    const mod = await import(`@tenant/templates/${templateName}`);
    return mod.default;
  } catch {
    try {
      const fallback = await import(`../../shared/components/layout/default-template`);
      return fallback.default;
    } catch {
      return DefaultTemplate;
    }
  }
}

function DefaultTemplate({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col min-h-screen">{children}</div>;
}
