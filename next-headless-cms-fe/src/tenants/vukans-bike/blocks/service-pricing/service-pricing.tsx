import type { ServicePricingProps, ServicePackage } from "./types";
import { isExternalHref } from "@shared/utils/url";

function ServiceItem({ pkg }: { pkg: ServicePackage }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-4 p-5 md:p-6 bg-[var(--color-muted)] border border-[var(--color-border)] rounded-[var(--radius)] hover:border-[var(--color-primary)]/40 transition-colors">
      <div className="md:w-36 flex-shrink-0">
        <div className="text-2xl font-bold text-[var(--color-primary)] leading-tight">
          {pkg.priceDisplay ?? `€${pkg.price}`}
        </div>
        {pkg.priceNote && (
          <div className="text-sm text-[var(--color-muted-foreground)] mt-1">
            {pkg.priceNote}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {pkg.label && (
          <span className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide">
            {pkg.label}
          </span>
        )}
        <h3 className="font-heading text-lg font-bold text-[var(--color-foreground)] mt-1 mb-2">
          {pkg.name}
        </h3>
        <p className="text-[var(--color-muted-foreground)] text-sm mb-4">
          {pkg.description}
        </p>
        <ul className="space-y-1.5">
          {pkg.features.map((feature, i) => (
            <li key={`${feature}-${i}`} className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-shrink-0">
        <a
          href="#kontakt"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] border border-[var(--color-primary)] rounded-[var(--radius)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
        >
          Kontakt
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}

export function ServicePricing({
  heading,
  subheading,
  packages,
  note,
  contactCta,
  contactHref = "#kontakt",
}: ServicePricingProps) {
  const contactIsExternal = isExternalHref(contactHref);
  return (
    <section id="cenik" className="py-16 px-4 bg-[var(--color-background)]">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h2 className="font-heading text-3xl font-bold text-[var(--color-foreground)] mb-2">
            {heading}
          </h2>
          {subheading && (
            <p className="text-[var(--color-muted-foreground)]">
              {subheading}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {packages.map((pkg) => (
            <ServiceItem key={pkg.id} pkg={pkg} />
          ))}
        </div>

        {note && (
          <p className="mt-6 text-sm text-[var(--color-muted-foreground)]">
            {note}
          </p>
        )}

        {contactCta && (
          <div className="mt-8 text-center">
            <a
              href={contactHref}
              target={contactIsExternal ? "_blank" : undefined}
              rel={contactIsExternal ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 text-[var(--color-primary)] font-semibold hover:underline"
            >
              {contactCta}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
