import type { BikeSchoolProgramProps } from "./types";

export function BikeSchoolProgram({ heading, subheading, items }: BikeSchoolProgramProps) {
  return (
    <section id="program" className="py-16 md:py-24 px-4 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-14">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-3">
            {heading}
          </h2>
          {subheading && (
            <p className="text-[var(--color-muted-foreground)] text-lg max-w-3xl mx-auto">
              {subheading}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {items.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="group relative h-full rounded-2xl border border-neutral-800 bg-neutral-900 p-6 md:p-7 shadow-sm hover:shadow-lg hover:border-[var(--color-primary)]/40 transition-all duration-300"
            >
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[var(--color-primary)]/80 to-[var(--color-primary)]/40 opacity-60 group-hover:opacity-100 transition-opacity" />

              <div className="pt-2">
                <div className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-3">
                  {item.level}
                </div>

                <h3 className="font-heading text-2xl font-bold text-[var(--color-foreground)] mb-2">
                  {item.title}
                </h3>

                <p className="text-[var(--color-muted-foreground)] mb-5 leading-relaxed">
                  {item.description}
                </p>

                <ul className="space-y-2.5 mb-6">
                  {item.bullets.map((bullet, bulletIndex) => (
                    <li key={`${bullet}-${bulletIndex}`} className="flex items-start gap-2.5 text-sm text-[var(--color-foreground)]">
                      <span className="mt-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)]/10 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {item.ctaHref && item.ctaLabel && (
                  <a
                    href={item.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border border-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                  >
                    {item.ctaLabel}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7m0 0v7m0-7L10 14" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v14h14" />
                    </svg>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
