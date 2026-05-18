import { isExternalHref } from "@shared/utils/url";

interface HeroProps {
  headline: string;
  subheadline?: string;
  backgroundImage: string;
  overlay?: number;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function Hero({ headline, subheadline, backgroundImage, cta, secondaryCta, overlay = 0.3 }: HeroProps) {
  const ctaIsExternal = isExternalHref(cta.href);
  const secondaryIsExternal = secondaryCta ? isExternalHref(secondaryCta.href) : false;
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlay }}
      />
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 leading-tight">
          {headline}
        </h1>
        {subheadline && (
          <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto">
            {subheadline}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={cta.href}
            target={ctaIsExternal ? "_blank" : undefined}
            rel={ctaIsExternal ? "noopener noreferrer" : undefined}
            className="bg-[var(--color-primary)] hover:opacity-90 text-white px-8 py-4 rounded-[var(--radius)] font-semibold transition-opacity"
          >
            {cta.label}
          </a>
          {secondaryCta && (
            <a
              href={secondaryCta.href}
              target={secondaryIsExternal ? "_blank" : undefined}
              rel={secondaryIsExternal ? "noopener noreferrer" : undefined}
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-[var(--radius)] font-semibold transition-colors"
            >
              {secondaryCta.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
