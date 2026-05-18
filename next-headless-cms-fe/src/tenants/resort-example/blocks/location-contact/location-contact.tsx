interface LocationContactProps {
  title?: string;
  address?: {
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  mapEmbedUrl?: string;
  directionsLink?: string;
  openingHours?: Array<{
    day: string;
    hours: string;
  }>;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
}

export function LocationContact({
  title = "Find Us",
  address,
  phone,
  email,
  mapEmbedUrl,
  directionsLink,
  openingHours,
  socialLinks,
}: LocationContactProps) {
  return (
    <section className="py-16 px-4 bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-8 text-center">
          {title}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {/* Address */}
            {address && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">Address</h3>
                  <p className="text-[var(--color-muted-foreground)]">
                    {address.street && <span className="block">{address.street}</span>}
                    {address.city && address.zip && (
                      <span className="block">{address.zip} {address.city}</span>
                    )}
                    {address.country && <span className="block">{address.country}</span>}
                  </p>
                  {directionsLink && (
                    <a
                      href={directionsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-primary)] hover:underline text-sm mt-2 inline-block"
                    >
                      Get Directions →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Phone */}
            {phone && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">Phone</h3>
                  <a href={`tel:${phone}`} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]">
                    {phone}
                  </a>
                </div>
              </div>
            )}

            {/* Email */}
            {email && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">Email</h3>
                  <a href={`mailto:${email}`} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]">
                    {email}
                  </a>
                </div>
              </div>
            )}

            {/* Opening Hours */}
            {openingHours && openingHours.length > 0 && (
              <div className="pt-6 border-t border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Reception Hours</h3>
                <div className="space-y-2">
                  {openingHours.map((h, i) => (
                    <div key={`${h.day}-${i}`} className="flex justify-between text-sm">
                      <span className="text-[var(--color-muted-foreground)]">{h.day}</span>
                      <span className="text-[var(--color-text-primary)] font-medium">{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="pt-6 border-t border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Follow Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map((link, i) => (
                    <a
                      key={`${link.platform}-${i}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[var(--color-muted)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                    >
                      <span className="text-sm font-semibold">{link.platform[0]}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="aspect-square lg:aspect-auto lg:h-full min-h-[400px] rounded-[var(--radius)] overflow-hidden bg-[var(--color-muted)]">
            {mapEmbedUrl ? (
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-[var(--color-muted-foreground)]">Map loading...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
