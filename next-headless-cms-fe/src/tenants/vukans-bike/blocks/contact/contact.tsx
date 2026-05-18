import type { ContactProps, ContactAddress } from "./types";
import type { ContactLabels } from "./labels";

function AddressBlock({
  address,
  directionsLink,
  labels,
}: {
  address: ContactAddress;
  directionsLink: string;
  labels: ContactLabels;
}) {
  const line1 = [address.street].filter(Boolean).join(", ");
  const line2 = [address.postalCode, address.city].filter(Boolean).join(" ");
  const line3 = address.country;

  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div>
        <h3 className="font-semibold text-[var(--color-foreground)] mb-1">{labels.addressHeading}</h3>
        <p className="text-[var(--color-muted-foreground)]">
          {line1 && <span className="block">{line1}</span>}
          {line2 && <span className="block">{line2}</span>}
          {line3 && <span className="block">{line3}</span>}
        </p>
        <a
          href={directionsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-primary)] hover:underline text-sm mt-2 inline-flex items-center gap-1"
        >
          {labels.directionsLinkText}
        </a>
      </div>
    </div>
  );
}

export function Contact({
  labels,
  heading,
  subheading,
  address,
  directionsLink,
  mapEmbedUrl,
  phone,
  phoneHref,
  email,
  hoursNote,
}: ContactProps) {
  const tel = phoneHref ?? phone.replace(/\s/g, "");

  return (
    <section className="py-16 px-4 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-2">
            {heading}
          </h2>
          {subheading && (
            <p className="text-[var(--color-muted-foreground)] text-lg max-w-2xl mx-auto">
              {subheading}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact info */}
          <div className="space-y-6">
            <AddressBlock address={address} directionsLink={directionsLink} labels={labels} />

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-foreground)] mb-1">{labels.phoneHeading}</h3>
                <a href={`tel:${tel}`} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]">
                  {phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-foreground)] mb-1">{labels.emailHeading}</h3>
                <a href={`mailto:${email}`} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]">
                  {email}
                </a>
              </div>
            </div>

            {hoursNote && (
              <div className="pt-4 border-t border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-muted-foreground)]">{hoursNote}</p>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="flex flex-col gap-3">
            <div className="relative w-full aspect-[4/3] min-h-[260px] lg:min-h-[400px] lg:aspect-auto lg:flex-1 rounded-[var(--radius)] overflow-hidden bg-[var(--color-muted)] border border-[var(--color-border)]">
              {mapEmbedUrl ? (
                <iframe
                  src={mapEmbedUrl}
                  className="absolute inset-0 h-full w-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={labels.mapIframeTitle}
                />
              ) : (
                <a
                  href={directionsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center hover:bg-[var(--color-muted)]/80 transition-colors"
                >
                  <svg className="w-16 h-16 text-[var(--color-muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[var(--color-foreground)] font-medium">{labels.mapFallbackTitle}</span>
                  <span className="text-sm text-[var(--color-muted-foreground)]">
                    {address.street}, {address.postalCode} {address.city}
                  </span>
                </a>
              )}
            </div>
            {mapEmbedUrl && (
              <a
                href={directionsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-sm text-[var(--color-primary)] hover:underline"
              >
                {labels.mapFullscreenLink}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
