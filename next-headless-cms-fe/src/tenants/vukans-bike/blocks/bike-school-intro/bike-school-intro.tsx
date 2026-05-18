import type { BikeSchoolIntroProps } from "./types";
import { isExternalHref } from "@shared/utils/url";

export function BikeSchoolIntro({
  kicker,
  heading,
  subheading,
  dateRange,
  location,
  cta,
  secondaryCta,
}: BikeSchoolIntroProps) {
  const ctaIsExternal = isExternalHref(cta.href);
  const secondaryIsExternal = secondaryCta ? isExternalHref(secondaryCta.href) : false;
  return (
    <section className="py-16 md:py-24 px-4 bg-[var(--color-background)]">
      <div className="max-w-5xl mx-auto text-center">
        {kicker && (
          <p className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide mb-3">
            {kicker}
          </p>
        )}

        <h2 className="font-heading text-4xl md:text-5xl font-bold text-[var(--color-foreground)] mb-4">
          {heading}
        </h2>

        {subheading && (
          <p className="text-[var(--color-muted-foreground)] text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
            {subheading}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
            </svg>
            {dateRange}
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-muted)] text-[var(--color-foreground)] font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={cta.href}
            target={ctaIsExternal ? "_blank" : undefined}
            rel={ctaIsExternal ? "noopener noreferrer" : undefined}
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-7 py-3 rounded-[var(--radius)] font-semibold hover:opacity-90 transition-opacity"
          >
            {cta.label}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7m0 0v7m0-7L10 14" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v14h14" />
            </svg>
          </a>
          {secondaryCta && (
            <a
              href={secondaryCta.href}
              target={secondaryIsExternal ? "_blank" : undefined}
              rel={secondaryIsExternal ? "noopener noreferrer" : undefined}
              className="inline-flex items-center justify-center px-7 py-3 rounded-[var(--radius)] border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors font-semibold"
            >
              {secondaryCta.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
