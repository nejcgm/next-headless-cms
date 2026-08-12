import { cn } from "@shared/utils/cn";
import { isExternalHref } from "@shared/utils/url";

interface CtaBannerProps {
  heading: string;
  subheading?: string;
  cta: { label: string; href: string };
  background?: "primary" | "muted" | "dark";
}

export function CtaBanner({ heading, subheading, cta, background = "primary" }: CtaBannerProps) {
  const ctaIsExternal = isExternalHref(cta.href);
  const bgClass = {
    primary: "bg-[var(--color-primary)] text-white",
    muted: "bg-[var(--color-muted)] text-[var(--color-foreground)]",
    dark: "bg-[#0F0F11] text-white",
  }[background];

  return (
    <section className={cn("py-20 px-4 text-center", bgClass)}>
      <div className="max-w-2xl mx-auto">
        <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">{heading}</h2>
        {subheading && <p className="text-lg mb-8 opacity-80">{subheading}</p>}
        <a
          href={cta.href}
          target={ctaIsExternal ? "_blank" : undefined}
          rel={ctaIsExternal ? "noopener noreferrer" : undefined}
          className="inline-block bg-white text-gray-900 hover:bg-opacity-90 px-8 py-4 rounded-[var(--radius)] font-semibold transition-opacity"
        >
          {cta.label}
        </a>
      </div>
    </section>
  );
}
