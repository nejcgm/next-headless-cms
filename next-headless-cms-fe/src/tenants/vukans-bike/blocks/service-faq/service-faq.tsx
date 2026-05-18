"use client";

import { useState } from "react";
import type { ServiceFaqProps, FaqItem } from "./types";
import { isExternalHref } from "@shared/utils/url";

function FaqAccordion({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-[var(--color-border)] rounded-[var(--radius)] overflow-hidden bg-[var(--color-muted)]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--color-muted)]/30 transition-colors"
      >
        <span className="font-semibold text-[var(--color-foreground)] pr-4">
          {item.question}
        </span>
        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isOpen ? "bg-[var(--color-primary)] text-white rotate-180" : "bg-[var(--color-muted)] text-[var(--color-foreground)]"
        }`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}>
        <div className="p-5 pt-2 text-[var(--color-muted-foreground)] border-t border-[var(--color-border)]">
          {item.answer}
        </div>
      </div>
    </div>
  );
}

export function ServiceFaq({ heading, subheading, items, contactCta }: ServiceFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ctaIsExternal = contactCta ? isExternalHref(contactCta.href) : false;

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 bg-[var(--color-muted)]/20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-4">
            {heading}
          </h2>
          {subheading && (
            <p className="text-[var(--color-muted-foreground)] text-lg">
              {subheading}
            </p>
          )}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <FaqAccordion
              key={`${item.question}-${index}`}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        {contactCta && (
          <div className="mt-12 text-center p-6 bg-[var(--color-muted)] rounded-[var(--radius)] border border-[var(--color-border)]">
            <p className="text-[var(--color-muted-foreground)] mb-3">{contactCta.text}</p>
            <a
              href={contactCta.href}
              target={ctaIsExternal ? "_blank" : undefined}
              rel={ctaIsExternal ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 text-[var(--color-primary)] font-semibold hover:underline"
            >
              {contactCta.label}
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
