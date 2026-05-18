import Image from "next/image";
import type { PartnersGalleryProps, Partner } from "./types";

function PartnerCard({ partner, defaultPartnerLinkLabel }: { partner: Partner; defaultPartnerLinkLabel: string }) {
  const content = (
    <div className="group relative h-full w-full min-w-0">
      {/* Dark card */}
      <div className="relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-neutral-700/80 bg-neutral-800/80 shadow-xl transition-all duration-300 ease-out hover:border-[var(--color-primary)]/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
        {/* Subtle gradient accent at top */}
        <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* External link indicator */}
        {partner.url && (
          <div className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-[var(--color-primary)] group-hover:text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        )}

        {/* Fixed-size image area — same aspect on every card */}
        <div className="relative aspect-[16/10] w-full min-w-0 shrink-0 overflow-hidden border-b border-neutral-700 bg-neutral-900/80 transition-colors duration-300 group-hover:border-neutral-600">
          <div className="absolute inset-4">
            <Image
              src={partner.icon}
              alt={partner.name}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col flex-1">
          <h3 className="font-heading text-xl font-bold text-white mb-3 text-center tracking-tight group-hover:text-[var(--color-primary)] transition-colors duration-300">
            {partner.name}
          </h3>
          <p className="text-neutral-400 leading-relaxed text-[15px] text-center">
            {partner.about}
          </p>

          {partner.url && (
            <div className="mt-6 pt-4 border-t border-neutral-700 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]">
                {partner.linkLabel ?? defaultPartnerLinkLabel}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (partner.url) {
    return (
      <a
        href={partner.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full w-full min-w-0"
      >
        {content}
      </a>
    );
  }

  return <div className="h-full w-full min-w-0">{content}</div>;
}

export function PartnersGallery({
  eyebrowBadge,
  defaultPartnerLinkLabel,
  heading,
  subheading,
  partners,
}: PartnersGalleryProps) {
  return (
    <section className="py-20 md:py-28 px-4 bg-neutral-950">
      <div className="max-w-6xl mx-auto">
        {/* Header — dark mode */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 text-neutral-400 text-sm font-medium mb-6 border border-neutral-700/80">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {eyebrowBadge}
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            {heading}
          </h2>
          {subheading && (
            <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {subheading}
            </p>
          )}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="w-12 h-px bg-neutral-700" />
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
            <div className="w-12 h-px bg-neutral-700" />
          </div>
        </div>

        {/* Partners grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} defaultPartnerLinkLabel={defaultPartnerLinkLabel} />
          ))}
        </div>
      </div>
    </section>
  );
}
