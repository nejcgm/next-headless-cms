import Image from "next/image";
import type { AboutPersonProps } from "./types";
import { isExternalHref } from "@shared/utils/url";

export function AboutPerson({ image, name, role, bio, cta }: AboutPersonProps) {
  const ctaIsExternal = cta ? isExternalHref(cta.href) : false;
  return (
    <section className="py-16 md:py-24 px-4 bg-[var(--color-background)]">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
          {image && (
            <div className="relative h-48 w-48 flex-shrink-0 overflow-hidden rounded-full border-4 border-[var(--color-primary)]/20 bg-[var(--color-muted)] md:h-56 md:w-56">
              <Image src={image} alt={name} fill className="object-cover" sizes="224px" />
            </div>
          )}
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide mb-1">
              {role}
            </p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-foreground)] mb-3">
              {name}
            </h2>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-6">
              {bio}
            </p>
            {cta && (
              <a
                href={cta.href}
                target={ctaIsExternal ? "_blank" : undefined}
                rel={ctaIsExternal ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-[var(--radius)] hover:opacity-90 transition-opacity"
              >
                {cta.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
