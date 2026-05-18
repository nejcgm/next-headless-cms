import type { GuidedTourExperienceProps } from "./types";

const iconMap = {
  route: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V4.618a1 1 0 011.553-.832L9 6m0 14l6-3m-6-11v14m6-3l5.447 2.724A1 1 0 0021 18.382V6.618a1 1 0 00-.553-.894L15 3m0 14V3" />
    </svg>
  ),
  coach: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c4.418 0 8-1.79 8-4s-3.582-4-8-4-8 1.79-8 4 3.582 4 8 4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10v4c0 2.21 3.582 4 8 4s8-1.79 8-4v-4" />
    </svg>
  ),
  group: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a3 3 0 11-6 0 3 3 0 016 0zM21 10a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  safety: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
} as const;

export function GuidedTourExperience({ heading, subheading, items }: GuidedTourExperienceProps) {
  return (
    <section className="py-16 md:py-24 px-4 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-3">
            {heading}
          </h2>
          {subheading && (
            <p className="text-[var(--color-muted-foreground)] text-lg max-w-3xl mx-auto">
              {subheading}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 hover:border-[var(--color-primary)]/40 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[var(--color-primary)]/15 text-[var(--color-primary)] mb-4">
                {iconMap[item.icon]}
              </div>
              <h3 className="font-heading text-lg font-bold text-[var(--color-foreground)] mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
