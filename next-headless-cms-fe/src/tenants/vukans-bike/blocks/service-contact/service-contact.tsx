import type { ServiceContactProps } from "./types";

export function ServiceContact({
  heading,
  text,
  phone,
  phoneHref,
  email,
  emailHref,
  ctaText,
}: ServiceContactProps) {
  const tel = phoneHref ?? phone.replace(/\s/g, "");
  const mailto = emailHref ?? email;

  return (
    <section id="kontakt" className="py-16 px-4 bg-[var(--color-background)]">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-heading text-3xl font-bold text-[var(--color-foreground)] mb-4">
          {heading}
        </h2>
        {text && (
          <p className="text-[var(--color-muted-foreground)] text-lg mb-8">
            {text}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <a
            href={`tel:${tel}`}
            className="inline-flex items-center gap-3 px-6 py-4 bg-[var(--color-primary)] text-white font-semibold rounded-[var(--radius)] hover:bg-[var(--color-primary)]/90 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {phone}
          </a>
          <a
            href={`mailto:${mailto}`}
            className="inline-flex items-center gap-3 px-6 py-4 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold rounded-[var(--radius)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {ctaText ?? email}
          </a>
        </div>

        <p className="mt-6 text-sm text-[var(--color-muted-foreground)]">
          {phone} · <a href={`mailto:${mailto}`} className="text-[var(--color-primary)] hover:underline">{email}</a>
        </p>
      </div>
    </section>
  );
}
